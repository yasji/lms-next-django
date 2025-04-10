from ninja_extra import api_controller, route
from ninja.errors import HttpError
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db import models  # Added for Q objects
from datetime import timedelta
from typing import List, Optional
from core.models.book import Book, BookBorrowing, WishlistItem
from core.schemas.book import (
    BookCreateSchema, BookUpdateSchema, BookResponseSchema,
    BookBorrowSchema, BookReturnSchema, BookBorrowingResponseSchema,
    WishlistAddSchema, WishlistResponseSchema
)
# from .schemas import (
#     BookCreateSchema, BookUpdateSchema, BookResponseSchema,
#     BookBorrowSchema, BookReturnSchema, BookBorrowingResponseSchema,
#     WishlistAddSchema, WishlistResponseSchema
# )
from ..permissions import IsAdmin, IsAuthenticated, IsReader

# Create instances of permission classes
is_admin = IsAdmin()
is_authenticated = IsAuthenticated()
is_reader = IsReader()

@api_controller('/books')
class BookController:
    @route.get('', response=List[BookResponseSchema], auth=is_authenticated)
    def list_books(self, request, category: Optional[str] = None, search: Optional[str] = None):
        """Get all books with optional filtering - requires authentication (admin or reader)"""
        books = Book.objects.all()
        
        if category and category.lower() != 'all':
            books = books.filter(category=category)
            
        if search:
            books = books.filter(
                models.Q(title__icontains=search) | 
                models.Q(author__icontains=search) |
                models.Q(isbn__icontains=search)
            )
            
        return books
    
    @route.get('/{book_id}', response=BookResponseSchema, auth=is_authenticated)
    def get_book(self, request, book_id: int):
        """Get details of a specific book - requires authentication (admin or reader)"""
        book = get_object_or_404(Book, id=book_id)
        return book
    
    @route.post('', response=BookResponseSchema, auth=is_admin)
    def create_book(self, request, data: BookCreateSchema):
        """Create a new book (admin only)"""
        # Set available_copies to total_copies if not specified
        available_copies = data.available_copies
        if available_copies is None:
            available_copies = data.total_copies
        
        book = Book.objects.create(
            title=data.title,
            author=data.author,
            description=data.description,
            isbn=data.isbn,
            total_copies=data.total_copies,
            available_copies=available_copies,
            category=data.category,
            cover_image=data.cover_image
        )
        return book
    
    @route.put('/{book_id}', response=BookResponseSchema, auth=is_admin)
    def update_book(self, request, book_id: int, data: BookUpdateSchema):
        """Update a book (admin only)"""
        book = get_object_or_404(Book, id=book_id)
        
        # Update fields if provided
        if data.title:
            book.title = data.title
        if data.author:
            book.author = data.author
        if data.description is not None:
            book.description = data.description
        if data.isbn:
            book.isbn = data.isbn
        if data.total_copies is not None:
            book.total_copies = data.total_copies
        if data.available_copies is not None:
            book.available_copies = data.available_copies
        if data.category:
            book.category = data.category
        if data.cover_image is not None:
            book.cover_image = data.cover_image
            
        book.save()
        return book
    
    @route.delete('/{book_id}', auth=is_admin)
    def delete_book(self, request, book_id: int):
        """Delete a book (admin only)"""
        book = get_object_or_404(Book, id=book_id)
        book.delete()
        return {"success": True, "message": "Book deleted successfully"}

