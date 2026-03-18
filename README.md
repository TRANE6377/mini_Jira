# Task Tracker (Jira-lite) — Backend

Backend на **FastAPI + PostgreSQL** с миграциями Alembic и JWT-авторизацией.

## Запуск через Docker Compose

Требования: установлен `docker` и `docker-compose` (или `docker compose`).

Из корня репозитория:

```bash
cd docker
docker-compose up --build
```

После старта:
- API: `http://localhost:8000`
- Swagger UI: `http://localhost:8000/docs`

При запуске контейнер:
- применяет миграции `alembic upgrade head`
- запускает seed-данные (идемпотентно)

## Тестовые данные (seed)

Создаются пользователи:
- `alice@example.com` / `alice123`
- `bob@example.com` / `bob123`

## Авторизация (JWT)

1) Зарегистрируйтесь: `POST /auth/register` (JSON)
2) Получите токен: `POST /auth/login` (form-data в Swagger)
   - `username` = email
   - `password` = пароль
3) В Swagger нажмите **Authorize** и вставьте токен как `Bearer <token>`.

## Эндпоинты

Auth:
- `POST /auth/register`
- `POST /auth/login`

Tasks:
- `GET /tasks`
- `POST /tasks`
- `GET /tasks/{id}`
- `PUT /tasks/{id}`
- `DELETE /tasks/{id}`

Comments:
- `POST /tasks/{id}/comments`
- `GET /tasks/{id}/comments`
- `DELETE /tasks/{id}/comments/{comment_id}` (добавлено для удаления комментариев автором)

## Настройки

Переменные окружения (задаются в `docker/docker-compose.yml`):
- `DATABASE_URL`
- `JWT_SECRET_KEY`
- `JWT_ALGORITHM`
- `ACCESS_TOKEN_EXPIRE_MINUTES`
- `DEBUG`

