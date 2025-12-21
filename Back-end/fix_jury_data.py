"""
Script pour corriger les données du jury
"""

import pymysql

DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': '',
    'database': 'projet_soutenances_simplifie',
    'charset': 'utf8mb4'
}

def fix_jury_data():
    connection = pymysql.connect(**DB_CONFIG)
    cursor = connection.cursor()
    
    print("=" * 60)
    print("CORRECTION DES DONNÉES JURY")
    print("=" * 60)
    print()
    
    # 1. Supprimer les grades des évaluations invalides
    print("🗑️  Suppression des grades d'évaluations invalides...")
    cursor.execute("""
        DELETE FROM evaluation_grades 
        WHERE evaluation_id IN (
            SELECT id FROM evaluations WHERE soutenance_id IS NULL
        )
    """)
    deleted_grades = cursor.rowcount
    print(f"   ✅ {deleted_grades} grades supprimés")
    connection.commit()
    
    # 2. Supprimer les évaluations invalides (avec soutenance_id NULL)
    print("\n🗑️  Suppression des évaluations invalides...")
    cursor.execute("""
        DELETE FROM evaluations 
        WHERE soutenance_id IS NULL
    """)
    deleted = cursor.rowcount
    print(f"   ✅ {deleted} évaluations invalides supprimées")
    connection.commit()
    
    # 2. Mettre à jour le rôle des utilisateurs jurys
    print("\n👥 Mise à jour des rôles des enseignants...")
    cursor.execute("""
        UPDATE users 
        SET role = 'teacher' 
        WHERE id IN (SELECT DISTINCT teacher_id FROM juries)
        AND role != 'teacher'
    """)
    updated = cursor.rowcount
    print(f"   ✅ {updated} utilisateurs mis à jour comme enseignants")
    connection.commit()
    
    # 3. Assigner un rapport à la soutenance si possible
    print("\n📄 Vérification des rapports pour soutenances...")
    cursor.execute("""
        SELECT s.id, s.student_id, s.rapport_id
        FROM soutenances s
        WHERE s.rapport_id IS NULL
    """)
    soutenances_no_rapport = cursor.fetchall()
    
    for sout in soutenances_no_rapport:
        sout_id, student_id, _ = sout
        # Chercher un rapport pour cet étudiant
        cursor.execute("""
            SELECT id FROM rapports 
            WHERE auteur_id = %s 
            LIMIT 1
        """, (student_id,))
        rapport = cursor.fetchone()
        
        if rapport:
            cursor.execute("""
                UPDATE soutenances 
                SET rapport_id = %s 
                WHERE id = %s
            """, (rapport[0], sout_id))
            print(f"   ✅ Soutenance #{sout_id} liée au rapport #{rapport[0]}")
            connection.commit()
        else:
            print(f"   ⚠️  Soutenance #{sout_id}: Aucun rapport trouvé pour l'étudiant #{student_id}")
    
    # 4. Créer des évaluations pour les jurys assignés
    print("\n📝 Création des évaluations manquantes...")
    cursor.execute("""
        SELECT j.id, j.soutenance_id, j.teacher_id
        FROM juries j
        WHERE NOT EXISTS (
            SELECT 1 FROM evaluations e 
            WHERE e.soutenance_id = j.soutenance_id 
            AND e.jury_id = j.teacher_id
        )
    """)
    missing_evals = cursor.fetchall()
    
    for jury in missing_evals:
        jury_id, soutenance_id, teacher_id = jury
        cursor.execute("""
            INSERT INTO evaluations (soutenance_id, jury_id, statut)
            VALUES (%s, %s, 'pending')
        """, (soutenance_id, teacher_id))
        print(f"   ✅ Évaluation créée: Soutenance #{soutenance_id}, Jury #{teacher_id}")
    connection.commit()
    
    # 5. Vérification finale
    print("\n📊 VÉRIFICATION FINALE:")
    
    cursor.execute("SELECT COUNT(*) FROM soutenances")
    print(f"   - Soutenances: {cursor.fetchone()[0]}")
    
    cursor.execute("SELECT COUNT(*) FROM juries")
    print(f"   - Jurys assignés: {cursor.fetchone()[0]}")
    
    cursor.execute("SELECT COUNT(*) FROM evaluations WHERE soutenance_id IS NOT NULL")
    print(f"   - Évaluations valides: {cursor.fetchone()[0]}")
    
    cursor.execute("SELECT COUNT(*) FROM users WHERE role = 'teacher'")
    print(f"   - Enseignants: {cursor.fetchone()[0]}")
    
    print("\n✅ Correction terminée!")
    print("=" * 60)
    
    cursor.close()
    connection.close()

if __name__ == '__main__':
    fix_jury_data()
