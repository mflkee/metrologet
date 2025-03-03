#!/bin/bash

# 1. Устанавливаем PostgreSQL (если не установлен)
sudo pacman -S --needed postgresql

# 2. Инициализируем кластер БД (если ещё не сделано)
sudo -u postgres initdb -D /var/lib/postgres/data

# 3. Запускаем службу PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# 4. Создаем пользователя и базу данных
sudo -u postgres psql << EOF
CREATE USER postgres WITH PASSWORD '7405';
CREATE DATABASE monitoring OWNER postgres;
GRANT ALL PRIVILEGES ON DATABASE monitoring TO postgres;
EOF

echo "База данных 'monitoring' и пользователь 'postgres' успешно созданы!"

# 5. Проверяем подключение
echo "Проверка подключения..."
psql -h localhost -U postgres -d monitoring -c "SELECT 'Connected!' AS status;"

# 6. Создаем таблицы через SQLAlchemy
echo "Создаем таблицы..."
python -c "from app.database import Base, engine; Base.metadata.create_all(bind=engine)"

echo "Все готово! Теперь можно запускать приложение."
