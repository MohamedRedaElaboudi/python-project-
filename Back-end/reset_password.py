from app import create_app, db
from app.models import User
from werkzeug.security import generate_password_hash

app = create_app()

with app.app_context():
    user = User.query.get(1)
    if user:
        print(f"Resetting password for {user.email}...")
        user.password = generate_password_hash('password')
        db.session.commit()
        print("Password reset to 'password'.")
    else:
        print("User 1 not found.")
