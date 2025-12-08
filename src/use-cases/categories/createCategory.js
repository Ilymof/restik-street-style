// createCategories.js
const db = require('../../db')
const category = db('category')
const throwValidationError = require('../../lib/ValidationError')

const createCategories = async (rawBody) => {
  const { categories } = rawBody

  if (!Array.isArray(categories) || categories.length === 0) {
    throwValidationError('Ожидается непустой массив categories')
  }

  const inserts = categories.map((item, idx) => {
    if (!item.name || typeof item.name !== 'string' || item.name.trim() === '') {
      throwValidationError(`Элемент #${idx + 1}: name обязателен и должен быть непустой строкой`)
    }

    if (!Number.isInteger(item.position)) {
      throwValidationError(`Элемент #${idx + 1}: position обязателен и должен быть целым числом`)
    }

    return {
      name: item.name.trim(),
      status: item.status !== undefined ? Boolean(item.status) : null,
      position: item.position
    }
  })

  const values = []
  const placeholders = inserts
    .map((item, i) => {
      const base = i * 3 + 1

      values.push(item.name, item.status, item.position)

      return `(
        $${base}::varchar,
        COALESCE($${base + 1}::boolean, TRUE),
        $${base + 2}::integer
      )`
    })
    .join(', ')

  const insertSql = `
    INSERT INTO category (name, status, position)
    VALUES ${placeholders}
    RETURNING id, name, status, position;
  `

  await category.query(insertSql, values)

  const selectSql = `
    SELECT id, name, status, position
    FROM category
    ORDER BY position ASC, id ASC;
  `
  const result = await category.query(selectSql)
  return result.rows
}

module.exports = createCategories
