from app import create_app, db
from app.models import Evaluation, EvaluationCriterion, EvaluationGrade
from sqlalchemy import text

app = create_app()

with app.app_context():
    print("Starting Database Schema Fix...")
    
    # 1. Inspect 'rapports' columns
    print("Inspecting 'rapports' table...")
    try:
        result = db.session.execute(text("DESCRIBE rapports"))
        columns = [row[0] for row in result.fetchall()]
        print(f"Current columns in 'rapports': {columns}")
        
        if 'status' not in columns:
            print("Column 'status' is MISSING in 'rapports'. Checking for alternatives...")
            if 'status_evaluation' in columns:
                print("Found 'status_evaluation'. Renaming to 'status'...")
                db.session.execute(text("ALTER TABLE rapports CHANGE status_evaluation status VARCHAR(20) DEFAULT 'pending'"))
            else:
                print("Adding missing column 'status'...")
                db.session.execute(text("ALTER TABLE rapports ADD COLUMN status VARCHAR(20) DEFAULT 'pending'"))
            db.session.commit()
            print("'rapports' table patched.")
        else:
            print("Column 'status' already exists.")
            
    except Exception as e:
        print(f"Error checking/patching rapports: {e}")
        db.session.rollback()

    # 2. Re-attempt to fix 'evaluations' table
    # Must drop children first: 'evaluation_grades'
    print("\nFixing 'evaluations' table...")
    try:
        # Disable FK checks temporarily to force cleans if needed, or just drop child first
        db.session.execute(text("SET FOREIGN_KEY_CHECKS = 0"))
        
        print("Dropping 'evaluation_grades'...")
        db.session.execute(text("DROP TABLE IF EXISTS evaluation_grades"))
        
        print("Dropping 'evaluations'...")
        db.session.execute(text("DROP TABLE IF EXISTS evaluations"))

        # Also drop criteria if we want to re-seed cleanly
        # print("Dropping 'evaluation_criteria'...")
        # db.session.execute(text("DROP TABLE IF EXISTS evaluation_criteria"))
        
        db.session.execute(text("SET FOREIGN_KEY_CHECKS = 1"))
        db.session.commit()
        print("Dropped incompatible tables.")
        
    except Exception as e:
        print(f"Error dropping tables: {e}")
        db.session.rollback()

    # 3. Create missing tables
    print("\nCreating tables (db.create_all)...")
    db.create_all()
    
    # 4. Seed Criteria
    print("\nSeeding Criteria...")
    if EvaluationCriterion.query.count() == 0:
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

    print("\nDatabase Schema verification/fix complete.")
