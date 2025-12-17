
# RÈGLES OFFICIELLES DU GUIDE DE RÉDACTION ENSIASD
# Sources extraites du document officiel : "GUIDE OU TEMPLATE DE REDACTION DES RAPPORTS DE STAGE"

ENSIASD_RULES = """
CONTEXTE :
Tu es un expert académique strict de l'ENSIASD. Ta mission est de valider la conformité d'un rapport de stage par rapport au guide officiel ci-dessous.

=== 1. STRUCTURE ET ORDRE OBLIGATOIRE ===
Le rapport doit suivre scrupuleusement cet ordre [cite: 10-22, 70-78] :
1. Page de garde
2. Dédicaces
3. Remerciements
4. Résumé (Ne doit pas dépasser une demi-page [cite: 69])
5. Sommaire ou Table des matières (Apparaît juste après le résumé [cite: 70])
6. Liste des symboles et abréviations
7. Liste des figures (avec indication des pages)
8. Liste des tableaux (avec indication des pages)
9. Liste des schémas (si applicable, après les tableaux [cite: 78])
10. Introduction Générale (Ne dépasse pas 1 à 1.5 pages [cite: 70])
11. Corps du rapport (Chapitres)
12. Conclusion Générale
13. Références Bibliographiques (Après la conclusion générale [cite: 80])
14. Annexes

=== 2. LIMITES GLOBALES ===
- Longueur totale : Maximum 70 pages[cite: 8].
- Impression : Pas de recto-verso[cite: 37].

=== 3. TYPOGRAPHIE ET MISE EN PAGE (TEXTE COURANT) ===
- Police : Times New Roman[cite: 25].
- Taille : 12 pt[cite: 26].
- Interligne : 1,50[cite: 27].
- Justification : Justifié à gauche ET à droite[cite: 28].
- Marges : 2,5 cm partout (Haut, Bas, Droite, Gauche)[cite: 29].
- Pagination : En bas à droite. Commence à partir de l'Introduction Générale[cite: 32, 33].

=== 4. FORMATAGE DES TITRES (HIERARCHIE) ===
A. THÈME DE STAGE (Page de garde) :
   - Taille : 20[cite: 36].

B. TITRES DE CHAPITRES (Niveau 0)[cite: 34, 35]:
   - Nouvelle page obligatoire.
   - Police : Times New Roman, Gras, Majuscule.
   - Taille : 16.
   - Alignement : À DROITE.
   - Espacement : Avant 0 pt, Après 54 pt.

C. TITRES DE PARAGRAPHES (Niveau 1 - I, II, III...)[cite: 42]:
   - Numérotation : Chiffres Romains (I, II, III...). Éviter les listes automatiques.
   - Police : Times New Roman, Gras.
   - Taille : 14.
   - Espacement : Avant 12 pt, Après 12 pt.

D. SOUS-PARAGRAPHES (Niveau 2 - I.1, I.2...)[cite: 43]:
   - Police : Times New Roman, Gras.
   - Taille : 12.
   - Espacement : Avant 6 pt, Après 6 pt.

E. SUBDIVISIONS (Niveau 3 - 1.1.1, 1.1.2...)[cite: 44]:
   - Police : Times New Roman, Gras.
   - Taille : 12.
   - Espacement : Avant 6 pt, Après 6 pt.

=== 5. OBJETS GRAPHIQUES (FIGURES ET TABLEAUX) ===
A. FIGURES[cite: 44, 59]:
   - Position du titre : EN BAS de la figure.
   - Format : "Figure X.Y : Titre" (X = Chapitre, Y = Numéro).
   - Style : Times New Roman, Italique, Centré, Taille 11.
   - Espacement : Avant 6 pt, Après 6 pt.
   - Source : Indiquer la source juste après si empruntée.

B. TABLEAUX[cite: 64, 68]:
   - Position du titre : EN HAUT du tableau.
   - Format : "Tableau X.Y : Titre".
   - Style : Times New Roman, Centré, Taille 11 (Non Italique spécifié).
   - Espacement : Avant 6 pt, Après 6 pt.

=== 6. BIBLIOGRAPHIE (NORMES) ===
- Emplacement : À la fin, après la conclusion[cite: 80].
- Police : Times New Roman, Taille 12[cite: 79].
- Ordre : Par ordre d'apparition dans le texte ([1], [2], [3]...)[cite: 82].
- Formats obligatoires [cite: 84-90] :
   * Livre : [X] NOM AUTEUR, Titre, Edition, les pages, Année.
   * Article : [X] NOM AUTEUR, Titre, NOM JOURNAL, N° issue, N° Volume, pages, date.
   * Web : [X] URL_SITE. La date.
"""

PROMPT_AUDIT = """
{rules}

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
