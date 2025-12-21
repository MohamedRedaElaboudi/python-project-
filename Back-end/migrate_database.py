"""
Script de migration pour corriger la structure de la base de données
Convertit les évaluations de rapport_id vers soutenance_id
"""

from app import create_app, db
from app.models import Evaluation, Soutenance, Rapport
from sqlalchemy import text

def migrate_evaluations():
    """
    Migre les évaluations existantes pour utiliser soutenance_id au lieu de rapport_id
    """
    app = create_app()
    
    with app.app_context():
        print("🔄 Début de la migration des évaluations...")
        
        # 1. Créer une table temporaire pour sauvegarder les données
        print("📦 Sauvegarde des données existantes...")
        db.session.execute(text("""
            CREATE TABLE IF NOT EXISTS evaluations_backup AS 
            SELECT * FROM evaluations
        """))
        db.session.commit()
        
        # 2. Supprimer les contraintes de clé étrangère
        print("🔓 Suppression des contraintes...")
        try:
            db.session.execute(text("""
                ALTER TABLE evaluations 
                DROP FOREIGN KEY evaluations_ibfk_1
            """))
            db.session.commit()
        except Exception as e:
            print(f"⚠️  Contrainte déjà supprimée ou inexistante: {e}")
            db.session.rollback()
        
        # 3. Ajouter la nouvelle colonne soutenance_id
        print("➕ Ajout de la colonne soutenance_id...")
        try:
            db.session.execute(text("""
                ALTER TABLE evaluations 
                ADD COLUMN soutenance_id BIGINT AFTER id
            """))
            db.session.commit()
        except Exception as e:
            print(f"⚠️  Colonne déjà existante: {e}")
            db.session.rollback()
        
        # 4. Remplir soutenance_id en se basant sur rapport_id
        print("🔄 Migration des données rapport_id -> soutenance_id...")
        db.session.execute(text("""
            UPDATE evaluations e
            INNER JOIN soutenances s ON e.rapport_id = s.rapport_id
            SET e.soutenance_id = s.id
            WHERE e.soutenance_id IS NULL
        """))
        db.session.commit()
        
        # 5. Vérifier que toutes les évaluations ont une soutenance_id
        orphaned = db.session.execute(text("""
            SELECT COUNT(*) as count FROM evaluations 
            WHERE soutenance_id IS NULL
        """)).fetchone()
        
        if orphaned[0] > 0:
            print(f"⚠️  ATTENTION: {orphaned[0]} évaluations n'ont pas de soutenance associée!")
            print("   Ces évaluations seront supprimées.")
            db.session.execute(text("""
                DELETE FROM evaluations WHERE soutenance_id IS NULL
            """))
            db.session.commit()
        
        # 6. Rendre soutenance_id NOT NULL
        print("🔒 Configuration de soutenance_id comme NOT NULL...")
        db.session.execute(text("""
            ALTER TABLE evaluations 
            MODIFY COLUMN soutenance_id BIGINT NOT NULL
        """))
        db.session.commit()
        
        # 7. Supprimer l'ancienne colonne rapport_id
        print("🗑️  Suppression de l'ancienne colonne rapport_id...")
        db.session.execute(text("""
            ALTER TABLE evaluations 
            DROP COLUMN rapport_id
        """))
        db.session.commit()
        
        # 8. Ajouter les nouvelles contraintes
        print("🔐 Ajout des contraintes de clé étrangère...")
        db.session.execute(text("""
            ALTER TABLE evaluations
            ADD CONSTRAINT evaluations_ibfk_1 
            FOREIGN KEY (soutenance_id) REFERENCES soutenances(id) ON DELETE CASCADE
        """))
        db.session.commit()
        
        # 9. Ajouter une contrainte unique pour éviter les doublons
        print("🔑 Ajout de la contrainte unique...")
        try:
            db.session.execute(text("""
                ALTER TABLE evaluations
                ADD CONSTRAINT unique_evaluation_per_jury_soutenance 
                UNIQUE (soutenance_id, jury_id)
            """))
            db.session.commit()
        except Exception as e:
            print(f"⚠️  Contrainte unique déjà existante: {e}")
            db.session.rollback()
        
        # 10. Supprimer les doublons si nécessaire
        print("🧹 Nettoyage des doublons...")
        db.session.execute(text("""
            DELETE e1 FROM evaluations e1
            INNER JOIN evaluations e2 
            WHERE e1.id > e2.id 
            AND e1.soutenance_id = e2.soutenance_id 
            AND e1.jury_id = e2.jury_id
        """))
        db.session.commit()
        
        # 11. Vérifier les résultats
        print("\n📊 Vérification des résultats...")
        stats = db.session.execute(text("""
            SELECT 
                COUNT(*) as total_evaluations,
                COUNT(DISTINCT soutenance_id) as soutenances_evaluees,
                COUNT(DISTINCT jury_id) as jurys_actifs
            FROM evaluations
        """)).fetchone()
        
        print(f"✅ Migration terminée avec succès!")
        print(f"   - Total évaluations: {stats[0]}")
        print(f"   - Soutenances évaluées: {stats[1]}")
        print(f"   - Jurys actifs: {stats[2]}")
        
        print("\n💾 Sauvegarde conservée dans la table 'evaluations_backup'")
        print("   Pour supprimer la sauvegarde: DROP TABLE evaluations_backup;")

if __name__ == '__main__':
    try:
        migrate_evaluations()
    except Exception as e:
        print(f"\n❌ Erreur lors de la migration: {e}")
        print("   Les données de sauvegarde sont dans 'evaluations_backup'")
        raise
