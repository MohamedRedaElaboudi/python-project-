import sys
import os
from datetime import date, time, datetime
from app import create_app, db
from app.models import Soutenance, Jury, User, Student, Rapport

app = create_app()

with app.app_context():
    print("Checking existing data...")
    
    # 1. Get Teacher (Jury)
    teacher = User.query.get(1)
    if not teacher:
        print("Error: Teacher (ID 1) not found.")
        sys.exit(1)
    print(f"Found Teacher: {teacher.name} (ID: {teacher.id})")

    # 2. Get Student
    student_user = User.query.get(2)
    student_profile = Student.query.get(2)
    if not student_user or not student_profile:
        print("Error: Student (ID 2) not found.")
        sys.exit(1)
    print(f"Found Student: {student_user.name} (ID: {student_user.id})")

    # 3. Get Rapport
    rapport = Rapport.query.filter_by(auteur_id=2).first()
    if not rapport:
        print("Warning: Rapport for student 2 not found. Creating a dummy rapport entry if needed, but assuming dump had it.")
        # Try to find any rapport or create one? 
        # The dump said rapport ID 1 exists.
        rapport = Rapport.query.get(1)
        if not rapport:
             print("Error: Rapport (ID 1) not found.")
             sys.exit(1)
    print(f"Found Rapport: {rapport.filename} (ID: {rapport.id})")

    # 4. Create Soutenance if not exists
    soutenance = Soutenance.query.filter_by(student_id=2).first()
    if not soutenance:
        print("Creating Soutenance...")
        soutenance = Soutenance(
            student_id=2,
            rapport_id=rapport.id,
            date_soutenance=date.today(),
            heure_debut=time(14, 0), # 14:00
            statut='planned'
        )
        db.session.add(soutenance)
        db.session.commit()
        print(f"Soutenance created (ID: {soutenance.id})")
    else:
        print(f"Soutenance already exists (ID: {soutenance.id})")
        # Ensure rapport is linked
        if soutenance.rapport_id != rapport.id:
            soutenance.rapport_id = rapport.id
            db.session.commit()
            print("Updated soutenance rapport link.")

    # 5. Assign Jury
    jury_assignment = Jury.query.filter_by(soutenance_id=soutenance.id, teacher_id=teacher.id).first()
    if not jury_assignment:
        print("Assigning Teacher as Jury President...")
        jury_assignment = Jury(
            soutenance_id=soutenance.id,
            teacher_id=teacher.id,
            role='president'
        )
        db.session.add(jury_assignment)
        db.session.commit()
        print("Teacher assigned to Soutenance.")
    else:
        print("Teacher is already assigned to this soutenance.")

    # 6. Seed Evaluation Criteria
    from app.models import EvaluationCriterion
    if EvaluationCriterion.query.count() == 0:
        print("Seeding Evaluation Items...")
        criteria = [
            {"name": "Qualité du rapport", "description": "Structure, orthographe, clarté", "max_score": 5},
            {"name": "Présentation orale", "description": "Aisance, clarté, temps", "max_score": 5},
            {"name": "Maîtrise du sujet", "description": "Réponses aux questions, profondeur", "max_score": 5},
            {"name": "Travail réalisé", "description": "Pertinence, complexité, résultats", "max_score": 5},
        ]
        for c in criteria:
            db.session.add(EvaluationCriterion(**c))
        db.session.commit()
        print("Criteria seeded.")
    else:
        print("Evaluation Criteria already exist.")

    # 7. Seed Plagiarism Analysis
    from app.models import PlagiatAnalysis
    plagiat = PlagiatAnalysis.query.filter_by(rapport_id=rapport.id).first()
    if not plagiat:
        print("Seeding Plagiarism Analysis...")
        analysis = PlagiatAnalysis(
            rapport_id=rapport.id,
            similarity_score=25.5,
            originality_score=74.5,
            risk_level='medium',
            total_matches=5,
            sources_count=3,
            status='completed',
            analyzed_at=datetime.utcnow(),
            word_count=1500,
            unique_words=1200,
            readability_score=65.0,
            detection_time=2.5,
            ai_score=15.0,
            chunks_analyzed=50,
            chunks_with_matches=5,
            character_count=8500,
            paragraph_count=120
        )
        db.session.add(analysis)
        db.session.commit()
        print(f"Plagiarism Analysis created (ID: {analysis.id})")
    else:
        print("Plagiarism Analysis already exists. Updating stats...")
        plagiat.word_count = 1500
        plagiat.unique_words = 1200
        plagiat.readability_score = 65.0
        plagiat.ai_score = 15.0
        plagiat.chunks_analyzed = 50
        plagiat.chunks_with_matches = 5
        plagiat.character_count = 8500
        plagiat.paragraph_count = 120
        db.session.commit()
        print("Plagiarism Analysis stats updated.")

    print("Seeding successful! Refresh the Jury Dashboard.")
