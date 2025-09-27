'use strict';
const db = require('../../db');
const safeDbCall = require('../../lib/safeDbCall');
const category = db('category');

const getDishesByCategory = async () => {
      const query = `
         SELECT 
            c.id AS category_id,
            c.name AS category_name,
            d.id AS dish_id,
            d.name AS dish_name,
            d.description,
            d.dish_status,
            d.dish_weight,
            d.composition,
            d.image,
            d.resize,
            d.size,
            d.categoryid
         FROM category c
         LEFT JOIN dish d ON c.id = d.categoryid
         ORDER BY c.id, d.id
      `;
      const result = await safeDbCall(() => category.query(query));

      const rows = result && result.rows ? result.rows : [];

      if (!rows || !Array.isArray(rows) || rows.length === 0) {
         console.log('Rows is not an array or is empty:', rows);
         return [];
      }

      const groupedDishes = rows.reduce((acc, row) => {
         const { 
            category_id, 
            category_name, 
            dish_id, 
            dish_name, 
            description, 
            dish_status, 
            composition, 
            dish_weight,
            size,
            resize,
            image, 
            categoryid 
         } = row;

         let category = acc.find(cat => cat.categoryId === category_id);
         if (!category) {
            category = {
               categoryId: category_id,
               category_name,
               dishes: []
            };
            acc.push(category);
         }

         if (dish_id) {
            const dishObj = {
               id: dish_id,
               name: dish_name,
               categoryName: category_name,
               description,
               dish_status,
               composition,
               dish_weight,
               quantity:1,
               image,
               categoryid
            };
            if (resize && size && typeof size === 'object') {
               dishObj.size = Object.keys(size);
            }
            category.dishes.push(dishObj);
         }


         return acc;
      }, []);
      
      return groupedDishes;
};

module.exports = getDishesByCategory;