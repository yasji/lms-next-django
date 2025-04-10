from django.db import models
from .user import User

class Book(models.Model):
    STATUS_CHOICES = [
        ('Available', 'Available'),
        ('Low Stock', 'Low Stock'),
        ('Unavailable', 'Unavailable'),
    ]

    CATEGORY_CHOICES = [
        ('fiction', 'Fiction'),
        ('non-fiction', 'Non-Fiction'),
        ('science', 'Science'),
        ('history', 'History'),
        ('biography', 'Biography'),
        ('fantasy', 'Fantasy'),
        ('mystery', 'Mystery'),
        ('romance', 'Romance'),
        ('thriller', 'Thriller'),
        ('poetry', 'Poetry'),
        ('other', 'Other'),
    ]

    title = models.CharField(max_length=255)
    author = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    isbn = models.CharField(max_length=20, unique=True)
    total_copies = models.PositiveIntegerField(default=1)
    available_copies = models.PositiveIntegerField(default=1)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='other')
    cover_image = models.URLField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    @property
    def status(self):
        if self.available_copies == 0:
            return 'Unavailable'
        elif self.available_copies <= self.total_copies * 0.2:  # 20% or less copies available
            return 'Low Stock'
        else:
            return 'Available'
    
    @property
    def borrowed(self):
        return self.total_copies - self.available_copies
    
    def __str__(self):
        return f"{self.title} by {self.author}"
    
# BookBorrowing model to track borrowings  
class BookBorrowing(models.Model):
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('returned', 'Returned'),
        ('overdue', 'Overdue'),
    ]
    
    book = models.ForeignKey(Book, on_delete=models.CASCADE, related_name='borrowings')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='borrowed_books')
    borrowed_date = models.DateTimeField(auto_now_add=True)
    due_date = models.DateTimeField()
    returned_date = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='active')
    
    def __str__(self):
        return f"{self.book.title} borrowed by {self.user.username}"
    
    
# WishlistItem model to track user's wishlist
class WishlistItem(models.Model):
    book = models.ForeignKey(Book, on_delete=models.CASCADE, related_name='wishlisted_by')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='wishlist')
    added_date = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('book', 'user')
    
    def __str__(self):
        return f"{self.book.title} wishlisted by {self.user.username}"
    
