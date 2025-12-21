import os
import sys
from app import create_app, db
from app.models import PlagiatAnalysis, Rapport
from app.api.plagiat.plagiat_analysis import extract_text_from_file, calculate_text_stats

app = create_app()

with app.app_context():
    # 1. Look for the seeded rapport or any rapport
    rapport = Rapport.query.get(1)
    if not rapport:
        print("Rapport ID 1 not found.")
        sys.exit(1)
        
    print(f"Target Rapport: {rapport.filename}")
    print(f"Stored Path: {rapport.storage_path}")
    
    # Force use of local demo file if the stored path is invalid/missing
    real_file_path = os.path.join(os.getcwd(), 'app', 'uploads', 'rapport_demo.txt')
    
    if os.path.exists(real_file_path):
        print(f"Found real file at: {real_file_path}")
        # Update rapport to point to this file for the test
        rapport.storage_path = real_file_path
    else:
        print("Real demo file not found in uploads/. Cannot verify dynamic stats.")
        sys.exit(1)

    # 2. Extract Text
    print("Extracting text...")
    text = extract_text_from_file(rapport.storage_path)
    if not text:
        print("No text extracted (empty file?).")
    else:
        print(f"Extracted {len(text)} characters.")

    # 3. Calculate Stats
    print("Calculating stats...")
    stats = calculate_text_stats(text)
    print("Calculated Stats:", stats)

    # 4. Update Database
    analysis = PlagiatAnalysis.query.filter_by(rapport_id=rapport.id).first()
    if analysis:
        print("Updating Analysis record with REAL stats...")
        analysis.word_count = stats.get('total_words', 0)
        analysis.character_count = stats.get('total_characters', 0)
        analysis.paragraph_count = stats.get('total_paragraphs', 0)
        analysis.unique_words = stats.get('unique_words', 0)
        analysis.readability_score = stats.get('readability_score', 0)
        db.session.commit()
        print("Database updated.")
    else:
        print("Analysis record not found.")

    print("Verification complete.")
