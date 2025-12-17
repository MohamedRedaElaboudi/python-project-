from app import create_app
from app.models import User, db
from werkzeug.security import generate_password_hash
import json

app = create_app()
app.testing = True

with app.app_context():
    # Ensure user exists
    email = "jury_debug@test.com"
    pwd = "password123"
    user = User.query.filter_by(email=email).first()
    if not user:
        print("Creating debug user...")
        user = User(
            prenom="Debug",
            name="Jury",
            email=email,
            password_hash=generate_password_hash(pwd),
            role="jury"
        )
        db.session.add(user)
        db.session.commit()
    
    print(f"User ID: {user.id}")

    client = app.test_client()

    # Login
    resp = client.post('/api/v1/auth/login', json={
        "email": email,
        "password": pwd
    })
    print("Login Status:", resp.status_code)
    if resp.status_code != 200:
        print("Login Failed:", resp.json)
        exit(1)

    token = resp.json['token']
    print("Token obtained.")

    # Dashboard
    print("Requesting dashboard...")
    resp = client.get('/api/jury/dashboard', headers={
        'Authorization': f'Bearer {token}'
    })
    print("Dashboard Status:", resp.status_code)
    try:
        print("Dashboard Response:", json.dumps(resp.json, indent=2))
    except:
        print("Dashboard Response (Text):", resp.data.decode())
