DROP TABLE IF EXISTS config CASCADE;
CREATE TABLE config (
  id         SERIAL PRIMARY KEY,
  opens_at   TIME NOT NULL, 
  closes_at  TIME NOT NULL,
  price_list JSONB

);

INSERT INTO config(opens_at, closes_at, price_list) 
VALUES ('10:00', '23:00', [
  {
    "city": "Сухум",
    "prices": [
      {
        "to": 1000,
        "from": 0,
        "price": 250
      },
      {
        "to": 3500,
        "from": 1000,
        "price": 150
      },
      {
        "to": 5000,
        "from": 3500,
        "price": 50
      }
    ]
  },
  {
    "city": "Гагра",
    "prices": [
      {
        "to": 1000,
        "from": 0,
        "price": 250
      },
      {
        "to": 3500,
        "from": 1000,
        "price": 150
      }
    ]
  }
])
ON CONFLICT (id) DO NOTHING;
