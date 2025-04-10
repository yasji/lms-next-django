from ninja import Schema, ModelSchema
from typing import Optional
from django.contrib.auth import get_user_model


User = get_user_model()


class UserRegisterSchema(Schema):
    email: str
    username: str
    password: str
    role: str = 'reader'

class UserLoginSchema(Schema):
    email: str
    password: str

class UserSchema(Schema):
    id: int
    email: str
    username: str
    role: str
    
class TokenSchema(Schema):
    access: str
    refresh: str

class AuthResponseSchema(Schema):
    user: UserSchema
    token: TokenSchema
    
    
# User management schemas
class UserCreateSchema(Schema):
    username: str
    email: str
    password: str
    role: str = 'reader'

class UserUpdateSchema(Schema):
    username: Optional[str] = None
    email: Optional[str] = None
    password: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None

class UserListSchema(ModelSchema):
    borrowing_count: int
    
    @staticmethod
    def resolve_borrowing_count(obj):
        return obj.borrowed_books.filter(status='active').count()
    
    class Config:
        model = User
        model_fields = ['id', 'username', 'email', 'role', 'is_active', 'date_joined']