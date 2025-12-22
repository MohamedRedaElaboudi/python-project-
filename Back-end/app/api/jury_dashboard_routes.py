from flask import Blueprint, jsonify, request, send_file
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.services import jury_dashboard_service
from app.models import EvaluationCriterion, db, Rapport, Soutenance

jury_dashboard_bp = Blueprint('jury_dashboard_bp', __name__, url_prefix='/api/jury')

from app.services.audit_service_impl import analyze_pdf
from app.services import jury_dashboard_service
import os

@jury_dashboard_bp.route('/evaluation/<int:rapport_id>/audit', methods=['GET'])
@jwt_required()
def audit_report(rapport_id):
    try:
        identity = get_jwt_identity()
        if isinstance(identity, dict):
            current_user_id = int(identity.get('id'))
        else:
            current_user_id = int(identity)
        
        # Get rapport first
        rapport = Rapport.query.get(rapport_id)
        if not rapport:
            return jsonify({"message": "Rapport not found"}), 404
        
        # Find soutenance via student_id
        soutenance = Soutenance.query.filter_by(student_id=rapport.auteur_id).first()
        if not soutenance:
             return jsonify({"message": "Soutenance not found for this student"}), 404
             
        # Check if rapport file exists
        if not rapport.storage_path:
            return jsonify({"message": "Rapport file path not found"}), 404
            
        file_path = os.path.join(os.getcwd(), rapport.storage_path)
        
        if not os.path.exists(file_path):
            return jsonify({"message": f"Rapport file not found: {file_path}"}), 404
        
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
        identity = get_jwt_identity()
        current_user_id = int(identity.get('id')) if isinstance(identity, dict) else int(identity)
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
        identity = get_jwt_identity()
        current_user_id = int(identity.get('id')) if isinstance(identity, dict) else int(identity)
        reports = jury_dashboard_service.get_assigned_reports(current_user_id)
        return jsonify(reports), 200
    except Exception as e:
        print(f"Error in get_reports: {e}")
        return jsonify({"message": "Server error"}), 500

@jury_dashboard_bp.route('/evaluation/<int:rapport_id>', methods=['GET'])
@jwt_required()
def get_evaluation(rapport_id):
    try:
        identity = get_jwt_identity()
        current_user_id = int(identity.get('id')) if isinstance(identity, dict) else int(identity)
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
        identity = get_jwt_identity()
        current_user_id = int(identity.get('id')) if isinstance(identity, dict) else int(identity)
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
    identity = get_jwt_identity()
    current_user_id = int(identity.get('id')) if isinstance(identity, dict) else int(identity)
    
    # 1. Verify user is a jury (or teacher)
    # Ideally should check if assigned, but for now just check role/existence
    # Using service to check assignment + existence
    # Re-using get_evaluation_details logic partially or just direct query
    
    from app.models import Rapport
    from flask import make_response
    
    rapport = Rapport.query.get(rapport_id)
    if not rapport:
        return jsonify({"message": "Rapport non trouvé"}), 404
        
    if not rapport.storage_path:
        return jsonify({"message": "Fichier PDF introuvable sur le serveur"}), 404
    
    # Convert relative path to absolute path
    file_path = os.path.join(os.getcwd(), rapport.storage_path)
    
    if not os.path.exists(file_path):
        return jsonify({"message": f"Fichier PDF introuvable: {file_path}"}), 404
        
    try:
        # Create response with send_file
        response = make_response(
            send_file(
                file_path,
                mimetype='application/pdf',
                as_attachment=False,
                download_name=rapport.filename
            )
        )
        
        # Add CORS headers explicitly
        response.headers['Access-Control-Allow-Origin'] = request.headers.get('Origin', '*')
        response.headers['Access-Control-Allow-Credentials'] = 'true'
        response.headers['Access-Control-Expose-Headers'] = 'Content-Disposition, Content-Type, Content-Length'
        
        return response
    except Exception as e:
        print(f"Error serving PDF: {e}")
        return jsonify({"message": "Erreur lors de la lecture du fichier"}), 500


