from app import create_app
from app.extensions import db
from app.models import User, Soutenance, Jury, Rapport, Student, Salle
from datetime import datetime, time
from werkzeug.security import generate_password_hash

app = create_app()

with app.app_context():
    # 1. Ensure we have a Teacher/Jury user
    teacher = User.query.filter_by(role='jury').first()
    if not teacher:
        teacher = User.query.filter_by(role='teacher').first()
    
    if not teacher:
        print("Creating new Jury user...")
        teacher = User(
            prenom="Jury",
            name="Test",
            email="jury@test.com",
            password_hash=generate_password_hash("password123"),
            role ="jury"
        )
        db.session.add(teacher)
        db.session.commit()
    
    print(f"Using Teacher/Jury User: {teacher.email} (ID: {teacher.id})")

    # 2. Ensure we have a Soutenance
    soutenance = Soutenance.query.first()
    if not soutenance:
        print("Creating Soutenance...")
        # Need a student first
        student_user = User.query.filter_by(role='student').first()
        if not student_user:
             student_user = User(
                prenom="Student",
                name="Test",
                email="student@test.com",
                password_hash=generate_password_hash("password123"),
                role="student"
             )
             db.session.add(student_user)
             db.session.commit()
             
             student_profile = Student(user_id=student_user.id, cin="AB123", cne="123456")
             db.session.add(student_profile)
             db.session.commit()

        # Need a salle
        salle = Salle.query.first()
        if not salle:
            salle = Salle(name="Salle 1")
            db.session.add(salle)
            db.session.commit()
            
        soutenance = Soutenance(
            student_id=student_user.id,
            salle_id=salle.id,
            date_soutenance=datetime.now().date(),
            heure_debut=time(9, 0),
            statut='planned'
        )
        db.session.add(soutenance)
        db.session.commit()

    # 3. Ensure we have a Rapport for the Soutenance
    if not soutenance.rapport:
        print("Creating Rapport for Soutenance...")
        # Determine author
        author = soutenance.etudiant if soutenance.etudiant else teacher # Fallback
        rapport = Rapport(
            auteur_id=author.id,
            titre="Rapport de Stage Test",
            filename="rapport_test.pdf",
            storage_path="uploads/rapport_test.pdf", # Mock path
            status_evaluation="pending"
        )
        db.session.add(rapport)
        db.session.commit()
        soutenance.rapport_id = rapport.id
        db.session.add(soutenance)
        db.session.commit()

    # 4. Assign Teacher to Soutenance as Jury
    existing_jury = Jury.query.filter_by(soutenance_id=soutenance.id, teacher_id=teacher.id).first()
    if not existing_jury:
        print(f"Assigning User {teacher.id} to Soutenance {soutenance.id}...")
        jury = Jury(
            soutenance_id=soutenance.id,
            teacher_id=teacher.id,
            role="member"
        )
        db.session.add(jury)
        db.session.commit()
        print("Assignment created.")
    else:
        print("User is already assigned to this soutenance.")

    print("\nDONE. Ensure you are logged in as:")
    print(f"Email: {teacher.email}")
    print("If you just created the user 'jury@test.com', password is 'password123'.")
