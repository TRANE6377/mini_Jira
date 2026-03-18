from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.orm import Session

from app.db import get_db
from app.deps import get_current_user
from app.models import User
from app.schemas import CommentCreate, CommentOut, TaskCreate, TaskOut, TaskUpdate
from app.services.comments import (
    create_comment,
    delete_comment,
    ensure_comment_author,
    get_comment,
    list_comments,
)
from app.services.tasks import (
    create_task,
    ensure_task_author,
    get_task,
    list_tasks,
    update_task,
)

router = APIRouter(prefix="/tasks", tags=["tasks"])


@router.get("", response_model=list[TaskOut])
def get_tasks(db: Session = Depends(get_db), _: User = Depends(get_current_user)) -> list[TaskOut]:
    return list_tasks(db)


@router.post("", response_model=TaskOut, status_code=status.HTTP_201_CREATED)
def post_task(
    payload: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> TaskOut:
    return create_task(
        db,
        title=payload.title,
        description=payload.description,
        status=payload.status,
        priority=payload.priority,
        author_id=current_user.id,
    )


@router.get("/{task_id}", response_model=TaskOut)
def get_task_by_id(
    task_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
) -> TaskOut:
    return get_task(db, task_id)


@router.put("/{task_id}", response_model=TaskOut)
def put_task(
    task_id: int,
    payload: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> TaskOut:
    task = get_task(db, task_id)
    ensure_task_author(task, current_user.id)
    updates = payload.model_dump(exclude_unset=True)
    return update_task(
        db,
        task,
        updates=updates,
    )


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Response:
    task = get_task(db, task_id)
    ensure_task_author(task, current_user.id)
    db.delete(task)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post("/{task_id}/comments", response_model=CommentOut, status_code=status.HTTP_201_CREATED)
def post_comment(
    task_id: int,
    payload: CommentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> CommentOut:
    _ = get_task(db, task_id)
    return create_comment(db, task_id=task_id, text=payload.text, author_id=current_user.id)


@router.get("/{task_id}/comments", response_model=list[CommentOut])
def get_comments(
    task_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
) -> list[CommentOut]:
    _ = get_task(db, task_id)
    return list_comments(db, task_id)


@router.delete("/{task_id}/comments/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_comment_by_id(
    task_id: int,
    comment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Response:
    _ = get_task(db, task_id)
    comment = get_comment(db, comment_id)
    if comment.task_id != task_id:
        return Response(status_code=status.HTTP_404_NOT_FOUND)
    ensure_comment_author(comment, current_user.id)
    delete_comment(db, comment)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
