from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


TaskStatus = Literal["TODO", "IN_PROGRESS", "DONE"]


class TaskCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: str = Field(min_length=1)
    status: TaskStatus = "TODO"
    priority: int | None = None


class TaskUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)
    description: str | None = Field(default=None, min_length=1)
    status: TaskStatus | None = None
    priority: int | None = None


class TaskOut(BaseModel):
    id: int
    title: str
    description: str
    status: TaskStatus
    priority: int | None
    author_id: int
    created_at: datetime

    model_config = {"from_attributes": True}
