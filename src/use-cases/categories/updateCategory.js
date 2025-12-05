// updateCategories.js
const db = require('../../db')
const category = db('category')
const throwValidationError = require('../../lib/ValidationError')

const updateCategories = async (rawBody) => {
  const { categories } = rawBody

  if (!Array.isArray(categories) || categories.length === 0) {
    throwValidationError('Ожидается непустой массив categories')
  }

  const updates = categories.map((item, idx) => {
    if (!item.id || typeof item.id !== 'number') {
      throwValidationError(`Элемент #${idx + 1}: id обязателен и должен быть числом`)
    }

    // Минимум одно поле должно быть для обновления
    const hasUpdate = 'name' in item || 'status' in item || 'position' in item
    if (!hasUpdate) {
      throwValidationError(`Элемент #${idx + 1}: нужно указать хотя бы одно поле для обновления`)
    }

    const result = { id: Number(item.id) }

    if ('name' in item) {
      if (typeof item.name !== 'string' || item.name.trim() === '') {
        throwValidationError(`Элемент #${idx + 1}: name должен быть непустой строкой`)
      }
      result.name = item.name.trim()
    } else {
      result.name = null
    }

    if ('status' in item) {
      result.status = Boolean(item.status)
    } else {
      result.status = null
    }

    if ('position' in item) {
      if (!Number.isInteger(item.position) || item.position < 0) {
        throwValidationError(`Элемент #${idx + 1}: position должен быть целым неотрицательным числом`)
      }
      result.position = Number(item.position)
    } else {
      result.position = null
    }

    return result
  })

  const values = []
  const placeholders = updates.map((item, i) => {
    const base = i * 4 + 1
    values.push(item.id, item.name, item.status, item.position)
    return `($${base}::integer,$${base + 1}::varchar,$${base + 2}::boolean,$${base + 3}::integer
    )`
  }).join(', ')

  console.log(values);
  console.log(placeholders);
  
  const sql = `
    WITH input_data(id, name, status, position) AS (
  VALUES ${placeholders}
  )
  UPDATE category AS c
  SET
    name     = COALESCE(input_data.name, c.name),
    status   = COALESCE(input_data.status, c.status),
    position = COALESCE(input_data.position, c.position)
  FROM input_data
  WHERE c.id = input_data.id
  RETURNING c.id, c.name, c.status, c.position;
  `

  const result = await category.query(sql, values)

  if (result.rowCount === 0) {
    throwValidationError('Ни одна категория не была обновлена (возможно, неверные id)')
  }

  return result.rows
}

module.exports = updateCategories