import os
import sys
import django

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'lms.settings')
django.setup()

# Now we can use Django's management command system
from django.core.management import call_command

if __name__ == "__main__":
    print("Fetching book data from Google Books API...")
    
    # Example usage:
    # 1. Fetch default popular books list:
    call_command('fetch_book_data', output='book_data.json')
    
    # 2. Fetch specific titles (uncomment to use):
    # call_command('fetch_book_data', titles=['The Lord of the Rings', 'Dune', 'Foundation'], output='my_books.json')
    
    # 3. Fetch by ISBNs (uncomment to use):
    # call_command('fetch_book_data', isbns=['9780061120084', '9780451524935'], output='isbn_books.json')
    
    # 4. Output as Python dictionary format (useful for seed_db.py):
    # call_command('fetch_book_data', output='books_for_seed.py', format='python')
    
    print("Book data fetching complete!")
