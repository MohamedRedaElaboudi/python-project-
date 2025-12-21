from app import create_app, db
from sqlalchemy import text

app = create_app()

with app.app_context():
    print("Updating database schema...")
    try:
        with db.engine.connect() as conn:
            # Check if columns exist (by trying to select them, simplistic check)
            # Or just try to add them and ignore error if exists (MariaDB ignores ADD COLUMN if exists? No, it errors)
            # Better to try/except
            try:
                conn.execute(text("ALTER TABLE plagiat_analyses ADD COLUMN character_count INTEGER DEFAULT 0"))
                print("Added character_count column.")
            except Exception as e:
                print(f"character_count might already exist: {e}")
            
            try:
                conn.execute(text("ALTER TABLE plagiat_analyses ADD COLUMN paragraph_count INTEGER DEFAULT 0"))
                print("Added paragraph_count column.")
            except Exception as e:
                print(f"paragraph_count might already exist: {e}")
            
            conn.commit()
    except Exception as e:
        print(f"Migration failed: {e}")
    
    print("Database schema update attempt finished.")
