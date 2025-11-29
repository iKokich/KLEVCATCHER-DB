"""Add status column to reports table"""
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from app import create_app
from app.models import db
from sqlalchemy import text

def add_status_column():
    app = create_app()
    with app.app_context():
        try:
            # Add status column with default value
            with db.engine.begin() as conn:
                conn.execute(text("""
                    ALTER TABLE reports 
                    ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'In Process'
                """))
            print("✓ Successfully added 'status' column to reports table")
        except Exception as e:
            print(f"Error adding status column: {e}")
            import traceback
            traceback.print_exc()

if __name__ == '__main__':
    add_status_column()
