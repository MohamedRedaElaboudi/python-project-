# routes/jurys.py - CORRECTION
from flask import Blueprint, request, jsonify
from ..models import db, Jury, Soutenance, User
from flask_jwt_extended import jwt_required

jurys_bp = Blueprint('jurys_bp', __name__, url_prefix='/api/jurys')


# Récupérer tous les jurys d'une soutenance
@jurys_bp.route('/soutenance/<int:soutenance_id>', methods=['GET'])
def get_jurys_by_soutenance(soutenance_id):
    jurys = Jury.query.filter_by(soutenance_id=soutenance_id).all()

    result = []
    for jury in jurys:
        teacher = User.query.get(jury.teacher_id)
        if teacher:
            result.append({
                'id': jury.id,
                'soutenance_id': jury.soutenance_id,
                'teacher_id': jury.teacher_id,
                'teacher_name': f"{teacher.prenom} {teacher.name}",
                'teacher_email': teacher.email,
                'role': jury.role,
                'role_label': get_role_label(jury.role)
            })

    return jsonify(result)


# Récupérer les enseignants disponibles pour un jury
@jurys_bp.route('/teachers/available', methods=['GET'])
def get_available_teachers():
    # Récupérer tous les enseignants (role = 'teacher' ou 'jury')
    teachers = User.query.filter(User.role.in_(['teacher', 'jury'])).all()

    result = []
    for teacher in teachers:
        result.append({
            'id': teacher.id,
            'name': f"{teacher.prenom} {teacher.name}",
            'email': teacher.email,
            'role': teacher.role
        })

    return jsonify(result)