@api_controller('/reader')
class ReaderBookController:
    @route.post('/borrow', response=BookBorrowingResponseSchema, auth=is_reader)
    def borrow_book(self, request, data: BookBorrowSchema):
        """Borrow a book (reader only)"""
        book = get_object_or_404(Book, id=data.book_id)
        
        # Check if book is available
        if book.available_copies <= 0:
            raise HttpError(400, "Book is not available for borrowing")
            
        # Check if user already has this book
        if BookBorrowing.objects.filter(
            book=book, 
            user=request.user, 
            status='active'
        ).exists():
            raise HttpError(400, "You have already borrowed this book")
            
        # Default due date is 14 days from now if not specified
        due_date = data.due_date if data.due_date else timezone.now() + timedelta(days=14)
        
        # Create borrowing record
        borrowing = BookBorrowing.objects.create(
            book=book,
            user=request.user,
            due_date=due_date
        )
        
        # Update available copies
        book.available_copies -= 1
        book.save()
        
        return {
            "id": borrowing.id,
            "book_id": book.id,
            "book_title": book.title,
            "borrowed_date": borrowing.borrowed_date,
            "due_date": borrowing.due_date,
            "returned_date": None,
            "status": borrowing.status,
            "is_overdue": borrowing.due_date < timezone.now()
        }
    
    @route.post('/return', response=dict, auth=is_authenticated)
    def return_book(self, request, data: BookReturnSchema):
        """Return a borrowed book"""
        borrowing = get_object_or_404(
            BookBorrowing, 
            id=data.borrowing_id, 
            user=request.user, 
            status='active'
        )
        
        # Update borrowing record
        borrowing.returned_date = timezone.now()
        borrowing.status = 'returned'
        borrowing.save()
        
        # Update available copies
        book = borrowing.book
        book.available_copies += 1
        book.save()
        
        return {"success": True, "message": "Book returned successfully"}
    
    @route.get('/my-books', response=List[BookBorrowingResponseSchema], auth=is_authenticated)
    def my_books(self, request, status: Optional[str] = None):
        """Get books borrowed by the current user"""
        borrowings = BookBorrowing.objects.filter(user=request.user)
        
        if status:
            borrowings = borrowings.filter(status=status)
            
        response = []
        for borrowing in borrowings:
            response.append({
                "id": borrowing.id,
                "book_id": borrowing.book.id,
                "book_title": borrowing.book.title,
                "book_author": borrowing.book.author,  # Add author
                "cover_image": borrowing.book.cover_image,  # Add cover image
                "borrowed_date": borrowing.borrowed_date,
                "due_date": borrowing.due_date,
                "returned_date": borrowing.returned_date,
                "status": borrowing.status,
                "is_overdue": borrowing.due_date < timezone.now() and borrowing.status == 'active'
            })
            
        return response
    
    @route.post('/wishlist/add', response=WishlistResponseSchema, auth=is_authenticated)
    def add_to_wishlist(self, request, data: WishlistAddSchema):
        """Add a book to user's wishlist"""
        book = get_object_or_404(Book, id=data.book_id)
        
        # Check if already in wishlist
        if WishlistItem.objects.filter(user=request.user, book=book).exists():
            raise HttpError(400, "Book is already in your wishlist")
            
        wishlist_item = WishlistItem.objects.create(
            user=request.user,
            book=book
        )
        
        return {
            "id": wishlist_item.id,
            "book_id": book.id,
            "book_title": book.title,
            "book_author": book.author,
            "book_status": book.status,
            "book_category": book.category,
            "added_date": wishlist_item.added_date
        }
    
    @route.delete('/wishlist/{item_id}', auth=is_authenticated)
    def remove_from_wishlist(self, request, item_id: int):
        """Remove a book from user's wishlist"""
        wishlist_item = get_object_or_404(WishlistItem, id=item_id, user=request.user)
        wishlist_item.delete()
        
        return {"success": True, "message": "Book removed from wishlist"}
    
    @route.get('/wishlist', response=List[WishlistResponseSchema], auth=is_authenticated)
    def get_wishlist(self, request):
        """Get user's wishlist"""
        wishlist_items = WishlistItem.objects.filter(user=request.user)
        
        response = []
        for item in wishlist_items:
            response.append({
                "id": item.id,
                "book_id": item.book.id,
                "book_title": item.book.title,
                "book_author": item.book.author,
                "book_status": item.book.status,
                "book_category": item.book.category,
                "added_date": item.added_date
            })
            
        return response
