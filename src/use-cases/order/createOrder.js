'use strict';
const errorHandler = require('../../lib/errorHandler');
const db = require('../../db');
const orders = db('orders');
const dishes = db('dish');
const categories = db('category')
const throwValidationError = require('../../lib/ValidationError')
const safeDbCall = require('../../lib/safeDbCall');

const validateRequiredFields = (args, requiredFields) => {
  for (const field of requiredFields) {
    if (!args[field] || args[field].trim() === '') {
      throwValidationError(`Поле ${field} отсутствует`);
    }
  }
  
  if (!Array.isArray(args.dishes) || args.dishes.length === 0) {
    throwValidationError('Dishes должен быть непустым массивом');
  }
};

const getSizeAdjustment = (pizzaSize) => {
  return pizzaSize === '40' ? 100 : 0; 
};

const isPizzaCategory = (categoryName) => {
  return categoryName.toLowerCase() === 'пицца';  
};

const validatePizzaSize = (pizzaSize) => {
  if (!pizzaSize) return;  

  const size = pizzaSize.toString().trim(); 

  if (!['30', '40'].includes(size)) {
    throwValidationError(`Размер пиццы должен быть "30" или "40" (получено: ${pizzaSize})`);
  }
  return size;
};

const createOrder = async (args) => {
      const requiredFields = ['phone', 'delivery_address'];

      validateRequiredFields(args, requiredFields);

      const orderedDishes = [];
      let totalPrice = 0;

      for (const oneDish of args.dishes) {
         const { dishId, quantity, pizza_size } = oneDish;

         const dishIdNum = parseInt(dishId);
         const quantityNum = parseInt(quantity);
         if (isNaN(dishIdNum) || isNaN(quantityNum) || quantityNum <= 0) {
            throwValidationError(`Неверные данные для блюда: dishId=${dishId}, quantity=${quantity}`);
         }

         const dish = await safeDbCall(() => dishes.read(dishIdNum));
         if (dish.length < 1) {
            throwValidationError(`Блюдо с id ${dishIdNum} не найдено`);
         }

         const dish_category = await safeDbCall(() => categories.read(dish[0].categoryid));

         if (isPizzaCategory(dish_category[0].name) && !pizza_size) {
         throwValidationError('У пиццы не указан размер');
         }

         const validatedSize = validatePizzaSize(pizza_size);

         if (validatedSize && !isPizzaCategory(dish_category[0].name)) {  
         throwValidationError(`Размер пиццы указан не для пиццы (dish_name: ${dish[0].name})`);
         }
         
         let sizeAdjustment = 0;

         if (isPizzaCategory(dish_category[0].name) && validatedSize) {
            sizeAdjustment  = getSizeAdjustment(validatedSize);
         }

         let dishPrice = (dish[0].price + sizeAdjustment) * quantityNum;

         orderedDishes.push({
            dishId: dishIdNum,
            quantity: quantityNum,
            price: dishPrice,
            dishName: dish[0].name,
            ...(validatedSize && { size: validatedSize }) 
         });

         totalPrice += dishPrice;
      }

      const order = {
         phone: args.phone,
         delivery_address: args.delivery_address,
         dishes: JSON.stringify(orderedDishes),
         total_price:  totalPrice,
         status: false,
         delivery: args.delivery,
      };

      const result = await safeDbCall(() => orders.create(order));
      if (!result) {
         throwValidationError('Ошибка при создании заказа');
      }
      return result
  
};

module.exports = createOrder;