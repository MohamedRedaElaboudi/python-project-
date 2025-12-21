from app import create_app
from app.extensions import db
from sqlalchemy import text
import sys

def add_column():
    app = create_app()
    with app.app_context():
        print("Checking 'rapports' table for 'status' column...")
        with db.engine.connect() as conn:
            # Check if column exists
            result = conn.execute(text("SHOW COLUMNS FROM rapports LIKE 'status'"))
            if result.fetchone():
                print("Column 'status' already exists.")
            else:
                print("Column 'status' missing. Adding it...")
                try:
                    conn.execute(text("ALTER TABLE rapports ADD COLUMN status VARCHAR(20) DEFAULT 'pending'"))
                    conn.commit()
                    print("Column 'status' added successfully.")
                except Exception as e:
                    print(f"Error adding column: {e}")
                    sys.exit(1)

if __name__ == "__main__":
    add_column()
