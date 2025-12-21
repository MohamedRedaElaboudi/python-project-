"""
Script to link soutenances to their corresponding rapports based on student_id
"""
from app import create_app
from app.models import Soutenance, Rapport, db

def link_soutenances_to_rapports():
    app = create_app()
    
    with app.app_context():
        print("=" * 60)
        print("Linking Soutenances to Rapports")
        print("=" * 60)
        
        # Get all soutenances without rapport_id
        soutenances = Soutenance.query.filter(Soutenance.rapport_id.is_(None)).all()
        print(f"\nFound {len(soutenances)} soutenances without rapport_id")
        
        linked_count = 0
        for soutenance in soutenances:
            # Find rapport for this student
            rapport = Rapport.query.filter_by(auteur_id=soutenance.student_id).first()
            
            if rapport:
                print(f"\nLinking Soutenance #{soutenance.id} (Student #{soutenance.student_id}) to Rapport #{rapport.id} ('{rapport.titre}')")
                soutenance.rapport_id = rapport.id
                linked_count += 1
            else:
                print(f"\nWARNING: No rapport found for Soutenance #{soutenance.id} (Student #{soutenance.student_id})")
        
        if linked_count > 0:
            db.session.commit()
            print(f"\n✅ Successfully linked {linked_count} soutenances to their rapports")
        else:
            print("\n⚠️  No soutenances were linked")
        
        # Verify the links
        print("\n" + "=" * 60)
        print("Verification")
        print("=" * 60)
        all_soutenances = Soutenance.query.all()
        for s in all_soutenances:
            status = "✅" if s.rapport_id else "❌"
            print(f"{status} Soutenance #{s.id}: Student #{s.student_id}, Rapport #{s.rapport_id}")

if __name__ == "__main__":
    link_soutenances_to_rapports()
