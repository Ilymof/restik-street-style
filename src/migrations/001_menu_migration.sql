DROP TABLE IF EXISTS dish CASCADE;
DROP TABLE IF EXISTS category CASCADE;

CREATE TABLE category (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE
);

CREATE TABLE dish (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description VARCHAR(255),
    dish_status BOOLEAN DEFAULT TRUE,
    composition TEXT[],
    characteristics JSONB,
    default_characteristics JSONB,
    image VARCHAR(255),
    categoryid INT NOT NULL REFERENCES category(id) ON DELETE CASCADE
);

INSERT INTO category (name) 
VALUES 
('Пицца'),
('Фастфуд'),
('Салаты'),
('Напитки');

-- Добавление по 3 блюда для каждой категории
INSERT INTO dish (name, description, dish_status, composition, characteristics, default_characteristics, image, categoryid)
VALUES
-- Категория 1: Пицца (оставлено как есть с вариантами размеров в characteristics)
('Маргарита', 'Классическая пицца с томатным соусом и моцареллой', TRUE, ARRAY['Томатный соус', 'Моцарелла', 'Базилик'], '[{"size": "30 СМ", "price": "450", "weight": "250", "measure": "г"}, {"size": "40 СМ", "price": "550", "weight": "350", "measure": "г"}]'::JSONB, '[{"size": "40 СМ", "price": "550", "weight": "350", "measure": "г"}]'::JSONB, 'margherita.jpg', 1),
('Пепперони', 'Пицца с острой колбасой пепперони и сыром', TRUE, ARRAY['Томатный соус', 'Пепперони', 'Моцарелла'], '[{"size": "30 СМ", "price": "450", "weight": "250", "measure": "г"}, {"size": "40 СМ", "price": "550", "weight": "350", "measure": "г"}]'::JSONB, '[{"size": "40 СМ", "price": "550", "weight": "350", "measure": "г"}]'::JSONB, 'pepperoni.jpg', 1),
('Четыре сыра', 'Пицца с миксом сыров: моцарелла, пармезан, горгонзола, чеддер', TRUE, ARRAY['Моцарелла', 'Пармезан', 'Горгонзола', 'Чеддер'], '[{"size": "30 СМ", "price": "450", "weight": "250", "measure": "г"}, {"size": "40 СМ", "price": "550", "weight": "350", "measure": "г"}]'::JSONB, '[{"size": "40 СМ", "price": "550", "weight": "350", "measure": "г"}]'::JSONB, 'four_cheeses.jpg', 1),
-- Категория 2: Фастфуд (characteristics пустые, только default; для картошки фри — default по размеру)
('Чизбургер', 'Классический бургер с сочной говяжьей котлетой, плавленым сыром и свежими овощами', TRUE, ARRAY['Булочка', 'Говяжья котлета', 'Чеддер', 'Лук', 'Салат', 'Томат', 'Кетчуп'], '[]'::JSONB, '[{"size": "стандартный", "price": "250", "weight": "250", "measure": "г"}]'::JSONB, 'cheeseburger.jpg', 2),
('Классический хот-дог', 'Хрустящая сосиска в булочке с горчицей, кетчупом и хрустящим огурцом', TRUE, ARRAY['Булочка', 'Сосиска', 'Горчица', 'Кетчуп', 'Огурец', 'Лук'], '[]'::JSONB, '[{"size": "стандартный", "price": "150", "weight": "200", "measure": "г"}]'::JSONB, 'hotdog.jpg', 2),
('Картошка фри', 'Золотистая хрустящая картошка с солью и специями', TRUE, ARRAY['Картофель', 'Соль', 'Паприка'], '[]'::JSONB, '[{"size": "150 г", "price": "175", "weight": "150", "measure": "г"}]'::JSONB, 'fries.jpg', 2),
-- Категория 3: Салаты (characteristics пустые, только default)
('Цезарь', 'Салат с курицей, сухариками и соусом Цезарь', TRUE, ARRAY['Курица', 'Салат романо', 'Сухарики', 'Соус Цезарь'], '[]'::JSONB, '[{"size": "стандартный", "price": "300", "weight": "300", "measure": "г"}]'::JSONB, 'caesar.jpg', 3),
('Греческий', 'Салат с огурцами, помидорами, фетой и оливками', TRUE, ARRAY['Огурцы', 'Помидоры', 'Фета', 'Оливки'], '[]'::JSONB, '[{"size": "стандартный", "price": "250", "weight": "250", "measure": "г"}]'::JSONB, 'greek.jpg', 3),
('Капрезе', 'Салат с моцареллой, томатами и базиликом', TRUE, ARRAY['Моцарелла', 'Томаты', 'Базилик', 'Оливковое масло'], '[]'::JSONB, '[{"size": "стандартный", "price": "250", "weight": "250", "measure": "г"}]'::JSONB, 'caprese.jpg', 3),
-- Категория 4: Напитки (characteristics пустые, только default)
('Кола', '',  TRUE, ARRAY[]::text[], '[]'::JSONB, '[{"size": "300 мл", "price": "100", "quantity": "300", "measure": "мл"}]'::JSONB, 'cola.jpg', 4),
('Lit Energy', '',  TRUE, ARRAY[]::text[], '[]'::JSONB, '[{"size": "300 мл", "price": "150", "quantity": "300", "measure": "мл"}]'::JSONB, 'lit_energy.jpg', 4),
('Burn', '', TRUE, ARRAY[]::text[], '[]'::JSONB, '[{"size": "350 мл", "price": "150", "quantity": "350", "measure": "мл"}]'::JSONB, 'burn.jpg', 4);