'use strict';
const db = require('../../db');
const orders = db('orders');
const safeDbCall = require('../../lib/safeDbCall');

const dishStats = async (query) => {
  let { from, to, dishName } = query;

  const params = [];
  let whereClause = '';

  if (from || to) {
    whereClause = 'WHERE ';
    if (from) {
      params.push(from);
      whereClause += `o.created_at::date >= $${params.length}`;
    }
    if (from && to) whereClause += ' AND ';
    if (to) {
      params.push(to);
      whereClause += `o.created_at::date <= $${params.length}`;
    }
  }

  // Основной запрос: блюдо + сколько заказов его содержат
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

  if (dishName) {
    const andPart = whereClause ? ' AND ' : ' WHERE ';
    sql += `${andPart} dish->>'name' = $${params.length + 1}`;
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
    description: !from && !to ? 'за всё время' :
                 from && to ? `с ${from} по ${to}` :
                 from ? `с ${from} по сегодня` : `до ${to}`
  };

  // Если запрашивали одно блюдо
  if (dishName) {
    const found = result[0]; // уже отсортировано, первое — нужное
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

  // Если без фильтра — все блюда
  return {
    period,
    dishes: result
  };
};

module.exports = dishStats