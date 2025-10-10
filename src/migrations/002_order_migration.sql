DROP TABLE IF EXISTS orders CASCADE;

CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    phone VARCHAR(20) NOT NULL,
    name VARCHAR(200) NOT NULL,
    dishes JSONB NOT NULL,
    total_price INTEGER NOT NULL,
    status BOOLEAN DEFAULT FALSE,
    delivery JSONB NOT NULL,
    cutlery_status BOOLEAN DEFAULT TRUE,
    cutlery_quantity INTEGER DEFAULT 0,
    order_comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    secret_key VARCHAR(255)
);


