from ninja_extra import api_controller, route
from ninja.errors import HttpError
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from typing import List, Optional
from core.schemas.users import (
    UserListSchema, UserCreateSchema, UserUpdateSchema
)
# from .schemas import UserListSchema, UserCreateSchema, UserUpdateSchema
from ..permissions import IsAdmin

User = get_user_model()

# Create instances of permission classes
is_admin = IsAdmin()

@api_controller('/users')
class UserController:
    @route.get('', response=List[UserListSchema], auth=is_admin)
    def list_users(self, request, search: Optional[str] = None):
        """Get all users (admin only)"""
        users = User.objects.all()
        
        if search:
            users = users.filter(
                username__icontains=search
            ) | users.filter(
                email__icontains=search
            )
            
        return users
    
    @route.get('/{user_id}', response=UserListSchema, auth=is_admin)
    def get_user(self, request, user_id: int):
        """Get details of a specific user (admin only)"""
        user = get_object_or_404(User, id=user_id)
        return user
    
    @route.post('', response=UserListSchema, auth=is_admin)
    def create_user(self, request, data: UserCreateSchema):
        """Create a new user (admin only)"""
        # Check if email already exists
        if User.objects.filter(email=data.email).exists():
            raise HttpError(400, "Email already registered")
        
        # Create user
        user = User.objects.create_user(
            username=data.username,
            email=data.email,
            password=data.password,
            role=data.role
        )
        
        return user
    
    @route.put('/{user_id}', response=UserListSchema, auth=is_admin)
    def update_user(self, request, user_id: int, data: UserUpdateSchema):
        """Update a user (admin only)"""
        user = get_object_or_404(User, id=user_id)
        
        # Update fields if provided
        if data.username:
            user.username = data.username
        if data.email:
            # Check if new email is taken by another user
            if User.objects.exclude(id=user_id).filter(email=data.email).exists():
                raise HttpError(400, "Email already in use by another user")
            user.email = data.email
        if data.role:
            user.role = data.role
        if data.is_active is not None:
            user.is_active = data.is_active
        
        # Update password if provided
        if data.password:
            user.set_password(data.password)
            
        user.save()
        return user
    
    @route.delete('/{user_id}', auth=is_admin)
    def delete_user(self, request, user_id: int):
        """Delete a user (admin only)"""
        # Don't allow users to delete themselves
        if request.user.id == user_id:
            raise HttpError(400, "You cannot delete your own account")
            
        user = get_object_or_404(User, id=user_id)
        user.delete()
        return {"success": True, "message": "User deleted successfully"}
