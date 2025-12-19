'use strict'

const db = require('../../db')
const safeDbCall = require('../../lib/safeDbCall')
const config = db('config')

const getConfig = async () => {
    const sql = `
        SELECT 
            id,
            TO_CHAR(opens_at, 'HH24:MI') AS opens_at,
            TO_CHAR(closes_at, 'HH24:MI') AS closes_at,
            price_list
        FROM config 
        WHERE id = 1
        `;

      const result = await safeDbCall(() => config.query(sql))
      if (!result) {
         throw new Error('Ошибка при получении конфигурационных данных')
      }
      return result.rows[0] 
}

module.exports = getConfig 