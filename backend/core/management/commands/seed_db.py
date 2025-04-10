from django.core.management.base import BaseCommand
from django.utils import timezone
from django.contrib.auth import get_user_model
import sys
import os
import random
from datetime import timedelta

# Add the project root directory to the Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../')))

# Now we can import from core
from core.models.book import Book, BookBorrowing, WishlistItem

User = get_user_model()

class Command(BaseCommand):
    help = 'Seed database with test data'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Seeding database...'))
        
        # Create users if they don't exist
        self.create_users()
        
        # Create books
        self.create_books()
        
        # Create borrowings and wishlists
        self.create_borrowings_and_wishlists()
        
        self.stdout.write(self.style.SUCCESS('Database seeded successfully!'))
    
    def create_users(self):
        # Create admin user
        if not User.objects.filter(email='admin@example.com').exists():
            admin = User.objects.create_user(
                username='admin',
                email='admin@example.com',
                password='adminpass',
                role='admin'
            )
            self.stdout.write(self.style.SUCCESS(f'Admin user created: {admin.email}'))
        
        # Create reader users
        readers = [
            ('reader1', 'reader1@example.com', 'readerpass'),
            ('reader2', 'reader2@example.com', 'readerpass'),
            ('john', 'john@example.com', 'johnpass'),
            ('sarah', 'sarah@example.com', 'sarahpass'),
        ]
        
        for username, email, password in readers:
            if not User.objects.filter(email=email).exists():
                user = User.objects.create_user(
                    username=username,
                    email=email,
                    password=password,
                    role='reader'
                )
                self.stdout.write(self.style.SUCCESS(f'Reader user created: {user.email}'))
    
    def create_books(self):
        # Sample book data
        books = [
            {
                'title': 'To Kill a Mockingbird',
                'author': 'Harper Lee',
                'description': 'The story of young Scout Finch and the trial of Tom Robinson in a small Southern town.',
                'isbn': '9780061120084',
                'total_copies': 5,
                'available_copies': 3,
                'category': 'fiction',
                'cover_image': 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1553383690i/2657.jpg',
            },
            {
                'title': '1984',
                'author': 'George Orwell',
                'description': 'A dystopian novel set in a totalitarian regime.',
                'isbn': '9780451524935',
                'total_copies': 7,
                'available_copies': 5,
                'category': 'fiction',
                'cover_image': 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1657781256i/61439040.jpg',
            },
            {
                'title': 'The Great Gatsby',
                'author': 'F. Scott Fitzgerald',
                'description': 'A story of wealth, love, and the American Dream in the 1920s.',
                'isbn': '9780743273565',
                'total_copies': 4,
                'available_copies': 4,
                'category': 'fiction',
                'cover_image': 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1490528560i/4671.jpg',
            },
            {
                'title': 'A Brief History of Time',
                'author': 'Stephen Hawking',
                'description': 'An exploration of cosmology and the universe.',
                'isbn': '9780553380163',
                'total_copies': 3,
                'available_copies': 2,
                'category': 'science',
                'cover_image': 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1333578746i/3869.jpg',
            },
            {
                'title': 'The Diary of a Young Girl',
                'author': 'Anne Frank',
                'description': 'The writings from the Dutch-language diary kept by Anne Frank while she was in hiding during the Nazi occupation of the Netherlands.',
                'isbn': '9780553577129',
                'total_copies': 5,
                'available_copies': 5,
                'category': 'biography',
                'cover_image': 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1560816565i/48855.jpg',
            },
            {
                'title': 'The Hobbit',
                'author': 'J.R.R. Tolkien',
                'description': 'A fantasy novel about the adventures of hobbit Bilbo Baggins.',
                'isbn': '9780618260300',
                'total_copies': 6,
                'available_copies': 4,
                'category': 'fantasy',
                'cover_image': 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1546071216i/5907.jpg',
            },
            {
                'title': 'Pride and Prejudice',
                'author': 'Jane Austen',
                'description': 'A romantic novel about the Bennet sisters and their suitors.',
                'isbn': '9780141439518',
                'total_copies': 4,
                'available_copies': 3,
                'category': 'romance',
                'cover_image': 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1320399351i/1885.jpg',
            },
            {
                'title': 'Gone Girl',
                'author': 'Gillian Flynn',
                'description': 'A psychological thriller about a woman who disappears on her fifth wedding anniversary.',
                'isbn': '9780307588371',
                'total_copies': 5,
                'available_copies': 2,
                'category': 'thriller',
                'cover_image': 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1554086139i/19288043.jpg',
            },
            {
                'title': 'Sapiens: A Brief History of Humankind',
                'author': 'Yuval Noah Harari',
                'description': 'A book about the history and evolution of humans.',
                'isbn': '9780062316097',
                'total_copies': 4,
                'available_copies': 3,
                'category': 'non-fiction',
                'cover_image': 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1595674533i/23692271.jpg',
            },
            {
                'title': 'The Da Vinci Code',
                'author': 'Dan Brown',
                'description': 'A mystery thriller about a murder in the Louvre and clues in Da Vinci paintings.',
                'isbn': '9780307474278',
                'total_copies': 6,
                'available_copies': 6,
                'category': 'mystery',
                'cover_image': 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1579621267i/968.jpg',
            },
            {
                'title': 'The Alchemist',
                'author': 'Paulo Coelho',
                'description': 'A philosophical novel about a shepherd boy\'s journey to find treasure in Egypt.',
                'isbn': '9780061122415',
                'total_copies': 5,
                'available_copies': 4,
                'category': 'fiction',
                'cover_image': 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1654371463i/18144590.jpg',
            },
            {
                'title': 'The Catcher in the Rye',
                'author': 'J.D. Salinger',
                'description': 'A novel about teenage alienation and loss of innocence.',
                'isbn': '9780316769488',
                'total_copies': 4,
                'available_copies': 2,
                'category': 'fiction',
                'cover_image': 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1398034300i/5107.jpg',
            },
        ]
        
        # Create books if they don't exist (by ISBN)
        for book_data in books:
            isbn = book_data.pop('isbn', None)
            if isbn and not Book.objects.filter(isbn=isbn).exists():
                book = Book.objects.create(isbn=isbn, **book_data)
                self.stdout.write(self.style.SUCCESS(f'Book created: {book.title} by {book.author}'))
    
    def create_borrowings_and_wishlists(self):
        # Get users and books
        users = User.objects.filter(role='reader')
        books = Book.objects.all()
        
        if not users or not books:
            self.stdout.write(self.style.WARNING('No users or books found to create borrowings and wishlists'))
            return
        
        # Create some borrowings (active and returned)
        for i in range(min(len(books), 8)):  # Borrow up to 8 books
            user = random.choice(users)
            book = books[i]
            
            # Skip if book has no available copies
            if book.available_copies <= 0:
                continue
            
            # Skip if user already has this book
            if BookBorrowing.objects.filter(book=book, user=user, status='active').exists():
                continue
            
            # Create active borrowing
            borrowed_date = timezone.now() - timedelta(days=random.randint(1, 10))
            due_date = borrowed_date + timedelta(days=14)
            
            # borrowing = BookBorrowing.objects.create(
            #     book=book,
            #     user=user,
            #     borrowed_date=borrowed_date,
            #     due_date=due_date,
            #     status='active'
            # )
            
            # Update book available copies
            book.available_copies -= 1
            book.save()
            
            self.stdout.write(self.style.SUCCESS(f'Active borrowing created: {user.username} borrowed {book.title}'))
        
        # Create some returned borrowings
        for i in range(min(len(books), 5)):  # Return up to 5 books
            user = random.choice(users)
            book = books[i + 5 % len(books)]  # Use different books than active borrowings
            
            # Skip if user already has this book
            if BookBorrowing.objects.filter(book=book, user=user).exists():
                continue
            
            # Create returned borrowing
            borrowed_date = timezone.now() - timedelta(days=random.randint(20, 30))
            due_date = borrowed_date + timedelta(days=14)
            returned_date = borrowed_date + timedelta(days=random.randint(5, 12))
            
            BookBorrowing.objects.create(
                book=book,
                user=user,
                borrowed_date=borrowed_date,
                due_date=due_date,
                returned_date=returned_date,
                status='returned'
            )
            
            self.stdout.write(self.style.SUCCESS(f'Returned borrowing created: {user.username} returned {book.title}'))
        
        # Create some wishlist items
        for user in users:
            # Add 2-4 random books to each user's wishlist
            for _ in range(random.randint(2, 4)):
                book = random.choice(books)
                
                # Skip if already in wishlist
                if WishlistItem.objects.filter(user=user, book=book).exists():
                    continue
                
                WishlistItem.objects.create(
                    user=user,
                    book=book
                )
                
                self.stdout.write(self.style.SUCCESS(f'Wishlist item created: {user.username} wishlist includes {book.title}'))
