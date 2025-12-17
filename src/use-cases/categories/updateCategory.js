const db = require('../../db');
const throwValidationError = require('../../lib/ValidationError');
const category =  db('category')

const updateCategories = async (rawBody) => {
  const { categories } = rawBody;

  if (!Array.isArray(categories)) {
    throwValidationError('Ожидается массив categories');
  }

  if (categories.length === 0) {
    throwValidationError('Массив categories не может быть пустым');
  }

  const toInsert = [];
  const toUpdate = [];
  const seenIds = new Set();

  categories.forEach((item, idx) => {
    const index = idx + 1;

    if (!item.name || typeof item.name !== 'string' || item.name.trim() === '') {
      throwValidationError(`Элемент #${index}: name обязателен и должен быть непустой строкой`);
    }

    if (!Number.isInteger(item.position) || item.position < 0) {
      throwValidationError(`Элемент #${index}: position обязателен и должен быть целым неотрицательным числом`);
    }

    const cleaned = {
      name: item.name.trim(),
      status: item.status !== undefined ? Boolean(item.status) : true,
      position: Number(item.position),
    };

    if (item.id === undefined || item.id === null) {
      toInsert.push(cleaned);
    } else {
      if (typeof item.id !== 'number' || item.id <= 0) {
        throwValidationError(`Элемент #${index}: id должен быть положительным числом`);
      }
      if (seenIds.has(item.id)) {
        throwValidationError(`Элемент #${index}: дубликат id ${item.id}`);
      }
      seenIds.add(item.id);
      toUpdate.push({ id: item.id, ...cleaned });
    }
  });

  // INSERT новых
  if (toInsert.length > 0) {
    const insertValues = [];
    const placeholders = toInsert.map((item, i) => {
      const base = i * 3 + 1;
      insertValues.push(item.name, item.status, item.position);
      return `($${base}::varchar, $${base + 1}::boolean, $${base + 2}::integer)`;
    }).join(', ');

    const insertSql = `
      INSERT INTO category (name, status, position)
      VALUES ${placeholders}
      RETURNING id, name, status, position;
    `;

    await category.query(insertSql, insertValues);

  }

  // UPDATE существующих
  if (toUpdate.length > 0) {
    const updateValues = [];
    const placeholders = toUpdate.map((item, i) => {
      const base = i * 4 + 1;
      updateValues.push(item.id, item.name, item.status, item.position);
      return `($${base}::integer, $${base + 1}::varchar, $${base + 2}::boolean, $${base + 3}::integer)`;
    }).join(', ');

    const updateSql = `
      WITH input_data(id, name, status, position) AS (VALUES ${placeholders})
      UPDATE category AS c
      SET
        name = input_data.name,
        status = input_data.status,
        position = input_data.position
      FROM input_data
      WHERE c.id = input_data.id
      RETURNING c.id, c.name, c.status, c.position;
    `;

    await category.query(updateSql, updateValues);
  }

  const finalSql = `
    SELECT id, name, status, position
    FROM category
    ORDER BY position ASC, id ASC;
  `;

  const finalRes = await category.query(finalSql);
  return finalRes.rows;
};

module.exports = updateCategories;