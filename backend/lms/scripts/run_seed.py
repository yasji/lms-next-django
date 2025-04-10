import os
import sys
import django

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'lms.settings')
django.setup()

# Now we can use Django's management command system
from django.core.management import call_command

if __name__ == "__main__":
    print("Running database seeder...")
    call_command('seed_db')
    print("Database seeding complete!")
