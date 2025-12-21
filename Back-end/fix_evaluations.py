"""
Script to fix evaluations by linking them to the correct soutenances
"""
from app import create_app
from app.models import Evaluation, Jury, Soutenance, db

def fix_evaluations():
    app = create_app()
    
    with app.app_context():
        print("=" * 60)
        print("Fixing Evaluations")
        print("=" * 60)
        
        # Delete all invalid evaluations (with soutenance_id = NULL)
        invalid_evals = Evaluation.query.filter(Evaluation.soutenance_id.is_(None)).all()
        print(f"\nFound {len(invalid_evals)} invalid evaluations (soutenance_id = NULL)")
        
        for eval in invalid_evals:
            print(f"Deleting Evaluation #{eval.id} (Jury #{eval.jury_id})")
            db.session.delete(eval)
        
        db.session.commit()
        print("✅ Invalid evaluations deleted")
        
        # Create evaluations for all jury assignments
        print("\n" + "=" * 60)
        print("Creating Evaluations for Jury Assignments")
        print("=" * 60)
        
        juries = Jury.query.all()
        created_count = 0
        
        for jury in juries:
            # Check if evaluation already exists
            existing = Evaluation.query.filter_by(
                soutenance_id=jury.soutenance_id,
                jury_id=jury.teacher_id
            ).first()
            
            if not existing:
                print(f"\nCreating Evaluation for Jury #{jury.id}:")
                print(f"  - Soutenance: #{jury.soutenance_id}")
                print(f"  - Teacher/Jury: #{jury.teacher_id}")
                
                evaluation = Evaluation(
                    soutenance_id=jury.soutenance_id,
                    jury_id=jury.teacher_id,
                    statut='pending'
                )
                db.session.add(evaluation)
                created_count += 1
            else:
                print(f"✓ Evaluation already exists for Jury #{jury.id}")
        
        if created_count > 0:
            db.session.commit()
            print(f"\n✅ Created {created_count} new evaluations")
        else:
            print("\n✓ All evaluations already exist")
        
        # Verify
        print("\n" + "=" * 60)
        print("Verification")
        print("=" * 60)
        
        all_evals = Evaluation.query.all()
        print(f"\nTotal evaluations: {len(all_evals)}")
        for e in all_evals:
            soutenance = Soutenance.query.get(e.soutenance_id)
            rapport_id = soutenance.rapport_id if soutenance else None
            print(f"Evaluation #{e.id}: Soutenance #{e.soutenance_id}, Jury #{e.jury_id}, Rapport #{rapport_id}, Status: {e.statut}")

if __name__ == "__main__":
    fix_evaluations()
