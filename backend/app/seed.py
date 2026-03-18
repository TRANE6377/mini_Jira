from sqlalchemy import select

from app.db import SessionLocal
from app.models import Comment, Task, TaskStatus, User
from app.services.security import hash_password


def seed() -> None:
    with SessionLocal() as db:
        user1 = db.scalar(select(User).where(User.email == "alice@example.com"))
        if not user1:
            user1 = User(email="alice@example.com", password_hash=hash_password("alice123"))
            db.add(user1)

        user2 = db.scalar(select(User).where(User.email == "bob@example.com"))
        if not user2:
            user2 = User(email="bob@example.com", password_hash=hash_password("bob123"))
            db.add(user2)

        db.commit()
        db.refresh(user1)
        db.refresh(user2)

        existing_tasks = list(db.scalars(select(Task).limit(1)))
        if existing_tasks:
            return

        t1 = Task(
            title="First task",
            description="Create basic project structure",
            status=TaskStatus.TODO,
            priority=1,
            author_id=user1.id,
        )
        t2 = Task(
            title="Second task",
            description="Implement authentication",
            status=TaskStatus.IN_PROGRESS,
            priority=2,
            author_id=user2.id,
        )
        db.add_all([t1, t2])
        db.commit()
        db.refresh(t1)
        db.refresh(t2)

        db.add_all(
            [
                Comment(task_id=t1.id, text="Looks good, let's start.", author_id=user2.id),
                Comment(task_id=t2.id, text="JWT tokens should expire.", author_id=user1.id),
            ]
        )
        db.commit()


if __name__ == "__main__":
    seed()

