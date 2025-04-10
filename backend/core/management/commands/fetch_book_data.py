import json
import requests
import time
import random
from django.core.management.base import BaseCommand

class Command(BaseCommand):
    help = 'Fetch book data from Google Books API based on title or ISBN'

    def add_arguments(self, parser):
        parser.add_argument('--titles', type=str, nargs='*', help='List of book titles to fetch')
        parser.add_argument('--isbns', type=str, nargs='*', help='List of ISBNs to fetch')
        parser.add_argument('--output', type=str, default='book_data.json', help='Output JSON file path')
        parser.add_argument('--format', choices=['json', 'python'], default='json', 
                            help='Output format (json or Python dictionary format)')

    def handle(self, *args, **options):
        titles = options.get('titles') or []
        isbns = options.get('isbns') or []
        output_file = options.get('output')
        output_format = options.get('format')
        
        if not titles and not isbns:
            # Default list of popular book titles
            titles = [
                "To Kill a Mockingbird", "1984", "The Great Gatsby", 
                "Pride and Prejudice", "The Hobbit", "Harry Potter and the Sorcerer's Stone",
                "The Catcher in the Rye", "Lord of the Flies", "Animal Farm",
                "The Diary of a Young Girl", "The Alchemist", "The Da Vinci Code",
                "Gone Girl", "A Brief History of Time", "Sapiens: A Brief History of Humankind"
            ]
            self.stdout.write(self.style.WARNING('No titles or ISBNs provided, using default popular book titles.'))
        
        books_data = []
        
        # Fetch by title
        for title in titles:
            self.stdout.write(f"Fetching data for title: {title}")
            book_data = self.fetch_book_by_title(title)
            if book_data:
                books_data.append(book_data)
                # Sleep to avoid hitting API rate limits
                time.sleep(1)
            
        # Fetch by ISBN
        for isbn in isbns:
            self.stdout.write(f"Fetching data for ISBN: {isbn}")
            book_data = self.fetch_book_by_isbn(isbn)
            if book_data:
                books_data.append(book_data)
                # Sleep to avoid hitting API rate limits
                time.sleep(1)
        
        # Write output
        if books_data:
            if output_format == 'json':
                self.write_json_output(books_data, output_file)
            else:
                self.write_python_output(books_data, output_file)
            
            self.stdout.write(self.style.SUCCESS(f'Successfully fetched {len(books_data)} books and saved to {output_file}'))
        else:
            self.stdout.write(self.style.ERROR('No book data was fetched.'))
    
    def fetch_book_by_title(self, title):
        """Fetch book data from Google Books API by title"""
        url = f"https://www.googleapis.com/books/v1/volumes?q=intitle:{title}&maxResults=1"
        return self._fetch_book_data(url, title)
    
    def fetch_book_by_isbn(self, isbn):
        """Fetch book data from Google Books API by ISBN"""
        # Remove hyphens if present
        isbn = isbn.replace('-', '')
        url = f"https://www.googleapis.com/books/v1/volumes?q=isbn:{isbn}"
        return self._fetch_book_data(url, f"ISBN: {isbn}")
    
    def _fetch_book_data(self, url, identifier):
        """Fetch and process book data from Google Books API"""
        try:
            response = requests.get(url)
            response.raise_for_status()
            data = response.json()
            
            if data.get('items'):
                volume_info = data['items'][0]['volumeInfo']
                
                # Extract relevant data
                title = volume_info.get('title', 'Unknown Title')
                authors = volume_info.get('authors', ['Unknown Author'])
                description = volume_info.get('description', '')
                categories = volume_info.get('categories', ['fiction'])
                
                # Extract ISBN if available
                isbn = 'Unknown'
                for identifier in volume_info.get('industryIdentifiers', []):
                    if identifier.get('type') in ['ISBN_13', 'ISBN_10']:
                        isbn = identifier.get('identifier', 'Unknown')
                        break
                
                # Extract cover image URL
                cover_image = None
                if 'imageLinks' in volume_info:
                    # Try to get the largest available image
                    for img_type in ['extraLarge', 'large', 'medium', 'thumbnail', 'smallThumbnail']:
                        if img_type in volume_info['imageLinks']:
                            cover_image = volume_info['imageLinks'][img_type]
                            # Convert from http to https if needed
                            if cover_image.startswith('http://'):
                                cover_image = 'https://' + cover_image[7:]
                            break
                
                # Format for our model
                book_data = {
                    'title': title,
                    'author': authors[0] if authors else 'Unknown Author',
                    'description': description[:500] if description else 'No description available.',
                    'isbn': isbn,
                    'total_copies': random.randint(3, 10),
                    'available_copies': random.randint(1, 3),
                    'category': categories[0].lower() if categories else 'fiction',
                    'cover_image': cover_image
                }
                
                self.stdout.write(self.style.SUCCESS(f"Found: {title} by {book_data['author']}"))
                return book_data
            else:
                self.stdout.write(self.style.WARNING(f"No results found for {identifier}"))
                return None
                
        except requests.exceptions.RequestException as e:
            self.stdout.write(self.style.ERROR(f"Error fetching data for {identifier}: {str(e)}"))
            return None
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Unexpected error for {identifier}: {str(e)}"))
            return None
    
    def write_json_output(self, books_data, output_file):
        """Write book data to JSON file"""
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(books_data, f, indent=4)
    
    def write_python_output(self, books_data, output_file):
        """Write book data as Python list of dictionaries"""
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write("books = [\n")
            for i, book in enumerate(books_data):
                f.write("    {\n")
                for key, value in book.items():
                    if isinstance(value, str):
                        f.write(f"        '{key}': '{value.replace('\'', '\\\'')}',\n")
                    else:
                        f.write(f"        '{key}': {value},\n")
                if i < len(books_data) - 1:
                    f.write("    },\n")
                else:
                    f.write("    }\n")
            f.write("]\n")
