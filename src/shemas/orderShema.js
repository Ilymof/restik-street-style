'use strict';

/** @type {typeof import('zod')} */
const { z } = require('zod');

// Nested схема для DishInOrder
const DishInOrderSchema = z.object({
  id: z.number().int().positive(),
  quantity: z.number().int().positive(),
  size: z.string().optional(),
});

// Схема для Delivery (address required)
const DeliverySchema = z.object({
  status: z.boolean(),
  address: z.string().min(1),
  comment: z.string().optional(),
});

// CreateOrderSchema
const CreateOrderSchema = z.object({
  name: z.string().min(1),
  phone: z.string().min(1),
  dishes: z.array(DishInOrderSchema).min(1),
  delivery: DeliverySchema,
  cutlery_status: z.boolean(),
  cutlery_quantity: z.number().int().nonnegative().optional(),
  order_comment: z.string().optional(),
});

// UpdateOrderSchema
const UpdateOrderSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1).optional(),
  phone: z.string().min(1).optional(),
  dishes: z.array(DishInOrderSchema).optional(),
  delivery: DeliverySchema.optional(),
  cutlery_status: z.boolean().optional(),
  cutlery_quantity: z.number().int().nonnegative().optional(),
  order_comment: z.string().optional(),
  status: z.boolean().optional(),
});

module.exports = { CreateOrderSchema, UpdateOrderSchema };