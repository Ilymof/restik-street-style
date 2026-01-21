'use strict'
const db = require('../../db')
const orders = db('orders')
const config = db('config')
const dishes = db('dish')
const throwValidationError = require('../../lib/ValidationError')
const safeDbCall = require('../../lib/safeDbCall')
const { CreateOrderSchema} = require('../../schemas/orderMetaSchema.js');

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

const createOrder = async (args, req) => {
  args.secret_key = req.headers['secret-key'] ? req.headers['secret-key'] : null
  if (!CreateOrderSchema.check(args).valid){
     throwValidationError(CreateOrderSchema.check(args).errors[0])
    }   
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

const {status = false, address = '', comment = ''} = args.delivery || {}
const addressLower = address.toLowerCase().trim();

let current_delivery_price = 0;
if (status){
const price_list_array = await safeDbCall(() => config.read());
const citiesConfig = price_list_array[0].price_list || [];

let cityConfig = null;

for (const cityRule of citiesConfig) {
  if (cityRule.city && addressLower.includes(cityRule.city.toLowerCase())) {
    cityConfig = cityRule;
    break;
  }
}

  if (!cityConfig) {
    throwValidationError('Доставка в ваш регион недоступна');
  }

  if (!Array.isArray(cityConfig.prices) || cityConfig.prices.length === 0) {
    throwValidationError('Не настроены цены доставки для вашего города');
  }

  const suitableRange = cityConfig.prices.find(range => {
    const from = Number(range.from) || 0;
    const to = range.to === null || range.to === undefined ? Infinity : Number(range.to);
    return totalPrice >= from && totalPrice < to;
  });

  if (!suitableRange) {
    current_delivery_price = cityConfig.prices[cityConfig.prices.length - 1].price;
  } else {
    current_delivery_price = suitableRange.price;
  }
}


  const deliveryObj = {
    status,
    address: status ? address.trim() : '',
    comment: status ? comment : '',
    delivery_price: status ? current_delivery_price : 0
  }

  const order_status = {
    proccessing: 'В процессе',
    canceled: 'Отменён',
    finished: 'Готов'
  };

  const order = {
    name: args.name,
    phone: args.phone,
    dishes: JSON.stringify(orderedDishes),
    total_price: totalPrice + current_delivery_price,
    order_status,
    current_status: order_status.proccessing,
    delivery: JSON.stringify(deliveryObj),
    cutlery_status: args.cutlery_status,
    cutlery_quantity: args.cutlery_status ? args.cutlery_quantity : 0,
    order_comment: args.order_comment ? args.order_comment : '',
    created_at: new Date(Date.now() + 3 * 60 * 60 * 1000),
    secret_key: args.secret_key
  }

  const result = await safeDbCall(() => orders.create(order))
  if (!result) {
    throwValidationError('Ошибка при создании заказа')
  }
  return result
}
module.exports = createOrder
