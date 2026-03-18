# Task Tracker

Простой трекер задач (Jira-lite) на **Python (FastAPI)** и **React**.

## Как запустить

В корне проекта:

```bash
cd docker
docker-compose up -d --build
```

После запуска:
- Frontend: `http://localhost:3000`
- Backend (Swagger): `http://localhost:8000/docs`

## Что умеет

- Регистрация
- Логин
- Канбан-доска задач (TODO / IN_PROGRESS / DONE)
- Создание / редактирование / удаление задач (CRUD)

