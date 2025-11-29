"""Create alerts table for notifications"""
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from app import create_app
from app.models import db
from sqlalchemy import text

def create_alerts_table():
    app = create_app()
    with app.app_context():
        try:
            with db.engine.begin() as conn:
                conn.execute(text("""
                    CREATE TABLE IF NOT EXISTS alerts (
                        id SERIAL PRIMARY KEY,
                        type VARCHAR(50) NOT NULL,
                        message TEXT NOT NULL,
                        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
                        username VARCHAR(100),
                        created_at TIMESTAMP DEFAULT NOW()
                    )
                """))
                
                # Create index for faster queries
                conn.execute(text("""
                    CREATE INDEX IF NOT EXISTS idx_alerts_created_at 
                    ON alerts(created_at DESC)
                """))
                
            print("✓ Successfully created 'alerts' table")
        except Exception as e:
            print(f"Error creating alerts table: {e}")
            import traceback
            traceback.print_exc()

if __name__ == '__main__':
    create_alerts_table()
