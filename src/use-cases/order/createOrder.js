'use strict'
const errorHandler = require('../../lib/errorHandler')
const db = require('../../db')
const orders = db('orders')
const dishes = db('dish')
const throwValidationError = require('../../lib/ValidationError')
const safeDbCall = require('../../lib/safeDbCall')

const validateSizeForDish = (inputSize, dish) => {
  if (!inputSize) {
    return null
  }

  const size = inputSize.toString().trim()

  // Проверяем, поддерживается ли размер в characteristics
  const char = dish.characteristics.find(c => c.size.toString().trim() === size)
  if (!char) {
    const availableSizes = dish.characteristics.map(c => c.size).join(', ') || 'нет доступных'
    throwValidationError(`Неверный размер для блюда "${dish.name}". Доступные: ${availableSizes}`)
  }

  return size
}

const createOrder = async (args) => {
  const orderedDishes = []

  let totalPrice = 0

  for (const oneDish of args.dishes) {
    const { id, quantity, size: inputSize } = oneDish

    const dishIdNum = parseInt(id)
    const quantityNum = parseInt(quantity)
    if (isNaN(dishIdNum) || isNaN(quantityNum) || quantityNum <= 0) {
      throwValidationError(`Неверные данные для блюда: dishId=${id}, quantity=${quantity}`)
    }

    const dish = await safeDbCall(() => dishes.read(dishIdNum))
    if (dish.length < 1) {
      throwValidationError(`Блюдо с id ${dishIdNum} не найдено`)
    }
    
    const currentDish = dish[0]

    const validatedSize = validateSizeForDish(inputSize, currentDish)

    let selectedSize, sizePrice
    if (validatedSize) {
      const char = currentDish.characteristics.find(c => c.size.toString().trim() === validatedSize)
      selectedSize = validatedSize
      sizePrice = parseInt(char.price)
    } else {
      const defaultIndex = parseInt(currentDish.default_characteristics)
      if (isNaN(defaultIndex) || defaultIndex < 0 || defaultIndex >= currentDish.characteristics.length) {
        throwValidationError(`Неверный default_characteristics для блюда "${currentDish.name}"`)
      }
      const char = currentDish.characteristics[defaultIndex]
      selectedSize = char.size
      sizePrice = parseInt(char.price)
    }

    let dishPrice = sizePrice * quantityNum

    orderedDishes.push({
      id: dishIdNum,
      quantity: quantityNum,
      price: dishPrice,
      name: currentDish.name,
      size: selectedSize,
      image: dish[0].image
    })

    totalPrice += dishPrice
  }


    const {
    status,   
    address,  
    comment = ''
    } = args.delivery || {}

  const deliveryObj = { status, address, comment }

  const order = {
    name: args.name,
    phone: args.phone,
    dishes: JSON.stringify(orderedDishes),
    total_price: totalPrice,
    status: false,
    delivery: JSON.stringify(deliveryObj),
    cutlery_status: args.cutlery_status,
    cutlery_quantity: args.cutlery_quantity,
    order_comment: args.order_comment ? args.order_comment : '',
    secret_key: args.secret_key
  }

  const result = await safeDbCall(() => orders.create(order))
  if (!result) {
    throwValidationError('Ошибка при создании заказа')
  }
  return result
}

module.exports = createOrder
