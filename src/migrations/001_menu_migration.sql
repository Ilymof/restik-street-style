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
    dish_weight VARCHAR(50),
    composition TEXT[],
    size JSONB,
    resize BOOLEAN DEFAULT FALSE,
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
INSERT INTO dish (name, description, dish_weight, dish_status, composition, size, resize, image, categoryid)
VALUES
-- Категория 1: Пицца
('Маргарита', 'Классическая пицца с томатным соусом и моцареллой', '400', TRUE, ARRAY['Томатный соус', 'Моцарелла', 'Базилик'], '{"30": 450, "40": 550}'::jsonb, TRUE, 'margherita.jpg', 1),
('Пепперони','Пицца с острой колбасой пепперони и сыром', '450', TRUE, ARRAY['Томатный соус', 'Пепперони', 'Моцарелла'], '{"30": 450, "40": 550}'::jsonb, TRUE, 'pepperoni.jpg', 1),
('Четыре сыра','Пицца с миксом сыров: моцарелла, пармезан, горгонзола, чеддер', '500', TRUE, ARRAY['Моцарелла', 'Пармезан', 'Горгонзола', 'Чеддер'], '{"30": 450, "40": 550}'::jsonb, TRUE, 'four_cheeses.jpg', 1),
-- Категория 2: Фастфуд
('Чизбургер','Классический бургер с сочной говяжьей котлетой, плавленым сыром и свежими овощами', '250', TRUE, ARRAY['Булочка', 'Говяжья котлета', 'Чеддер', 'Лук', 'Салат', 'Томат', 'Кетчуп'], '{"default": 250}'::jsonb, FALSE, 'cheeseburger.jpg', 2),
('Классический хот-дог','Хрустящая сосиска в булочке с горчицей, кетчупом и хрустящим огурцом', '200', TRUE, ARRAY['Булочка', 'Сосиска', 'Горчица', 'Кетчуп', 'Огурец', 'Лук'], '{"default": 250}'::jsonb, FALSE, 'hotdog.jpg', 2),
('Картошка фри','Золотистая хрустящая картошка с солью и специями', '300', TRUE, ARRAY['Картофель', 'Соль', 'Паприка'], '{"100": 125, "150": 175}'::jsonb, TRUE, 'fries.jpg', 2),
-- Категория 3: Салаты
('Цезарь','Салат с курицей, сухариками и соусом Цезарь', '300', TRUE, ARRAY['Курица', 'Салат романо', 'Сухарики', 'Соус Цезарь'], '{"default": 350}'::jsonb, FALSE, 'caesar.jpg', 3),
('Греческий','Салат с огурцами, помидорами, фетой и оливками', '250', TRUE, ARRAY['Огурцы', 'Помидоры', 'Фета', 'Оливки'], '{"default": 400}'::jsonb, FALSE, 'greek.jpg', 3),
('Капрезе','Салат с моцареллой, томатами и базиликом', '250', TRUE, ARRAY['Моцарелла', 'Томаты', 'Базилик', 'Оливковое масло'], '{"default": 350}'::jsonb, FALSE, 'caprese.jpg', 3),
-- Категория 4: Напитки
('Кола','', '300', TRUE, ARRAY[]::text[], '{"250": 80, "495": 125}'::jsonb, TRUE, 'cola.jpg', 4),
('Lit Energy','', '300', TRUE, ARRAY[]::text[], '{"250": 125, "495": 175}'::jsonb, TRUE, 'lit_energy.jpg', 4),
('Burn','', '350', TRUE, ARRAY[]::text[], '{"250": 125, "495": 175}'::jsonb, TRUE, 'burn.jpg', 4);