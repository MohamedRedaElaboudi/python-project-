from app import create_app, db
from app.models import User, Jury, Soutenance, Rapport

app = create_app()

with app.app_context():
    print("--- USERS ---")
    users = User.query.all()
    for u in users:
        print(f"ID: {u.id}, Name: {u.name}, Role: {u.role}, Email: {u.email}")

    print("\n--- JURY ASSIGNMENTS ---")
    juries = Jury.query.all()
    for j in juries:
        print(f"Jury ID: {j.id}, Teacher ID: {j.teacher_id}, Soutenance ID: {j.soutenance_id}, Role: {j.role}")

    print("\n--- SOUTENANCES ---")
    souts = Soutenance.query.all()
    for s in souts:
        print(f"ID: {s.id}, Date: {s.date_soutenance}, Rapport ID: {s.rapport_id}")

    print("\n--- RAPPORTS ---")
    rapports = Rapport.query.all()
    for r in rapports:
        print(f"ID: {r.id}, Title: {r.titre}, Storage Path: {r.storage_path}")

    print("\n--- TEST QUERY (for User ID 1) ---")
    user_id = 1
    assigned_query = db.session.query(Rapport).join(
        Soutenance, Soutenance.rapport_id == Rapport.id
    ).join(
        Jury, Jury.soutenance_id == Soutenance.id
    ).filter(
        Jury.teacher_id == user_id
    )
    count = assigned_query.count()
    print(f"Assigned Reports for User 1: {count}")
