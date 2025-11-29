# backend/init_db.py
from app import create_app
from app.models import db

# Создаем экземпляр нашего Flask-приложения
app = create_app()

# app_context() необходим, чтобы SQLAlchemy знал, к какой базе данных подключаться
with app.app_context():
    print("Инициализация базы данных...")

    db.create_all()
    print("База данных успешно инициализирована!")