# Database Migrations

Этот каталог содержит SQL миграции для обновления схемы базы данных.

## Применение миграций

### Автоматически (через Python скрипт)
```bash
python add_status_to_reports.py
```

### Вручную (через psql)
```bash
psql -U your_user -d your_database -f migrations/001_add_status_to_reports.sql
```

## История миграций

| Миграция | Дата | Описание |
|----------|------|----------|
| 001_add_status_to_reports.sql | 2025-11-28 | Добавлена колонка `status` в таблицу `reports` для отслеживания статуса отчетов (In Process/Done) |
| 002_create_alerts_table.sql | 2025-11-28 | Создана таблица `alerts` для системы уведомлений о новых отчетах, угрозах и Sigma Rules |

## Текущая схема

Полная обновленная схема базы данных находится в файле `DATABASE_SCHEMA_UPDATED.sql` в корне проекта.
