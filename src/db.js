'use strict'

const pool = require('./poolDB.js')
const throwValidationError = require('./lib/ValidationError.js')

module.exports = (table) => ({
   async query(sql, args) {
      try {
         return await pool.query(sql, args)
      } catch (err) {
         throwValidationError(`Ошибка выполнения запроса: ${err.message}`)
      }
   },

   async read(id, fields = ['*']) {
      const names = fields.join(', ')
      const sql = `SELECT ${names} FROM ${table}`
      const result = id
         ? await pool.query(`${sql} WHERE id = $1`, [id])
         : await pool.query(sql)
      return result.rows
   },

   async create(record) {
      try {
         const keys = Object.keys(record)
         const nums = keys.map((_, i) => `$${i + 1}`)
         const fields = `"${keys.join('", "')}"`
         const params = nums.join(', ')
         const sql = `INSERT INTO "${table}" (${fields}) VALUES (${params}) RETURNING *`
         const result = await pool.query(sql, Object.values(record))
         return result.rows
      } catch (err) {
         throwValidationError(`Ошибка вставки в ${table}: ${err.message}`)
      }
   },

   async update(id, record) {
      try {
         const keys = Object.keys(record)
         if (keys.length === 0) {
            throwValidationError('Обновление без данных невозможно')
         }
         const updates = keys.map((key, i) => `${key} = $${i + 1}`).join(', ')
         const sql = `UPDATE ${table} SET ${updates} WHERE id = $${keys.length + 1} RETURNING *`
         const result = await pool.query(sql, [...Object.values(record), id])
         return result.rows
      } catch (err) {
         throwValidationError(`Ошибка обновления ${table}: ${err.message}`)
      }
   },

   async delete(id) {
      try {
         const result = await pool.query(`DELETE FROM ${table} WHERE id = $1 RETURNING *`, [id])
         return result.rows
      } catch (err) {
         throwValidationError(`Ошибка удаления из ${table}: ${err.message}`)
      }
   }
})
