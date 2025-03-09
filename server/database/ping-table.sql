-- Создание таблицы ping для тестирования соединения
CREATE TABLE IF NOT EXISTS ping (
    id SERIAL PRIMARY KEY,
    message TEXT NOT NULL DEFAULT 'pong',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Добавление тестовых данных
INSERT INTO ping (message) VALUES ('pong') ON CONFLICT DO NOTHING; 