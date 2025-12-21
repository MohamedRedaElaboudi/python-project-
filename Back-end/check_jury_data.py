"""
Script pour vérifier et corriger les données du jury après migration
"""

import pymysql

DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': '',
    'database': 'projet_soutenances_simplifie',
    'charset': 'utf8mb4'
}

def check_jury_data():
    connection = pymysql.connect(**DB_CONFIG)
    cursor = connection.cursor()
    
    print("=" * 60)
    print("VÉRIFICATION DES DONNÉES JURY")
    print("=" * 60)
    print()
    
    # 1. Vérifier les soutenances
    print("📋 SOUTENANCES:")
    cursor.execute("""
        SELECT id, rapport_id, date_soutenance, statut 
        FROM soutenances 
        ORDER BY id
    """)
    soutenances = cursor.fetchall()
    print(f"   Total: {len(soutenances)}")
    for s in soutenances:
        print(f"   - Soutenance #{s[0]}: Rapport #{s[1]}, Date: {s[2]}, Statut: {s[3]}")
    print()
    
    # 2. Vérifier les jurys
    print("👥 JURYS (Assignments):")
    cursor.execute("""
        SELECT j.id, j.soutenance_id, j.teacher_id, j.role, u.name
        FROM juries j
        LEFT JOIN users u ON u.id = j.teacher_id
        ORDER BY j.id
    """)
    juries = cursor.fetchall()
    print(f"   Total: {len(juries)}")
    for j in juries:
        print(f"   - Jury #{j[0]}: Soutenance #{j[1]}, Enseignant: {j[4]} (ID {j[2]}), Rôle: {j[3]}")
    print()
    
    # 3. Vérifier les évaluations
    print("📝 ÉVALUATIONS:")
    cursor.execute("""
        SELECT id, soutenance_id, jury_id, statut 
        FROM evaluations 
        ORDER BY id
    """)
    evaluations = cursor.fetchall()
    print(f"   Total: {len(evaluations)}")
    for e in evaluations:
        print(f"   - Évaluation #{e[0]}: Soutenance #{e[1]}, Jury #{e[2]}, Statut: {e[3]}")
    print()
    
    # 4. Vérifier les rapports
    print("📄 RAPPORTS:")
    cursor.execute("""
        SELECT r.id, r.auteur_id, r.filename, u.name
        FROM rapports r
        LEFT JOIN users u ON u.id = r.auteur_id
        ORDER BY r.id
    """)
    rapports = cursor.fetchall()
    print(f"   Total: {len(rapports)}")
    for r in rapports:
        print(f"   - Rapport #{r[0]}: {r[2]}, Auteur: {r[3]} (ID {r[1]})")
    print()
    
    # 5. Vérifier les utilisateurs enseignants
    print("👨‍🏫 ENSEIGNANTS:")
    cursor.execute("""
        SELECT id, name, email, role
        FROM users
        WHERE role = 'teacher'
        ORDER BY id
    """)
    teachers = cursor.fetchall()
    print(f"   Total: {len(teachers)}")
    for t in teachers:
        print(f"   - {t[1]} (ID {t[0]}): {t[2]}")
    print()
    
    # 6. Problèmes détectés
    print("⚠️  PROBLÈMES DÉTECTÉS:")
    
    # Évaluations avec soutenance_id NULL ou invalide
    cursor.execute("""
        SELECT COUNT(*) FROM evaluations 
        WHERE soutenance_id IS NULL OR soutenance_id NOT IN (SELECT id FROM soutenances)
    """)
    invalid_evals = cursor.fetchone()[0]
    if invalid_evals > 0:
        print(f"   - {invalid_evals} évaluations avec soutenance_id invalide")
    
    # Jurys sans soutenance
    cursor.execute("""
        SELECT COUNT(*) FROM juries 
        WHERE soutenance_id NOT IN (SELECT id FROM soutenances)
    """)
    invalid_juries = cursor.fetchone()[0]
    if invalid_juries > 0:
        print(f"   - {invalid_juries} jurys avec soutenance_id invalide")
    
    # Soutenances sans jury
    cursor.execute("""
        SELECT COUNT(*) FROM soutenances s
        WHERE NOT EXISTS (SELECT 1 FROM juries j WHERE j.soutenance_id = s.id)
    """)
    soutenances_no_jury = cursor.fetchone()[0]
    if soutenances_no_jury > 0:
        print(f"   - {soutenances_no_jury} soutenances sans jury assigné")
    
    if invalid_evals == 0 and invalid_juries == 0 and soutenances_no_jury == 0:
        print("   ✅ Aucun problème détecté!")
    
    print()
    print("=" * 60)
    
    cursor.close()
    connection.close()

if __name__ == '__main__':
    check_jury_data()
