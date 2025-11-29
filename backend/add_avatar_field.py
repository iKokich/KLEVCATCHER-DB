"""
Migration script to add avatar field to user_profiles table.
Run this script to update the database schema.
"""
import os
import sys

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app
from app.models import db

def add_avatar_field():
    app = create_app()
    with app.app_context():
        # Check if column exists
        result = db.session.execute(db.text("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'user_profiles' AND column_name = 'avatar'
        """))
        
        if result.fetchone() is None:
            # Add the column
            db.session.execute(db.text("""
                ALTER TABLE user_profiles ADD COLUMN avatar TEXT
            """))
            db.session.commit()
            print("✓ Avatar field added to user_profiles table")
        else:
            print("✓ Avatar field already exists")

if __name__ == '__main__':
    add_avatar_field()
