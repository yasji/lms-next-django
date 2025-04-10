from ninja import Schema
from typing import Optional
from datetime import datetime

# Book schemas
class BookCreateSchema(Schema):
    title: str
    author: str
    isbn: str
    description: Optional[str] = None
    total_copies: int = 1
    available_copies: Optional[int] = None
    category: str = 'other'
    cover_image: Optional[str] = None

class BookUpdateSchema(Schema):
    title: Optional[str] = None
    author: Optional[str] = None
    description: Optional[str] = None
    isbn: Optional[str] = None
    total_copies: Optional[int] = None
    available_copies: Optional[int] = None
    category: Optional[str] = None
    cover_image: Optional[str] = None

class BookResponseSchema(Schema):
    id: int
    title: str
    author: str
    description: Optional[str]
    isbn: str
    total_copies: int
    available_copies: int
    category: str
    cover_image: Optional[str]
    status: str
    borrowed: int
    created_at: datetime
    updated_at: datetime

# Book Borrowing schemas
class BookBorrowSchema(Schema):
    book_id: int
    due_date: Optional[datetime] = None

class BookReturnSchema(Schema):
    borrowing_id: int

class BookBorrowingResponseSchema(Schema):
    id: int
    book_id: int
    book_title: str
    book_author: Optional[str] = None  # Add author field
    cover_image: Optional[str] = None  # Add cover image field
    borrowed_date: datetime
    due_date: datetime
    returned_date: Optional[datetime]
    status: str
    is_overdue: bool

# Wishlist schemas
class WishlistAddSchema(Schema):
    book_id: int

class WishlistResponseSchema(Schema):
    id: int
    book_id: int
    book_title: str
    book_author: str
    book_status: str
    book_category: str
    added_date: datetime