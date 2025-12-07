'use strict';
const db = require('../../db');
const safeDbCall = require('../../lib/safeDbCall');
const category = db('category');

const getDishesByCategory = async () => {
      const query = `
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
      const result = await safeDbCall(() => category.query(query));

      const rows = result && result.rows ? result.rows : [];

      if (!rows || !Array.isArray(rows) || rows.length === 0) {
         console.log('Rows is not an array or is empty:', rows);
         return [];
      }
      return rows;
};

module.exports = getDishesByCategory; 