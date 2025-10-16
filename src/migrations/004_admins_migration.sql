DROP TABLE IF EXISTS admins CASCADE;

CREATE TABLE admins (
   id SERIAL PRIMARY KEY,
   username VARCHAR(255) NOT NULL UNIQUE,
   name VARCHAR(50),
   password VARCHAR(255) NOT NULL,
   role INTEGER NOT NULL CHECK (role > 0 AND role < 3),
   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO admins (username, name, password, role)
VALUES ('superuser', 'супер-пользователь', '$2b$10$PwVCKHCMU.Q/.iSG2HIsKe8XXWcZLqh59FJNJj6EzNiQzybD4JkSm', 2);