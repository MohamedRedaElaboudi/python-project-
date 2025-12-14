import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
    UPLOAD_FOLDER = os.path.join(os.getcwd(), 'temp_uploads')
    
    if not GEMINI_API_KEY:
        print("❌ ERREUR : Pas de clé API dans .env")

    # Création automatique du dossier upload
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)