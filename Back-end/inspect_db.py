from app import create_app
from app.extensions import db
from sqlalchemy import text

def inspect_table():
    app = create_app()
    with app.app_context():
        print("Inspecting 'rapports' table columns:")
        with db.engine.connect() as conn:
            result = conn.execute(text("SHOW COLUMNS FROM rapports"))
            for row in result:
                print(row)

if __name__ == "__main__":
    inspect_table()
