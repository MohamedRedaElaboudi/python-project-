"""
Script de migration simple pour corriger la structure de la base de données
Convertit les évaluations de rapport_id vers soutenance_id
"""

import pymysql
import sys

# Configuration de la base de données
DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': '',  # Mettez votre mot de passe MySQL ici si nécessaire
    'database': 'projet_soutenances_simplifie',
    'charset': 'utf8mb4'
}

def execute_sql(cursor, sql, description):
    """Exécute une requête SQL avec gestion d'erreur"""
    try:
        print(f"🔄 {description}...")
        cursor.execute(sql)
        print(f"✅ {description} - OK")
        return True
    except Exception as e:
        print(f"⚠️  {description} - {str(e)}")
        return False

def migrate_database():
    """Migre la base de données"""
    try:
        # Connexion à la base de données
        print("🔌 Connexion à la base de données...")
        connection = pymysql.connect(**DB_CONFIG)
        cursor = connection.cursor()
        print("✅ Connecté!\n")
        
        # 1. Créer une sauvegarde
        execute_sql(cursor, """
            CREATE TABLE IF NOT EXISTS evaluations_backup AS 
            SELECT * FROM evaluations
        """, "Sauvegarde des données existantes")
        connection.commit()
        
        # 2. Vérifier si la colonne soutenance_id existe déjà
        cursor.execute("""
            SELECT COUNT(*) 
            FROM information_schema.COLUMNS 
            WHERE TABLE_SCHEMA = 'projet_soutenances_simplifie' 
            AND TABLE_NAME = 'evaluations' 
            AND COLUMN_NAME = 'soutenance_id'
        """)
        soutenance_id_exists = cursor.fetchone()[0] > 0
        
        if not soutenance_id_exists:
            # 3. Ajouter la nouvelle colonne
            execute_sql(cursor, """
                ALTER TABLE evaluations 
                ADD COLUMN soutenance_id BIGINT AFTER id
            """, "Ajout de la colonne soutenance_id")
            connection.commit()
            
            # 4. Migrer les données
            execute_sql(cursor, """
                UPDATE evaluations e
                INNER JOIN soutenances s ON e.rapport_id = s.rapport_id
                SET e.soutenance_id = s.id
                WHERE e.soutenance_id IS NULL
            """, "Migration des données rapport_id -> soutenance_id")
            connection.commit()
            
            # 5. Vérifier les orphelins
            cursor.execute("""
                SELECT COUNT(*) as count FROM evaluations 
                WHERE soutenance_id IS NULL
            """)
            orphaned = cursor.fetchone()[0]
            
            if orphaned > 0:
                print(f"⚠️  ATTENTION: {orphaned} évaluations n'ont pas de soutenance associée!")
                print("   Ces évaluations seront supprimées.")
                execute_sql(cursor, """
                    DELETE FROM evaluations WHERE soutenance_id IS NULL
                """, "Suppression des évaluations orphelines")
                connection.commit()
            
            # 6. Rendre soutenance_id NOT NULL
            execute_sql(cursor, """
                ALTER TABLE evaluations 
                MODIFY COLUMN soutenance_id BIGINT NOT NULL
            """, "Configuration de soutenance_id comme NOT NULL")
            connection.commit()
            
            # 7. Supprimer l'ancienne colonne rapport_id
            execute_sql(cursor, """
                ALTER TABLE evaluations 
                DROP COLUMN rapport_id
            """, "Suppression de l'ancienne colonne rapport_id")
            connection.commit()
        else:
            print("ℹ️  La colonne soutenance_id existe déjà, vérification de la structure...")
        
        # 8. Supprimer les anciennes contraintes si elles existent
        cursor.execute("""
            SELECT CONSTRAINT_NAME 
            FROM information_schema.TABLE_CONSTRAINTS 
            WHERE TABLE_SCHEMA = 'projet_soutenances_simplifie' 
            AND TABLE_NAME = 'evaluations' 
            AND CONSTRAINT_TYPE = 'FOREIGN KEY'
        """)
        constraints = cursor.fetchall()
        
        for constraint in constraints:
            constraint_name = constraint[0]
            if constraint_name != 'evaluations_ibfk_1':
                try:
                    cursor.execute(f"ALTER TABLE evaluations DROP FOREIGN KEY {constraint_name}")
                    connection.commit()
                    print(f"✅ Contrainte {constraint_name} supprimée")
                except:
                    pass
        
        # 9. Ajouter la contrainte de clé étrangère
        execute_sql(cursor, """
            ALTER TABLE evaluations
            ADD CONSTRAINT evaluations_ibfk_1 
            FOREIGN KEY (soutenance_id) REFERENCES soutenances(id) ON DELETE CASCADE
        """, "Ajout de la contrainte de clé étrangère")
        connection.commit()
        
        # 10. Supprimer les doublons
        execute_sql(cursor, """
            DELETE e1 FROM evaluations e1
            INNER JOIN evaluations e2 
            WHERE e1.id > e2.id 
            AND e1.soutenance_id = e2.soutenance_id 
            AND e1.jury_id = e2.jury_id
        """, "Nettoyage des doublons")
        connection.commit()
        
        # 11. Ajouter la contrainte unique
        execute_sql(cursor, """
            ALTER TABLE evaluations
            ADD CONSTRAINT unique_evaluation_per_jury_soutenance 
            UNIQUE (soutenance_id, jury_id)
        """, "Ajout de la contrainte unique")
        connection.commit()
        
        # 12. Vérifier les résultats
        print("\n📊 Vérification des résultats...")
        cursor.execute("""
            SELECT 
                COUNT(*) as total_evaluations,
                COUNT(DISTINCT soutenance_id) as soutenances_evaluees,
                COUNT(DISTINCT jury_id) as jurys_actifs
            FROM evaluations
        """)
        stats = cursor.fetchone()
        
        print(f"\n✅ Migration terminée avec succès!")
        print(f"   - Total évaluations: {stats[0]}")
        print(f"   - Soutenances évaluées: {stats[1]}")
        print(f"   - Jurys actifs: {stats[2]}")
        
        print("\n💾 Sauvegarde conservée dans la table 'evaluations_backup'")
        print("   Pour supprimer la sauvegarde: DROP TABLE evaluations_backup;")
        
        cursor.close()
        connection.close()
        
    except pymysql.Error as e:
        print(f"\n❌ Erreur de base de données: {e}")
        print("   Les données de sauvegarde sont dans 'evaluations_backup'")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Erreur lors de la migration: {e}")
        print("   Les données de sauvegarde sont dans 'evaluations_backup'")
        sys.exit(1)

if __name__ == '__main__':
    print("=" * 60)
    print("  MIGRATION DE LA BASE DE DONNÉES")
    print("  Conversion: rapport_id -> soutenance_id")
    print("=" * 60)
    print()
    
    migrate_database()
    
    print("\n" + "=" * 60)
    print("  MIGRATION TERMINÉE")
    print("=" * 60)
