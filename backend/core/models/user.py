from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    id = models.AutoField(primary_key=True)
    ADMIN = 'admin'
    READER = 'reader'
    
    ROLE_CHOICES = [
        (ADMIN, 'Admin'),
        (READER, 'Reader'),
    ]
    
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default=READER)
    email = models.EmailField(unique=True)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']
    
    def is_admin(self):
        return self.role == self.ADMIN
    
    def is_reader(self):
        return self.role == self.READER