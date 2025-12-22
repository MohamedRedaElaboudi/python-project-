"""
Script de diagnostic pour vérifier les rapports et leurs fichiers PDF
"""
from app import create_app
from app.models import Rapport
from app.extensions import db
import os

app = create_app()

with app.app_context():
    print("=== DIAGNOSTIC DES RAPPORTS ===\n")
    
    rapports = Rapport.query.all()
    
    if not rapports:
        print("❌ Aucun rapport trouvé dans la base de données!")
        print("\nVous devez probablement charger des données de test.")
    else:
        print(f"✅ {len(rapports)} rapport(s) trouvé(s)\n")
        
        for rapport in rapports:
            print(f"\n--- Rapport ID: {rapport.id} ---")
            print(f"   Titre: {rapport.titre or 'N/A'}")
            print(f"   Filename: {rapport.filename}")
            print(f"   Storage Path: {rapport.storage_path}")
            print(f"   Auteur ID: {rapport.auteur_id}")
            
            # Vérifier si le fichier existe
            if rapport.storage_path:
                full_path = os.path.join(os.getcwd(), rapport.storage_path)
                exists = os.path.exists(full_path)
                
                if exists:
                    file_size = os.path.getsize(full_path)
                    print(f"   ✅ Fichier existe: {full_path}")
                    print(f"   📁 Taille: {file_size / 1024:.2f} KB")
                else:
                    print(f"   ❌ Fichier INTROUVABLE: {full_path}")
            else:
                print(f"   ❌ Aucun storage_path défini!")
            
            # Vérifier l'auteur
            if rapport.author:
                print(f"   👤 Auteur: {rapport.author.prenom} {rapport.author.name} ({rapport.author.email})")
            else:
                print(f"   ❌ Aucun auteur lié!")
    
    print("\n\n=== RECOMMANDATIONS ===")
    missing_files = [r for r in rapports if r.storage_path and not os.path.exists(os.path.join(os.getcwd(), r.storage_path))]
    
    if missing_files:
        print(f"\n⚠️  {len(missing_files)} rapport(s) ont des fichiers manquants:")
        for r in missing_files:
            print(f"   - Rapport {r.id}: {r.storage_path}")
        print("\nSolutions possibles:")
        print("   1. Placer les fichiers PDF aux emplacements indiqués")
        print("   2. Mettre à jour les storage_path dans la base de données")
        print("   3. Recharger des données de test avec les bons chemins")
    else:
        print("\n✅ Tous les fichiers PDF sont présents!")
