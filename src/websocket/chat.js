const WebSocket = require('ws')
const db = require('../db')
const TokenService = require('@services/auth/JWTService')
const removeBearer = require('../lib/removeBearer')
const PermissionError = require('../lib/PermissionError')

// Инициализируем доступ к таблицам chat и message
const chats = db('chat')
const messages = db('message')

// Хранилище активных клиентов: user_id -> ws
const clients = new Map()

// Инициализация WebSocket-сервера
function initializeWebSocket(server, address = 'ws://localhost:8800') {
    const wss = new WebSocket.Server({ server })
    console.log(`WebSocket server initialized on ${address}`)

    wss.on('connection', (ws, req) => {
        console.log(`Новый клиент подключился: ${req.url}`)
        const token = req.url.split('token=')[1] || null // Извлекаем токен из URL
        handleConnection(ws, token)
    })

    return wss
}

// Обработка нового подключения
function handleConnection(ws, token) {
    try {
        const clearToken = removeBearer(token) 
        if (!clearToken) throw PermissionError.unauthorized('Токен отсутствует')

        const verifiedToken = TokenService.verifyAccessToken(clearToken)
        if (verifiedToken.is_blocked) {
            throw PermissionError.unauthorized('Пользователь заблокирован')
        }
        ws.user_id = verifiedToken.sub
        clients.set(ws.user_id, ws)
        console.log('User authenticated:', ws.user_id)
    } catch (error) {
        console.error('Authentication error:', error.message)
        ws.send(JSON.stringify({ error: error.message || 'Unauthorized' }))
        ws.close()
        return
    }

    ws.on('message', (message) => handleMessage(ws, message))
    ws.on('close', () => handleDisconnect(ws))
}

// Обработка входящего сообщения
async function handleMessage(ws, message) {
    let data
    try {
        data = JSON.parse(message.toString())
    } catch (e) {
        console.error('Ошибка парсинга сообщения:', e)
        ws.send(JSON.stringify({ error: 'Некорректное сообщение' }))
        return
    }

    if (data.type === 'join_chat') {
        await handleJoinChat(ws, data)
    } else if (data.type === 'message') {
        await handleSendMessage(ws, data)
    }
}

// Обработка присоединения к чату
async function handleJoinChat(ws, data) {
    if (!ws.user_id) {
        ws.send(JSON.stringify({ error: 'Неавторизован' }))
        ws.close()
        return
    }

    const chatId = await getOrCreateChat(data.listing_id, ws.user_id, data.recipient_id)
    const messages = await loadChatHistory(chatId)
    ws.send(JSON.stringify(messages))
}

// Получение или создание чата
async function getOrCreateChat(listing_id, user1_id, user2_id) {

    const listingIdNum = parseInt(listing_id, 10)
    const user1IdNum = parseInt(user1_id, 10)
    const user2IdNum = parseInt(user2_id, 10)

    const sql = `SELECT id FROM chat 
         WHERE listing_id = $1 
         AND (
             (user1_id = $2 AND user2_id = $3) 
             OR (user1_id = $3 AND user2_id = $2)
         )`
    const values = [listingIdNum, user1IdNum, user2IdNum]

    const findedChat = (await chats.query(sql, values)).rows[0].id
           
    if (findedChat) {
       return findedChat
    } else {
        const newChat = await chats.create({
            listing_id: listingIdNum,
            user1_id: user1IdNum,
            user2_id: user2IdNum
        })
        return newChat[0].id
    }
}


// Загрузка истории сообщений
async function loadChatHistory(chatId) {
    
    const sql = 'SELECT user_id, message, file, created_at FROM message WHERE chat_id = $1 ORDER BY created_at DESC LIMIT 50'
    const values = [chatId]
        return (await messages.query(sql, values)).rows
}

// Обработка отправки сообщения
async function handleSendMessage(ws, data) {
    if (!ws.user_id) {
        ws.send(JSON.stringify({ error: 'Неавторизован' }))
        return
    }

    const chatId = await verifyChat(data.listing_id, ws.user_id, data.recipient_id)
    if (!chatId) {
        ws.send(JSON.stringify({ error: 'Чат не найден' }))
        return
    }

    const newMessage = await saveMessage(chatId, ws.user_id, data.message, data.file)
    const msg = {
        user_id: ws.user_id,
        message: data.message,
        file: data.file
    }
    sendToParticipants(ws.user_id, data.recipient_id, msg)
}

// Проверка существования чата
async function verifyChat(listing_id, user1_id, user2_id) {
    const listingIdNum = parseInt(listing_id, 10)
    const user1IdNum = parseInt(user1_id, 10)
    const user2IdNum = parseInt(user2_id, 10)

    const sql = `SELECT id FROM chat 
         WHERE listing_id = $1 
         AND (
             (user1_id = $2 AND user2_id = $3) 
             OR (user1_id = $3 AND user2_id = $2)
         )`
    const values = [listingIdNum, user1IdNum, user2IdNum]
    return (await chats.query(sql, values)).rows[0].id
}

// Сохранение сообщения в БД
async function saveMessage(chatId, user_id, message, file) {
    const newMessage = await messages.create({
        chat_id: chatId,
        user_id,
        message: message || null,
        file: file || null
    })
    return newMessage[0]
}

// Отправка сообщения участникам чата
function sendToParticipants(userId, recipientId, msg) {
    [userId, recipientId].forEach((id) => {
        const clientWs = clients.get(id)
        if (clientWs && clientWs.readyState === WebSocket.OPEN) {
            clientWs.send(JSON.stringify(msg))
        }
    })
}

// Обработка отключения клиента
function handleDisconnect(ws) {
    console.log('Клиент отключился:', ws.user_id)
    clients.delete(ws.user_id)
}

module.exports = { initializeWebSocket }