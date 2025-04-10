from django.contrib import admin
from django.contrib.auth import get_user_model
from core.models.book import Book, BookBorrowing, WishlistItem

User = get_user_model()

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('username', 'email', 'role', 'is_staff', 'is_active')
    list_filter = ('role', 'is_staff', 'is_active')
    search_fields = ('username', 'email')

@admin.register(Book)
class BookAdmin(admin.ModelAdmin):
    list_display = ('title', 'author', 'isbn', 'status', 'total_copies', 'available_copies', 'category')
    list_filter = ('category', )
    search_fields = ('title', 'author', 'isbn')
    readonly_fields = ('created_at', 'updated_at')

@admin.register(BookBorrowing)
class BookBorrowingAdmin(admin.ModelAdmin):
    list_display = ('book', 'user', 'borrowed_date', 'due_date', 'returned_date', 'status')
    list_filter = ('status',)
    search_fields = ('book__title', 'user__username', 'user__email')

@admin.register(WishlistItem)
class WishlistItemAdmin(admin.ModelAdmin):
    list_display = ('book', 'user', 'added_date')
    search_fields = ('book__title', 'user__username', 'user__email')