# Ajouter un membre au jury
@jurys_bp.route('/', methods=['POST'])
def add_jury_member():
    data = request.get_json()

    # Validation des champs
    required_fields = ['soutenance_id', 'teacher_id', 'role']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Le champ {field} est requis'}), 400

    # Vérifier si la soutenance existe
    soutenance = Soutenance.query.get(data['soutenance_id'])
    if not soutenance:
        return jsonify({'error': 'Soutenance non trouvée'}), 404

    # Vérifier si l'enseignant existe
    teacher = User.query.get(data['teacher_id'])
    if not teacher or teacher.role not in ['teacher', 'jury']:
        return jsonify({'error': 'Enseignant non trouvé ou non autorisé'}), 400

    # Vérifier si le rôle est valide
    if data['role'] not in ['president', 'member', 'supervisor']:
        return jsonify({'error': 'Rôle invalide'}), 400

    # Vérifier si cet enseignant est déjà dans le jury pour cette soutenance
    existing = Jury.query.filter_by(
        soutenance_id=data['soutenance_id'],
        teacher_id=data['teacher_id']
    ).first()

    if existing:
        return jsonify({'error': 'Cet enseignant est déjà dans le jury'}), 400

    # Vérifier s'il y a déjà un président pour cette soutenance
    if data['role'] == 'president':
        existing_president = Jury.query.filter_by(
            soutenance_id=data['soutenance_id'],
            role='president'
        ).first()

        if existing_president:
            return jsonify({'error': 'Un président est déjà assigné à cette soutenance'}), 400

    try:
        jury = Jury(
            soutenance_id=data['soutenance_id'],
            teacher_id=data['teacher_id'],
            role=data['role']
        )

        db.session.add(jury)
        db.session.commit()

        return jsonify({
            'message': 'Membre du jury ajouté avec succès',
            'jury': {
                'id': jury.id,
                'soutenance_id': jury.soutenance_id,
                'teacher_id': jury.teacher_id,
                'role': jury.role
            }
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


# Supprimer un membre du jury
@jurys_bp.route('/<int:jury_id>', methods=['DELETE'])
def remove_jury_member(jury_id):
    jury = Jury.query.get_or_404(jury_id)

    try:
        db.session.delete(jury)
        db.session.commit()

        return jsonify({'message': 'Membre du jury supprimé avec succès'})

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


# Mettre à jour le rôle d'un membre du jury
@jurys_bp.route('/<int:jury_id>', methods=['PUT'])
def update_jury_member(jury_id):
    jury = Jury.query.get_or_404(jury_id)
    data = request.get_json()

    if 'role' in data:
        if data['role'] not in ['president', 'member', 'supervisor']:
            return jsonify({'error': 'Rôle invalide'}), 400

        # Vérifier s'il y a déjà un président si on veut en assigner un nouveau
        if data['role'] == 'president' and jury.role != 'president':
            existing_president = Jury.query.filter_by(
                soutenance_id=jury.soutenance_id,
                role='president'
            ).first()

            if existing_president and existing_president.id != jury_id:
                return jsonify({'error': 'Un président est déjà assigné à cette soutenance'}), 400

        jury.role = data['role']

    try:
        db.session.commit()

        return jsonify({
            'message': 'Rôle du jury mis à jour avec succès',
            'jury': {
                'id': jury.id,
                'soutenance_id': jury.soutenance_id,
                'teacher_id': jury.teacher_id,
                'role': jury.role
            }
        })

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


# Récupérer les soutenances avec leurs jurys - CORRECTION ICI
@jurys_bp.route('/soutenances/with-jurys', methods=['GET'])
def get_soutenances_with_jurys():
    soutenances = Soutenance.query.all()

    result = []
    for soutenance in soutenances:
        # Récupérer les jurys de cette soutenance
        jurys = Jury.query.filter_by(soutenance_id=soutenance.id).all()

        jury_list = []
        for jury in jurys:
            teacher = User.query.get(jury.teacher_id)
            if teacher:
                jury_list.append({
                    'id': jury.id,
                    'teacher_id': teacher.id,
                    'teacher_name': f"{teacher.prenom} {teacher.name}",
                    'teacher_email': teacher.email,  # CORRECTION : Ajouter l'email
                    'role': jury.role,
                    'role_label': get_role_label(jury.role)
                })

        # Récupérer l'étudiant
        student_user = User.query.get(soutenance.student_id) if soutenance.student_id else None
        student_info = None
        if student_user:
            student_info = {
                'id': student_user.id,
                'name': f"{student_user.prenom} {student_user.name}",
                'email': student_user.email
            }

        result.append({
            'id': soutenance.id,
            'date_soutenance': soutenance.date_soutenance.isoformat() if soutenance.date_soutenance else None,
            'heure_debut': str(soutenance.heure_debut) if soutenance.heure_debut else None,
            'duree_minutes': soutenance.duree_minutes,
            'statut': soutenance.statut,
            'salle': soutenance.salle.name if soutenance.salle else None,
            'student': student_info,
            'jurys': jury_list,
            'president': next((j for j in jury_list if j['role'] == 'president'), None),
            'membres': [j for j in jury_list if j['role'] == 'member'],
            'superviseur': next((j for j in jury_list if j['role'] == 'supervisor'), None)
        })

    return jsonify(result)


# NOUVELLE ROUTE : Récupérer tous les jurys
@jurys_bp.route('/all', methods=['GET'])
def get_all_jurys():
    jurys = Jury.query.all()

    result = []
    for jury in jurys:
        teacher = User.query.get(jury.teacher_id)
        soutenance = Soutenance.query.get(jury.soutenance_id)
        student_user = User.query.get(soutenance.student_id) if soutenance and soutenance.student_id else None

        if teacher and soutenance:
            result.append({
                'id': jury.id,
                'soutenance_id': jury.soutenance_id,
                'teacher_id': teacher.id,
                'teacher_name': f"{teacher.prenom} {teacher.name}",
                'teacher_email': teacher.email,
                'role': jury.role,
                'role_label': get_role_label(jury.role),
                'soutenance_date': soutenance.date_soutenance.isoformat() if soutenance.date_soutenance else None,
                'student_name': f"{student_user.prenom} {student_user.name}" if student_user else "Non spécifié",
                'salle_name': soutenance.salle.name if soutenance.salle else "Non spécifiée"
            })

    return jsonify(result)


# Fonction helper pour les labels des rôles
def get_role_label(role):
    labels = {
        'president': 'Président du Jury',
        'member': 'Membre du Jury',
        'supervisor': 'Encadrant'
    }
    return labels.get(role, role)