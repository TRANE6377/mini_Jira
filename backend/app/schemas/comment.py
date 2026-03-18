from datetime import datetime

from pydantic import BaseModel, Field


class CommentCreate(BaseModel):
    text: str = Field(min_length=1)


class CommentOut(BaseModel):
    id: int
    task_id: int
    text: str
    author_id: int
    created_at: datetime

    model_config = {"from_attributes": True}
