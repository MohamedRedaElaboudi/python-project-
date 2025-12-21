import os
import sys
from app import create_app, db
from app.models import User, Jury, Soutenance, Rapport, PlagiatAnalysis

app = create_app()

def check_file_exists(path):
    if not path:
        return False, "No path set"
    exists = os.path.exists(path)
    return exists, "Found" if exists else "MISSING"

with app.app_context():
    print("="*50)
    print("SYSTEM DIAGNOSTIC REPORT")
    print("="*50)

    # 1. USER CHECK
    teacher = User.query.get(1)
    if teacher:
        print(f"[OK] User 1 found: {teacher.name} ({teacher.email}) - Role: {teacher.role}")
    else:
        print("[CRITICAL] User 1 (Teacher) NOT FOUND!")

    # 2. JURY ASSIGNMENT
    assignments = Jury.query.filter_by(teacher_id=1).all()
    print(f"\n[INFO] User 1 has {len(assignments)} jury assignments.")
    
    for jury in assignments:
        soutenance = Soutenance.query.get(jury.soutenance_id)
        print(f"  - Jury ID {jury.id} -> Soutenance {jury.soutenance_id}")
        
        if soutenance:
            print(f"    [OK] Soutenance found: Date={soutenance.date_soutenance}, Status={soutenance.statut}")
            
            rapport = Soutenance.query.get(soutenance.id).rapport
            if rapport:
                print(f"    [OK] Rapport linked: ID {rapport.id} - {rapport.title if hasattr(rapport, 'title') else rapport.titre}")
                print(f"    Path in DB: {rapport.storage_path}")
                
                # CRITICAL CHECK
                exists, status = check_file_exists(rapport.storage_path)
                if exists:
                    print(f"    [PASS] File System Check: {status}")
                else:
                    print(f"    [FAIL] File System Check: {status} - This will cause the dashboard to HIDE this record.")
            else:
                print("    [WARNING] No Rapport linked to this Soutenance.")
        else:
            print("    [CRITICAL] Soutenance ID not found in DB!")

    # 3. PLAGIARISM CHECK
    print("\n[INFO] Checking Plagiarism Analysis...")
    analyses = PlagiatAnalysis.query.all()
    for p in analyses:
        print(f"  - Analysis {p.id} for Rapport {p.rapport_id}:")
        print(f"    Stats: Words={p.word_count}, Chars={p.character_count}, Paras={p.paragraph_count}")
        print(f"    Status: {p.status}")

    print("="*50)
