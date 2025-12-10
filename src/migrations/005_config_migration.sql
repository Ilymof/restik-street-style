DROP TABLE IF EXISTS config CASCADE;
CREATE TABLE config (
  id         SERIAL PRIMARY KEY,
  opens_at   TIME NOT NULL, 
  closes_at  TIME NOT NULL,
  price_list JSONB

);

INSERT INTO config(opens_at, closes_at, price_list) 
VALUES ('10:00', '23:00', '[{"delivery_price": 150,"order_price": 1000,  "city": "Сухум"}]')
ON CONFLICT (id) DO NOTHING;
