from flask import Blueprint, jsonify, request, send_file
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.services import jury_dashboard_service
from app.models import EvaluationCriterion, db

jury_dashboard_bp = Blueprint('jury_dashboard_bp', __name__, url_prefix='/api/jury')

from app.services.audit_service_impl import analyze_pdf
from app.services import jury_dashboard_service, plagiat_service
from app.models import Soutenance
import os

@jury_dashboard_bp.route('/evaluation/<int:soutenance_id>/audit', methods=['GET'])
@jwt_required()
def audit_report(soutenance_id):
    try:
        current_user_id = get_jwt_identity()
        
        soutenance = Soutenance.query.get(soutenance_id)
        if not soutenance:
             return jsonify({"message": "Soutenance not found"}), 404
             
        # Fix: Report path is in the Rapport model, not Student
        if not soutenance.rapport or not soutenance.rapport.storage_path:
            return jsonify({"message": "Rapport non disponible"}), 404
            
        file_path = os.path.join(os.getcwd(), soutenance.rapport.storage_path)
        
        # Debug Logging
        with open("debug_audit.log", "a") as f:
            f.write(f"Attempting audit for rapport: {file_path}\n")
            f.write(f"Exists: {os.path.exists(file_path)}\n")

        analysis = analyze_pdf(file_path)
        return jsonify(analysis), 200

    except Exception as e:
        with open("debug_audit.log", "a") as f:
            f.write(f"ERROR in audit_report: {str(e)}\n")
        print(f"Audit Error: {e}")
        return jsonify({"message": str(e)}), 500

@jury_dashboard_bp.route('/dashboard', methods=['GET'])
@jwt_required()
def get_dashboard_data():
    try:
        current_user_id = get_jwt_identity()
        kpis = jury_dashboard_service.get_dashboard_stats(current_user_id)
        upcoming = jury_dashboard_service.get_upcoming_soutenances(current_user_id)
        
        return jsonify({
            "kpis": kpis,
            "upcoming_soutenances": upcoming
        }), 200
    except Exception as e:
        import traceback
        with open("backend_errors.log", "a") as f:
            f.write(f"Error in get_dashboard_data: {e}\n")
            f.write(traceback.format_exc())
            f.write("\n" + "="*50 + "\n")
        print(f"Error in get_dashboard_data: {e}")
        return jsonify({"message": "Server error", "details": str(e)}), 500

@jury_dashboard_bp.route('/reports', methods=['GET'])
@jwt_required()
def get_reports():
    try:
        current_user_id = get_jwt_identity()
        reports = jury_dashboard_service.get_assigned_reports(current_user_id)
        return jsonify(reports), 200
    except Exception as e:
        print(f"Error in get_reports: {e}")
        return jsonify({"message": "Server error"}), 500

@jury_dashboard_bp.route('/evaluation/<int:rapport_id>', methods=['GET'])
@jwt_required()
def get_evaluation(rapport_id):
    try:
        current_user_id = get_jwt_identity()
        data, error = jury_dashboard_service.get_evaluation_details(current_user_id, rapport_id)
        
        if error:
            return jsonify({"message": error}), 403 # or 404
            
        return jsonify(data), 200
    except Exception as e:
        print(f"Error in get_evaluation: {e}")
        return jsonify({"message": "Server error"}), 500

@jury_dashboard_bp.route('/evaluation', methods=['POST'])
@jwt_required()
def save_evaluation():
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()
        
        evaluation, error = jury_dashboard_service.save_evaluation(current_user_id, data)
        
        if error:
            return jsonify({"message": error}), 400
            
        return jsonify({"message": "Evaluation saved", "id": evaluation.id}), 200
    except Exception as e:
        print(f"Error in save_evaluation: {e}")
        return jsonify({"message": "Server error"}), 500

@jury_dashboard_bp.route('/seed-criteria', methods=['POST'])
def seed_criteria():
    """Helper to seed criteria if missing."""
    try:
        if EvaluationCriterion.query.count() == 0:
            criteria = [
                {"name": "Qualité du rapport", "description": "Structure, orthographe, clarté", "max_score": 5},
                {"name": "Présentation orale", "description": "Aisance, clarté, temps", "max_score": 5},
                {"name": "Maîtrise du sujet", "description": "Réponses aux questions, profondeur", "max_score": 5},
                {"name": "Travail réalisé", "description": "Pertinence, complexité, résultats", "max_score": 5},
            ]
            for c in criteria:
                db.session.add(EvaluationCriterion(**c))
            db.session.commit()
            return jsonify({"message": "Criteria seeded"}), 201
        return jsonify({"message": "Criteria already exist"}), 200
    except Exception as e:
        print(f"Error seeding criteria: {e}")
        return jsonify({"message": "Server error"}), 500
@jury_dashboard_bp.route('/rapports/<int:rapport_id>/view', methods=['GET'])
@jwt_required()
def view_rapport(rapport_id):
    current_user_id = get_jwt_identity()
    # Handle int/dict identity
    if isinstance(current_user_id, dict):
        current_user_id = current_user_id.get('id')
    
    # 1. Verify user is a jury (or teacher)
    # Ideally should check if assigned, but for now just check role/existence
    # Using service to check assignment + existence
    # Re-using get_evaluation_details logic partially or just direct query
    
    from app.models import Rapport
    rapport = Rapport.query.get(rapport_id)
    if not rapport:
        return jsonify({"message": "Rapport non trouvé"}), 404
        
    if not rapport.storage_path or not os.path.exists(rapport.storage_path):
        return jsonify({"message": "Fichier PDF introuvable sur le serveur"}), 404
        
    try:
        return send_file(
            rapport.storage_path,
            mimetype='application/pdf',
            as_attachment=False,
            download_name=rapport.filename
        )
    except Exception as e:
        print(f"Error serving PDF: {e}")
        return jsonify({"message": "Erreur lors de la lecture du fichier"}), 500

@jury_dashboard_bp.route('/plagiat/analyze/<int:rapport_id>', methods=['POST'])
@jwt_required()
def analyze_plagiat(rapport_id):
    try:
        current_user_id = get_jwt_identity() # Can be used to log who requested logic
        result = plagiat_service.analyze_plagiarism(rapport_id)
        if "error" in result:
             return jsonify(result), 400
        return jsonify(result), 200
    except Exception as e:
        print(f"Error in analyze_plagiat: {e}")
        return jsonify({"message": str(e)}), 500
