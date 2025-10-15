'use strict';
const db = require('../../db');
const orders = db('orders');
const dishes = db('dish');
const throwValidationError = require('../../lib/ValidationError');
const safeDbCall = require('../../lib/safeDbCall');

const validateSizeForDish = (inputSize, dish) => {
  if (!inputSize) return null;
  const size = inputSize.toString().trim();
  const char = dish.characteristics.find(c => c.size.toString().trim() === size);
  if (!char) {
    const availableSizes = dish.characteristics.map(c => c.size).join(', ') || 'нет доступных';
    throwValidationError(`Неверный размер для блюда "${dish.name}". Доступные: ${availableSizes}`);
  }
  return size;
};

const updateOrder = async (args) => {
  const exsistOrder = await safeDbCall(() => orders.read(args.id));
  if (exsistOrder.length < 1) {
    throwValidationError(`Нет заказа с id: ${args.id}`);
  }
  const existingOrder = exsistOrder[0];

  const updateObj = {};
  let TotalPrice = 0;
  let orderedDishes = [];

  // Перебор args
  for (const [key, value] of Object.entries(args)) {
    if (key === 'delivery') {
      const { status, address, comment} = value;

      updateObj.delivery = JSON.stringify({ status, address: status ? address : '',comment: status ? comment : '' });

    } else if (key === 'dishes') {
      if (!Array.isArray(value) || value.length === 0) {
        throwValidationError('Dishes должен быть непустым массивом');
      }

      for (const oneDish of value) {
        const { id, quantity, size: inputSize } = oneDish;
        const dishIdNum = parseInt(id);
        const quantityNum = parseInt(quantity);
        if (isNaN(dishIdNum) || isNaN(quantityNum) || quantityNum <= 0) {
          throwValidationError(`Неверные данные для блюда: id=${id}, quantity=${quantity}`);
        }

        const dish = await safeDbCall(() => dishes.read(dishIdNum));
        if (dish.length < 1) {
          throwValidationError(`Блюдо с id ${dishIdNum} не найдено`);
        }
        const currentDish = dish[0];

        const validatedSize = validateSizeForDish(inputSize, currentDish);
        let selectedSize, sizePrice;
        if (validatedSize) {
          const char = currentDish.characteristics.find(c => c.size.toString().trim() === validatedSize);
          selectedSize = validatedSize;
          sizePrice = parseInt(char.price);
        } else {
          const defaultIndex = parseInt(currentDish.default_characteristics);
          if (isNaN(defaultIndex) || defaultIndex < 0 || defaultIndex >= currentDish.characteristics.length) {
            throwValidationError(`Неверный default_characteristics для блюда "${currentDish.name}"`);
          }
          const char = currentDish.characteristics[defaultIndex];
          selectedSize = char.size;
          sizePrice = parseInt(char.price);
        }

        const dishPrice = sizePrice * quantityNum
        orderedDishes.push({
          id: dishIdNum,
          quantity: quantityNum,
          price: dishPrice,
          name: currentDish.name,
          size: selectedSize,
          image: dish[0].image
        });
        TotalPrice += dishPrice;
      }
      updateObj.dishes = JSON.stringify(orderedDishes);
      updateObj.total_price = TotalPrice
    } else {
      updateObj[key] = value; 
    }
  }
 
  const result = await safeDbCall(() => orders.update(args.id, updateObj));
  if (!result) {
    throwValidationError('Ошибка при обновлении заказа');
  }
  return result;
};

module.exports = updateOrder;
