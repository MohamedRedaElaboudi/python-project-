from app import create_app, db
from app.models import Evaluation, EvaluationCriterion, EvaluationGrade, PlagiatAnalysis, PlagiatMatch
from sqlalchemy import text

app = create_app()

with app.app_context():
    print("Fixing database schema...")
    
    # 1. Drop incompatible tables if they exist
    # 'evaluations' is known to be incompatible (SQL dump vs Code)
    try:
        print("Dropping 'evaluations' table...")
        db.session.execute(text("DROP TABLE IF EXISTS evaluations"))
        db.session.commit()
    except Exception as e:
        print(f"Error dropping evaluations: {e}")
        db.session.rollback()

    # 2. Create tables
    # db.create_all() will create any table that doesn't exist.
    # checking for existing tables is handled by sqlalchemy.
    print("Creating missing tables...")
    db.create_all()
    
    # 3. Seed Criteria
    if EvaluationCriterion.query.count() == 0:
        print("Seeding Evaluation Criteria...")
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
        print("Criteria already exist.")
        
    print("Database schema fixed.")
