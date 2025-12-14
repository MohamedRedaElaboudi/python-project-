from flask import Blueprint, request, jsonify, current_app
from datetime import datetime
from ..models import db, Soutenance, Jury, User, Salle, Student
from ..services.soutenance_service import SoutenanceService
import traceback


# ✅ UN SEUL BLUEPRINT
soutenances_bp = Blueprint(
    'soutenances_bp',
    __name__,
    url_prefix='/api/soutenances'
)

# =====================================================
# POST /api/soutenances/schedule
# =====================================================
@soutenances_bp.route('/schedule', methods=['POST'])
def schedule_soutenances():
    try:
        data = request.get_json()

        date_soutenance = datetime.strptime(data['date'], '%Y-%m-%d').date()
        start_time = datetime.strptime(data.get('start_time', '08:30'), '%H:%M').time()
        end_time = datetime.strptime(data.get('end_time', '18:30'), '%H:%M').time()
        duree = data.get('duree_minutes', 15)

        success, message, soutenances = SoutenanceService.schedule_soutenances_for_filiere(
            filiere=data['filiere'],
            date_soutenance=date_soutenance,
            start_time=start_time,
            end_time=end_time,
            duree_minutes=duree
        )

        return jsonify({
            'status': 'success',
            'message': message,
            'soutenances': soutenances,
            'count': len(soutenances)
        }), 201

    except Exception as e:
        current_app.logger.error(traceback.format_exc())
        return jsonify({'error': str(e)}), 500


# =====================================================
# GET /api/soutenances
# =====================================================
@soutenances_bp.route('/', methods=['GET'])
def get_soutenances():
    # Mettre à jour les statuts automatiquement
    SoutenanceService.update_soutenances_status()
    date_str = request.args.get('date')
    filiere = request.args.get('filiere')

    if not date_str:
        return jsonify([])

    date_soutenance = datetime.strptime(date_str, '%Y-%m-%d').date()

    soutenances = SoutenanceService.get_soutenances_by_date_and_filiere(
        date_soutenance,
        filiere
    )

    return jsonify(soutenances)


# routes/soutenances.py

from datetime import date


# GET /api/soutenances/all
@soutenances_bp.route('/all', methods=['GET'])
def get_all_soutenances():
    # Supprimez le filtre par date pour récupérer TOUTES les soutenances
    soutenances = Soutenance.query \
        .join(Student) \
        .order_by(Soutenance.date_soutenance.desc(), Soutenance.heure_debut) \
        .all()

    result = []
    for s in soutenances:
        result.append({
            "id": s.id,
            "heure_debut": s.heure_debut.strftime('%H:%M'),
            "date_soutenance": s.date_soutenance.strftime('%Y-%m-%d'),
            "salle": s.salle.name if s.salle else None,  # Note: 'nom' → 'name'
            "salle_id": s.salle_id,
            "student": {
                "id": s.student.user_id,
                "name": f"{s.student.user.prenom} {s.student.user.name}",
                "cne": s.student.cne,
                "filiere": s.student.filiere
            },
            "teachers": [
                {"id": j.teacher.id, "name":f"{j.teacher.prenom} {j.teacher.name}", "role": j.role}
                for j in s.juries
            ],
            "statut": s.statut
        })

    return jsonify(result)


# =====================================================
# GET /api/soutenances/students
# =====================================================
@soutenances_bp.route('/students', methods=['GET'])
def get_students():
    filiere = request.args.get('filiere')
    date_str = request.args.get('date')

    date_soutenance = datetime.strptime(date_str, '%Y-%m-%d').date() if date_str else None

    students = SoutenanceService.get_students_by_filiere(filiere, date_soutenance)
    return jsonify(students)


# =====================================================
# GET /api/soutenances/availability
# =====================================================
@soutenances_bp.route('/availability', methods=['GET'])
def get_availability():
    date_str = request.args.get('date')
    filiere = request.args.get('filiere')

    if not date_str:
        return jsonify({'error': 'Date requise'}), 400

    date_soutenance = datetime.strptime(date_str, '%Y-%m-%d').date()

    # Compter les étudiants de la filière
    students_total = Student.query.filter_by(filiere=filiere).count()

    # Compter les soutenances existantes pour cette date et filière
    existing = db.session.query(Soutenance).join(Student).filter(
        Soutenance.date_soutenance == date_soutenance,
        Student.filiere == filiere
    ).count()

    # Total de créneaux disponibles (16 matin + 16 après-midi)
    total_slots = 32

    # Compter les enseignants disponibles (sans conflit d'horaire)
    # Note: Cette partie est simplifiée, une vraie vérification nécessite
    # de vérifier créneau par créneau
    total_teachers = User.query.filter_by(role='teacher').count()

    # Pour une estimation: chaque enseignant peut faire environ 6 soutenances par jour
    # (8h de travail / 1.5h par soutenance avec préparation)
    max_soutenances_per_teacher = 6
    max_total_soutenances = total_teachers * max_soutenances_per_teacher / 3  # 3 enseignants par soutenance

    return jsonify({
        'filiere': filiere,
        'date': date_str,
        'students_total': students_total,
        'students_with_soutenance': existing,
        'students_without_soutenance': students_total - existing,
        'total_slots': total_slots,
        'available_slots': min(total_slots - existing, max_total_soutenances - existing),
        'total_teachers': total_teachers,
        'available_teachers_estimate': int(max_total_soutenances / 3),
        'total_salles': Salle.query.count(),
        'can_schedule': (students_total - existing) > 0 and
                        (total_slots - existing) > 0 and
                        (max_total_soutenances - existing) > 0
    })


# =====================================================
# DELETE /api/soutenances/<id>
# =====================================================
# =====================================================
# DELETE /api/soutenances/<id>
# =====================================================
@soutenances_bp.route('/<int:id>', methods=['DELETE'])
def delete_soutenance(id):
    try:
        # Vérifier si la soutenance existe
        soutenance = Soutenance.query.get(id)
        if not soutenance:
            return jsonify({'error': 'Soutenance non trouvée', 'id': id}), 404

        # Récupérer les informations avant suppression pour le logging
        student_name = f"{soutenance.student.user.prenom} {soutenance.student.user.name}" if soutenance.student else "Inconnu"
        date_soutenance = soutenance.date_soutenance
        heure_debut = soutenance.heure_debut

        # Supprimer d'abord les jurys (à cause de la contrainte de clé étrangère)
        deleted_juries = Jury.query.filter_by(soutenance_id=id).delete()

        # Supprimer la soutenance
        db.session.delete(soutenance)
        db.session.commit()

        current_app.logger.info(
            f"Soutenance {id} supprimée - Étudiant: {student_name}, "
            f"Date: {date_soutenance}, Heure: {heure_debut}, "
            f"Jurys supprimés: {deleted_juries}"
        )

        return jsonify({
            'status': 'deleted',
            'id': id,
            'message': f'Soutenance supprimée avec succès ({deleted_juries} jurys supprimés)'
        })

    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Erreur suppression soutenance {id}: {str(e)}")
        current_app.logger.error(traceback.format_exc())
        return jsonify({'error': str(e), 'id': id}), 500
