'use strict';
const errorHandler = require('../../lib/errorHandler');
const db = require('../../db');
const orders = db('orders');
const dishes = db('dish');
const safeDbCall = require('../../lib/safeDbCall');

const createOrder = async (args) => {
   try {
      if (!args.phone) throw new Error('Поле phone отсутствует');
      if (!args.delivery_address) throw new Error('Поле delivery_address отсутствует');
      if (!args.dishes) throw new Error('Поле dishes отсутствует');

      if (!Array.isArray(args.dishes) || args.dishes.length === 0) {
         throw new Error('Dishes должен быть непустым массивом');
      }

      const orderedDishes = [];
      let totalPrice = 0;

      for (const oneDish of args.dishes) {
         const { dishId, quantity } = oneDish;

         const dishIdNum = parseInt(dishId);
         const quantityNum = parseInt(quantity);
         if (isNaN(dishIdNum) || isNaN(quantityNum) || quantityNum <= 0) {
            throw new Error(`Неверные данные для блюда: dishId=${dishId}, quantity=${quantity}`);
         }

         const dish = await safeDbCall(() => dishes.read(dishIdNum));
         if (dish.length < 1) {
            throw new Error(`Блюдо с id ${dishIdNum} не найдено`);
         }

         const dishPrice = dish[0].price * quantityNum;
         totalPrice += dishPrice;

         orderedDishes.push({
            dishId: dishIdNum,
            quantity: quantityNum,
            price: dishPrice,
            dishName: dish[0].name 
         });
      }

      const order = {
         phone: args.phone,
         delivery_address: args.delivery_address,
         dishes: JSON.stringify(orderedDishes),
         total_price:  totalPrice,
         status: false,
         delivery: args.delivery
      };

      const result = await safeDbCall(() => orders.create(order));
      if (!result) {
         throw new Error('Ошибка при создании заказа' + err.message);
      }

      return result
   } catch (error) {
      throw errorHandler(error);
   }
};

module.exports = createOrder;