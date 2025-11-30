DROP TABLE IF EXISTS config CASCADE;
CREATE TABLE config (
  id         SERIAL PRIMARY KEY,
  opens_at   TIME NOT NULL, 
  closes_at  TIME NOT NULL
);

INSERT INTO config(opens_at, closes_at) 
VALUES ('10:00', '23:00')
ON CONFLICT (id) DO NOTHING;
