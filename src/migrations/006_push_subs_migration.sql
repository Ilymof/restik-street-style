CREATE TABLE push_subscriptions (
  id SERIAL PRIMARY KEY,
  endpoint TEXT UNIQUE NOT NULL,
  auth TEXT NOT NULL,
  order_key TEXT,                 
  admin_username TEXT  
);

CREATE INDEX idx_push_order_key ON push_subscriptions(order_key);