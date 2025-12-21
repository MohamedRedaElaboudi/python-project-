"""
Script to recreate all evaluations based on jury assignments
"""
from app import create_app
from app.models import Evaluation, Jury, Soutenance, db

def recreate_evaluations():
    app = create_app()
    
    with app.app_context():
        print("=" * 60)
        print("Recreating All Evaluations from Jury Assignments")
        print("=" * 60)
        
        # Get all jury assignments
        juries = Jury.query.all()
        print(f"\nFound {len(juries)} jury assignments")
        
        created_count = 0
        
        for jury in juries:
            # Check if evaluation already exists
            existing = Evaluation.query.filter_by(
                soutenance_id=jury.soutenance_id,
                jury_id=jury.teacher_id
            ).first()
            
            if existing:
                print(f"✓ Evaluation already exists for Jury #{jury.id} (Soutenance #{jury.soutenance_id}, Teacher #{jury.teacher_id})")
            else:
                print(f"\n✨ Creating Evaluation for Jury #{jury.id}:")
                print(f"   - Soutenance: #{jury.soutenance_id}")
                print(f"   - Teacher/Jury: #{jury.teacher_id}")
                print(f"   - Role: {jury.role}")
                
                evaluation = Evaluation(
                    soutenance_id=jury.soutenance_id,
                    jury_id=jury.teacher_id,
                    statut='pending'
                )
                db.session.add(evaluation)
                created_count += 1
        
        if created_count > 0:
            db.session.commit()
            print(f"\n✅ Created {created_count} new evaluations")
        else:
            print("\n✓ All evaluations already exist")
        
        # Verification
        print("\n" + "=" * 60)
        print("Final Verification")
        print("=" * 60)
        
        all_evals = Evaluation.query.all()
        print(f"\n📊 Total evaluations: {len(all_evals)}")
        
        for e in all_evals:
            soutenance = Soutenance.query.get(e.soutenance_id)
            rapport_id = soutenance.rapport_id if soutenance else None
            student_id = soutenance.student_id if soutenance else None
            print(f"Evaluation #{e.id}: Soutenance #{e.soutenance_id}, Jury #{e.jury_id}, Rapport #{rapport_id}, Student #{student_id}, Status: {e.statut}")
        
        print("\n" + "=" * 60)
        print("Summary by Jury")
        print("=" * 60)
        
        for jury_id in [1, 5, 6]:
            evals = Evaluation.query.filter_by(jury_id=jury_id).all()
            print(f"\n👤 Jury #{jury_id}: {len(evals)} evaluations")
            for e in evals:
                soutenance = Soutenance.query.get(e.soutenance_id)
                if soutenance:
                    print(f"   - Soutenance #{e.soutenance_id} (Rapport #{soutenance.rapport_id})")

if __name__ == "__main__":
    recreate_evaluations()
