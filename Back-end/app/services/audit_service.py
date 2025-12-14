import time
import json
import os
import google.generativeai as genai
from app.utils.config import Config
from app.utils.guide_config import ENSIASD_RULES

# Configuration unique de Gemini
if Config.GEMINI_API_KEY:
    genai.configure(api_key=Config.GEMINI_API_KEY)

def upload_to_gemini(path, mime_type="application/pdf"):
    """Envoie le fichier aux serveurs Google"""
    print(f"📤 Upload de {path} vers Google...")
    file = genai.upload_file(path, mime_type=mime_type)
    
    timeout = 30
    start = time.time()
    while file.state.name == "PROCESSING":
        if time.time() - start > timeout:
            raise TimeoutError("Traitement Google trop long")
        time.sleep(1)
        file = genai.get_file(file.name)
        
    if file.state.name == "FAILED":
        raise ValueError("Google a échoué à lire le fichier.")
    
    print("✅ Fichier traité par Google.")
    return file

def clean_json_text(text):
    """Nettoie la réponse brute de l'IA pour extraire le JSON"""
    text = text.replace("```json", "").replace("```", "").strip()
    start = text.find('{')
    end = text.rfind('}') + 1
    if start != -1 and end != -1:
        return text[start:end]
    return text

def perform_audit(file_path):
    """Fonction principale appelée par la route"""
    try:
        gemini_file = upload_to_gemini(file_path)
        model = genai.GenerativeModel("models/gemini-flash-latest")

        prompt = f"""
        {ENSIASD_RULES}

        TACHE CRITIQUE :
        Tu es un jury de soutenance sévère. Analyse ce rapport sous deux angles :
        1. LA FORME (Respect strict du guide ENSIASD ci-dessus).
        2. LE FOND (Qualité académique, pertinence, orthographe, cohérence technique).

        INSTRUCTION :
        - Ne donne pas juste des exemples. LISTE TOUTES LES ERREURS que tu trouves.
        - Vérifie si le contenu est convenable pour un niveau ingénieur.

        Réponds UNIQUEMENT avec ce JSON exact :
        {{
            "summary": "Résumé détaillé (300 mots) couvrant la problématique, la méthodologie et les résultats.",
            
            "layout_validation": {{
                "score": "Note sur 10 (Forme)",
                "issues": [
                    "Liste EXHAUSTIVE des erreurs de mise en page.",
                    "Exemple : Titre chapitre 1 mal aligné (p.4)",
                    "Exemple : Figure 3 sans légende (p.12)"
                ]
            }},

            "content_validation": {{
                "score": "Note sur 10 (Fond)",
                "strengths": ["Liste des points forts du contenu"],
                "weaknesses": [
                    "Liste EXHAUSTIVE des faiblesses de contenu.",
                    "Exemple : Introduction trop vague, manque de contexte.",
                    "Exemple : La partie technique manque de schémas explicatifs.",
                    "Exemple : Nombreuses fautes d'orthographe page 10.",
                    "Exemple : Conclusion bâclée sans perspectives."
                ],
                "general_comment": "Un commentaire global du jury sur la qualité du travail."
            }}
        }}
        """

        print("🤖 Audit complet (Forme + Fond) en cours...")
        response = model.generate_content([gemini_file, prompt])
        
        cleaned_text = clean_json_text(response.text)
        
        try:
            return json.loads(cleaned_text)
        except json.JSONDecodeError:
            return {
                "summary": "Erreur format JSON",
                "layout_validation": {"score": "?", "issues": ["Erreur technique IA"]},
                "content_validation": {"score": "?", "strengths": [], "weaknesses": ["L'IA n'a pas répondu correctement."], "general_comment": ""}
            }

    except Exception as e:
        raise e