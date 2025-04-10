from ninja import Schema
from typing import Optional
from datetime import datetime
from django.contrib.auth import get_user_model
from .users import UserSchema



User = get_user_model()

# Event schemas
class EventIn(Schema):
    title: str
    description: str
    location: str
    start_date: datetime
    end_date: datetime
    capacity: int = 0
    category: Optional[str] = None
    image: Optional[str] = None
    is_active: bool = True

class EventOut(Schema):
    id: int
    title: str
    description: str
    location: str
    start_date: datetime
    end_date: datetime
    capacity: int
    category: Optional[str]
    image: Optional[str]
    created_by: UserSchema
    created_at: datetime
    updated_at: datetime
    is_active: bool
    registered_count: int

class EventRegistrationIn(Schema):
    event_id: int

class EventRegistrationOut(Schema):
    id: int
    event: EventOut
    user: UserSchema
    registration_date: datetime
    attended: bool
