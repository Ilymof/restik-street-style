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
            d.composition,
            d.image,
            d.default_characteristics,
            d.characteristics
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
      return rows;
};

module.exports = getDishesByCategory; 