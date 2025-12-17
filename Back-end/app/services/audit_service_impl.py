
import os
import time
import json
import google.generativeai as genai
from dotenv import load_dotenv
from app.utils.guide_config import ENSIASD_RULES, PROMPT_AUDIT

load_dotenv()

# Configure API
API_KEY = os.getenv("GEMINI_API_KEY")
if not API_KEY:
    print("❌ ERREUR : Pas de clé API dans .env")
else:
    genai.configure(api_key=API_KEY)

# Model Configuration
GENERATION_CONFIG = {
    "temperature": 0.2,
    "top_p": 0.95,
    "top_k": 64,
    "max_output_tokens": 8192,
    "response_mime_type": "application/json",
}

def clean_json_text(text):
    text = text.replace("```json", "").replace("```", "").strip()
    start = text.find('{')
    end = text.rfind('}') + 1
    if start != -1 and end != -1:
        return text[start:end]
    return text

def upload_to_gemini(path, mime_type="application/pdf"):
    print(f"📤 Upload de {path} vers Google...")
    file = genai.upload_file(path, mime_type=mime_type)
    
    timeout = 60
    start = time.time()
    while file.state.name == "PROCESSING":
        if time.time() - start > timeout:
            raise TimeoutError("Traitement Google trop long")
        time.sleep(2)
        file = genai.get_file(file.name)
        
    if file.state.name == "FAILED":
        raise ValueError("Google a échoué à lire le fichier.")
    
    print("✅ Fichier traité par Google.")
    return file

def analyze_pdf(pdf_path):
    """
    Uploads PDF to Gemini and requests analysis based on ENSIASD rules.
    Returns a dictionary (parsed JSON).
    """
    if not os.path.exists(pdf_path):
        raise FileNotFoundError(f"PDF not found at {pdf_path}")

    try:
        gemini_file = upload_to_gemini(pdf_path)
        
        # Configure safety settings to avoid blocking
        safety_settings = [
            {
                "category": "HARM_CATEGORY_HARASSMENT",
                "threshold": "BLOCK_NONE"
            },
            {
                "category": "HARM_CATEGORY_HATE_SPEECH",
                "threshold": "BLOCK_NONE"
            },
            {
                "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                "threshold": "BLOCK_NONE"
            },
            {
                "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
                "threshold": "BLOCK_NONE"
            },
        ]

        model = genai.GenerativeModel(
            model_name="models/gemini-flash-latest",
            generation_config=GENERATION_CONFIG,
            safety_settings=safety_settings
        )

        formatted_prompt = PROMPT_AUDIT.format(rules=ENSIASD_RULES)
        
        print("🤖 Audit complet (Forme + Fond) en cours...")
        response = model.generate_content([gemini_file, formatted_prompt])
        
        cleaned_text = clean_json_text(response.text)
        
        try:
            analysis_json = json.loads(cleaned_text)
            return analysis_json
        except json.JSONDecodeError as e:
            print(f"JSON Decode Error: {e}")
            print(f"Raw text: {cleaned_text}")
            return {
                "summary": "Erreur de formatage de la réponse IA.",
                "layout_validation": {"score": "?", "issues": ["L'IA n'a pas renvoyé de JSON valide."]},
                "content_validation": {"score": "?", "strengths": [], "weaknesses": ["Erreur technique IA"], "general_comment": ""}
            }

    except Exception as e:
        print(f"Error in analyze_pdf: {e}")
        # Return error structure instead of raising to avoid 500 in frontend if possible, or raise
        raise e
