from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Comment


def list_comments(db: Session, task_id: int) -> list[Comment]:
    return list(db.scalars(select(Comment).where(Comment.task_id == task_id).order_by(Comment.created_at)))


def create_comment(db: Session, *, task_id: int, text: str, author_id: int) -> Comment:
    comment = Comment(task_id=task_id, text=text, author_id=author_id)
    db.add(comment)
    db.commit()
    db.refresh(comment)
    return comment


def get_comment(db: Session, comment_id: int) -> Comment:
    comment = db.get(Comment, comment_id)
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    return comment


def ensure_comment_author(comment: Comment, user_id: int) -> None:
    if comment.author_id != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions")


def delete_comment(db: Session, comment: Comment) -> None:
    db.delete(comment)
    db.commit()
