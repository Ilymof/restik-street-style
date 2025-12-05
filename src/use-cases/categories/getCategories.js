'use strict';
const db = require('../../db');
const safeDbCall = require('../../lib/safeDbCall');
const category = db('category');

const getCategories = async () => {
      const query = `
         SELECT * FROM category
         ORDER BY position
      `;
      const result = await safeDbCall(() => category.query(query));

      const rows = result && result.rows ? result.rows : [];

      if (!rows || !Array.isArray(rows) || rows.length === 0) {
         console.log('Rows is not an array or is empty:', rows);
         return [];
      }
      return rows;
};

module.exports = getCategories; 