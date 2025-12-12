'use strict';
const db = require('../../db');
const orders = db('orders');
const safeDbCall = require('../../lib/safeDbCall');

const dishStats = async (query) => {
  let { from, to, dishName } = query;

  const params = [];
  let whereClause = 'WHERE o.current_status = \'Готов\''; // ВАЖНО: только завершённые заказы

  // Добавляем фильтр по датам
  if (from || to) {
    if (from) {
      params.push(from);
      whereClause += ` AND o.created_at::date >= $${params.length}`;
    }
    if (to) {
      params.push(to);
      whereClause += ` AND o.created_at::date <= $${params.length}`;
    }
  } else {
    // Если даты не указаны — всё равно как и без условия, но с учётом статуса
    whereClause = 'WHERE o.current_status = \'Готов\'';
  }

  let sql = `
    SELECT 
      dish->>'name' as name,
      SUM((dish->>'quantity')::int) as quantity,
      SUM((dish->>'price')::int) as revenue,
      COUNT(DISTINCT o.id) as orders_count
    FROM orders o,
         jsonb_array_elements(o.dishes) as dish
    ${whereClause}
  `;

  // Фильтр по названию блюда
  if (dishName) {
    sql += ` AND dish->>'name' = $${params.length + 1}`;
    params.push(dishName);
  }

  sql += `
    GROUP BY dish->>'name'
    ORDER BY revenue DESC
  `;

  const { rows } = await safeDbCall(() => orders.query(sql, params));

  const result = rows.map(r => ({
    name: r.name || 'Без названия',
    quantity: Number(r.quantity) || 0,
    revenue: Number(r.revenue) || 0,
    ordersCount: Number(r.orders_count) || 0
  }));

  const period = {
    from: from || null,
    to: to || null,
    description: !from && !to 
      ? 'за всё время' 
      : from && to 
        ? `с ${from} по ${to}` 
        : from 
          ? `с ${from} по сегодня` 
          : `до ${to}`
  };

  if (dishName) {
    const found = result[0];
    return {
      period,
      dish: found || {
        name: dishName,
        quantity: 0,
        revenue: 0,
        ordersCount: 0
      }
    };
  }

  return {
    period,
    dishes: result
  };
};

module.exports = dishStats;