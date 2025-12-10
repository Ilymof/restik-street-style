'use strict';
const db = require('../../db');
const safeDbCall = require('../../lib/safeDbCall');
const category = db('category');

const getDishesByCategory = async (data) => {
      const {name} = data
      let values = []
      let query =``
      if(name){
         values.push(`%${name.trim()}%`)
         query = `
         SELECT 
            c.id AS category_id,
            c.name AS category_name,
            d.id,
            d.name,
            d.description,
            d.dish_status,
            d.composition,
            d.image,
            d.default_characteristics,
            d.characteristics,
            d.position
         FROM dish d
         JOIN category c ON d.category_id = c.id         
         WHERE d.name ILIKE $1
          
      `;} else{
         query = `
         SELECT 
            c.id AS category_id,
            c.name AS category_name,
            d.id,
            d.name,
            d.description,
            d.dish_status,
            d.composition,
            d.image,
            d.default_characteristics,
            d.characteristics,
            d.position
         FROM category c
         LEFT JOIN dish d ON c.id = d.category_id
         ORDER BY c.id, d.position
      `;
      }
       console.log(name, values);
      
      const result = await safeDbCall(() => category.query(query, values));

      if (!result.rows || !Array.isArray(result.rows)) {
         console.log('Rows is not an array:', rows);
         return [];
      }
      return result.rows;
};

module.exports = getDishesByCategory; 