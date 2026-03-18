from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Task, TaskStatus


def list_tasks(db: Session) -> list[Task]:
    return list(db.scalars(select(Task).order_by(Task.created_at.desc())))


def get_task(db: Session, task_id: int) -> Task:
    task = db.get(Task, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


def create_task(
    db: Session,
    *,
    title: str,
    description: str,
    status: str,
    priority: int | None,
    author_id: int,
) -> Task:
    task = Task(
        title=title,
        description=description,
        status=TaskStatus(status),
        priority=priority,
        author_id=author_id,
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


def update_task(
    db: Session,
    task: Task,
    *,
    updates: dict,
) -> Task:
    if "title" in updates:
        task.title = updates["title"]
    if "description" in updates:
        task.description = updates["description"]
    if "status" in updates:
        task.status = TaskStatus(updates["status"])
    if "priority" in updates:
        task.priority = updates["priority"]
    db.commit()
    db.refresh(task)
    return task


def ensure_task_author(task: Task, user_id: int) -> None:
    if task.author_id != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions")
