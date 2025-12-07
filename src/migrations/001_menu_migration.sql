DROP TABLE IF EXISTS dish CASCADE;
DROP TABLE IF EXISTS category CASCADE;

CREATE TABLE category (
    id  SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE,
    status BOOLEAN DEFAULT TRUE,
    position INTEGER NOT NULL
);

CREATE TABLE dish (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description VARCHAR(255),
    dish_status BOOLEAN DEFAULT TRUE,
    composition TEXT[],
    characteristics JSONB,
    default_characteristics INTEGER DEFAULT 0,
    image VARCHAR(255),
    position INTEGER NOT NULL,
    category_id INT NOT NULL REFERENCES category(id) ON DELETE CASCADE
);

INSERT INTO category (name, status, position) 
VALUES 
('Пицца', TRUE, 1),
('Фастфуд', TRUE, 2),
('Салаты', TRUE, 3),
('Напитки', TRUE, 4);

-- Добавление по 3 блюда для каждой категории
INSERT INTO dish (name, description, dish_status, composition, characteristics, default_characteristics, image, category_id, position)
VALUES
-- Категория 1: Пицца (оставлено как есть с вариантами размеров в characteristics)
('Маргарита', 'Классическая пицца с томатным соусом и моцареллой', TRUE, ARRAY['Томатный соус', 'Моцарелла', 'Базилик'], '[{"size": "30 СМ", "price": "450", "quantity": "250", "measure": "г"}, {"size": "40 СМ", "price": "550", "quantity": "350", "measure": "г"}]'::JSONB, 0, 'margherita.jpg', 1, 1),
('Пепперони', 'Пицца с острой колбасой пепперони и сыром', TRUE, ARRAY['Томатный соус', 'Пепперони', 'Моцарелла'], '[{"size": "30 СМ", "price": "450", "quantity": "250", "measure": "г"}, {"size": "40 СМ", "price": "550", "quantity": "350", "measure": "г"}]'::JSONB, 0, 'pepperoni.jpg', 1, 2),
('Четыре сыра', 'Пицца с миксом сыров: моцарелла, пармезан, горгонзола, чеддер', TRUE, ARRAY['Моцарелла', 'Пармезан', 'Горгонзола', 'Чеддер'], '[{"size": "30 СМ", "price": "450", "quantity": "250", "measure": "г"}, {"size": "40 СМ", "price": "550", "quantity": "350", "measure": "г"}]'::JSONB, 0, 'four_cheeses.jpg', 1, 3),
-- Категория 2: Фастфуд (characteristics пустые, только default; для картошки фри — default по размеру)
('Чизбургер', 'Классический бургер с сочной говяжьей котлетой, плавленым сыром и свежими овощами', TRUE, ARRAY['Булочка', 'Говяжья котлета', 'Чеддер', 'Лук', 'Салат', 'Томат', 'Кетчуп'], '[{"size": "стандартный", "price": "250", "quantity": "250", "measure": "г"}]'::JSONB,0, 'cheeseburger.jpg', 2, 1),
('Классический хот-дог', 'Хрустящая сосиска в булочке с горчицей, кетчупом и хрустящим огурцом', TRUE, ARRAY['Булочка', 'Сосиска', 'Горчица', 'Кетчуп', 'Огурец', 'Лук'],'[{"size": "стандартный", "price": "150", "quantity": "200", "measure": "г"}]'::JSONB,0, 'hotdog.jpg', 2, 2),
('Картошка фри', 'Золотистая хрустящая картошка с солью и специями', TRUE, ARRAY['Картофель', 'Соль', 'Паприка'],'[{"size": "маленькая", "price": "120", "quantity": "150", "measure": "г"},{"size": "Большая", "price": "180", "quantity": "250", "measure": "г"}]'::JSONB,0, 'fries.jpg', 2, 3),
-- Категория 3: Салаты (characteristics пустые, только default)
('Цезарь', 'Салат с курицей, сухариками и соусом Цезарь', TRUE, ARRAY['Курица', 'Салат романо', 'Сухарики', 'Соус Цезарь'],'[{"size": "стандартный", "price": "300", "quantity": "300", "measure": "г"}]'::JSONB,0, 'caesar.jpg', 3,1),
('Греческий', 'Салат с огурцами, помидорами, фетой и оливками', TRUE, ARRAY['Огурцы', 'Помидоры', 'Фета', 'Оливки'],  '[{"size": "стандартный", "price": "250", "quantity": "250", "measure": "г"}]'::JSONB,0, 'greek.jpg', 3,2),
('Капрезе', 'Салат с моцареллой, томатами и базиликом', TRUE, ARRAY['Моцарелла', 'Томаты', 'Базилик', 'Оливковое масло'], '[{"size": "стандартный", "price": "250", "quantity": "250", "measure": "г"}]'::JSONB, 0,'caprese.jpg', 3, 3),
-- Категория 4: Напитки (characteristics пустые, только default)
('Кола', '',  TRUE, ARRAY[]::text[],'[{"size": "маленькая", "price": "80", "quantity": "250", "measure": "мл"}, {"size": "Большая", "price": "150", "quantity": "1", "measure": "л"}]'::JSONB, 0,'cola.jpg', 4,1),
('Lit Energy', '',  TRUE, ARRAY[]::text[],'[{"size": "большой", "price": "150", "quantity": "495", "measure": "мл"}]'::JSONB, 0,'lit_energy.jpg', 4,2),
('Burn', '', TRUE, ARRAY[]::text[], '[{"size": "большой", "price": "150", "quantity": "495", "measure": "мл"},{"size": "маленький", "price": "100", "quantity": "250", "measure": "мл"}]'::JSONB, 0, 'burn.jpg', 4,3);