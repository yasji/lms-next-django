from ninja import Schema
from typing import Optional, List, Dict, Any
from datetime import datetime


# Analytics schemas
class MostActiveDaySchema(Schema):
    day: str
    count: int

class AnalyticsSummarySchema(Schema):
    total_books: int
    total_users: int
    total_admins: int
    active_borrowings: int
    overdue_borrowings: int
    low_stock_books: int
    unavailable_books: int
    most_active_day: MostActiveDaySchema

class CategoryCountSchema(Schema):
    category: str
    count: int

class BookBorrowCountSchema(Schema):
    id: int
    title: str
    author: str
    borrow_count: int

class BookStatSchema(Schema):
    categories: List[Dict[str, Any]]
    total_copies: int
    available_copies: int
    borrowed_copies: int
    availability_percentage: float
    most_borrowed: List[Dict[str, Any]]

class MonthlyRegistrationSchema(Schema):
    month: datetime
    count: int

class UserActivitySchema(Schema):
    id: int
    username: str
    email: str
    borrowing_count: int

class UserStatSchema(Schema):
    monthly_registrations: List[Dict[str, Any]]
    top_users_by_borrowing: List[Dict[str, Any]]
    active_users: int
    inactive_users: int

class TimeSeriesDataSchema(Schema):
    time_unit: datetime
    count: int

class BorrowingTrendSchema(Schema):
    period: str
    borrowing_counts: List[Dict[str, Any]]
    return_counts: List[Dict[str, Any]]
    average_borrowing_duration_days: Optional[float]

class PopularBookSchema(Schema):
    id: int
    title: str
    author: str
    category: str
    total_copies: int
    available_copies: int
    borrow_count: int
    wishlist_count: int
    popularity_score: float