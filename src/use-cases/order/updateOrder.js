'use strict';
const errorHandler = require('../../lib/errorHandler');
const db = require('../../db');
const orders = db('orders');
const dishes = db('dish');
const safeDbCall = require('../../lib/safeDbCall');
const throwValidationError = require('../../lib/ValidationError')

const updateOrder = async (args) => {
      if (!args.id) throwValidationError('Поле id отсутствует');

      const existingOrder = await safeDbCall(() => orders.read(args.id));
      if (!existingOrder || existingOrder.length < 1) {
         throwValidationError(`Заказ с id ${args.id} не найден`);
      }

      const order = {};

      if (args.phone) {
         order.phone = args.phone;
      }

      if (args.delivery_address) {
         order.delivery_address = args.delivery_address;
      }

      if (args.delivery && !args.delivery || args.delivery == 0 ){
         order.delivery = false;
      } else {
         order.delivery = true;
      }
      let totalPrice;

      if (args.dishes) {
         if (!Array.isArray(args.dishes) || args.dishes.length === 0) {
            throwValidationError('Dishes должен быть непустым массивом');
         }

         const orderedDishes = [];
         totalPrice = 0;

         for (const oneDish of args.dishes) {
            const { dishId, quantity } = oneDish;

            const dishIdNum = parseInt(dishId);
            const quantityNum = parseInt(quantity);
            if (isNaN(dishIdNum) || isNaN(quantityNum) || quantityNum <= 0) {
               throwValidationError(`Неверные данные для блюда: dishId=${dishId}, quantity=${quantity}`);
            }

            const dish = await safeDbCall(() => dishes.read(dishIdNum));
            if (dish.length < 1) {
               throwValidationError(`Блюдо с id ${dishIdNum} не найдено`);
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

         order.dishes = JSON.stringify(orderedDishes)
         order.total_price = totalPrice
      }

      if (Object.keys(order).length === 0) {
         throwValidationError('Нет данных для обновления');
      }

      const result = await safeDbCall(() => orders.update(args.id, order));
      if (!result) {
         throwValidationError('Ошибка при обновлении заказа');
      }

      return result
};

module.exports = updateOrder