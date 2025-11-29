"""
Script to add is_blocked column to users table.
Run this script once to update the database schema.
"""
import os
import sys

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app
from app.models import db

def add_is_blocked_column():
    app = create_app()
    with app.app_context():
        try:
            # Check if column exists
            result = db.session.execute(db.text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'users' AND column_name = 'is_blocked'
            """))
            
            if result.fetchone() is None:
                # Add the column
                db.session.execute(db.text("""
                    ALTER TABLE users ADD COLUMN is_blocked BOOLEAN DEFAULT FALSE
                """))
                db.session.commit()
                print("✓ Column 'is_blocked' added successfully!")
            else:
                print("Column 'is_blocked' already exists.")
                
        except Exception as e:
            print(f"Error: {e}")
            db.session.rollback()

if __name__ == '__main__':
    add_is_blocked_column()
