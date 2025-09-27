'use strict'
const errorHandler = require('../../lib/errorHandler')
const db = require('../../db')
const orders = db('orders')
const dishes = db('dish')
const throwValidationError = require('../../lib/ValidationError')
const safeDbCall = require('../../lib/safeDbCall')

const validateRequiredFields = (args, requiredFields) => {
  for (const field of requiredFields) {
    if (!args[field] || args[field].trim() === '') {
      throwValidationError(`Поле ${field} отсутствует`)
    }
  }
  
  if (!Array.isArray(args.dishes) || args.dishes.length === 0) {
    throwValidationError('Dishes должен быть непустым массивом')
  }
}

const validateSizeForDish = (inputSize, dish) => {
  if (!inputSize) {
    return null
  }

  const size = inputSize.toString().trim()

  // Проверяем, поддерживается ли размер в JSONB
  if (!dish.size || typeof dish.size !== 'object' || !(size in dish.size)) {
    const availableSizes = Object.keys(dish.size || {}).join(', ') || 'нет доступных'
    throwValidationError(`Неверный размер для блюда "${dish.name}". Доступные: ${availableSizes}`)
  }

  return size
}

const createOrder = async (args) => {
  const requiredFields = ['phone']

  validateRequiredFields(args, requiredFields)

  const orderedDishes = []

  let totalPrice = 0

  for (const oneDish of args.dishes) {
    const { id, quantity, size: inputSize } = oneDish

    const dishIdNum = parseInt(id)
    const quantityNum = parseInt(quantity)
    if (isNaN(dishIdNum) || isNaN(quantityNum) || quantityNum <= 0) {
      throwValidationError(`Неверные данные для блюда: dishId=${dishId}, quantity=${quantity}`)
    }

    const dish = await safeDbCall(() => dishes.read(dishIdNum))
    if (dish.length < 1) {
      throwValidationError(`Блюдо с id ${dishIdNum} не найдено`)
    }

    const currentDish = dish[0]
     console.log(currentDish.size)

    // Проверяем поддержку размеров
    if (currentDish.resize && !inputSize) {
      throwValidationError(`Для блюда "${currentDish.name}" требуется указать размер`)
    }

    if (!currentDish.resize && inputSize) {
      throwValidationError(`Размер не поддерживается для блюда "${currentDish.name}"`)
    }

    const validatedSize = currentDish.resize ? validateSizeForDish(inputSize, currentDish) : null

    let sizePrice = 0
    if (validatedSize && currentDish.size && validatedSize in currentDish.size) {
      sizePrice = currentDish.size[validatedSize]  // Извлекаем из JSONB
    }

    let dishPrice = Math.round(sizePrice * quantityNum)

    orderedDishes.push({
      id: dishIdNum,
      quantity: quantityNum,
      price: dishPrice,
      name: currentDish.name,
      ...(validatedSize && { size: validatedSize }) 
    })

    totalPrice += dishPrice
  }
    const {
    status = true,   
    address = '',  
    comment = ''  
    } = args.delivery || {}

  const deliveryObj = { status, address, comment }

  const cutlery_price = 50
  const order = {
    name: args.name,
    phone: args.phone,
    dishes: JSON.stringify(orderedDishes),
    total_price:args.cutlery_quantity ? totalPrice + cutlery_price * args.cutlery_quantity : totalPrice,
    status: false,
    delivery: JSON.stringify(deliveryObj),
    cutlery_status: args.cutlery_status,
    cutlery_quantity: args.number_cutlery,
    order_comment: args.order_comment ? args.order_comment : '',
  }

  const result = await safeDbCall(() => orders.create(order))
  if (!result) {
    throwValidationError('Ошибка при создании заказа')
  }
  return result
}

module.exports = createOrder