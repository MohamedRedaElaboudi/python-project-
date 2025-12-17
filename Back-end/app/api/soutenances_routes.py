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
# routes/soutenances.py

# =====================================================
# GET /api/soutenances/students (avec niveau)
# =====================================================
@soutenances_bp.route('/students', methods=['GET'])
def get_students():
    filiere = request.args.get('filiere')
    date_str = request.args.get('date')
    niveau = request.args.get('niveau')

    date_soutenance = datetime.strptime(date_str, '%Y-%m-%d').date() if date_str else None

    students = SoutenanceService.get_students_by_filiere(filiere, date_soutenance, niveau)
    return jsonify(students)


# =====================================================
# GET /api/soutenances (avec niveau)
# =====================================================
@soutenances_bp.route('/', methods=['GET'])
def get_soutenances():
    # Mettre à jour les statuts automatiquement
    SoutenanceService.update_soutenances_status()

    date_str = request.args.get('date')
    filiere = request.args.get('filiere')
    niveau = request.args.get('niveau')

    if not date_str:
        return jsonify([])

    date_soutenance = datetime.strptime(date_str, '%Y-%m-%d').date()

    soutenances = SoutenanceService.get_soutenances_by_date_and_filiere(
        date_soutenance,
        filiere,
        niveau
    )

    return jsonify(soutenances)


# =====================================================
# POST /api/soutenances/schedule (avec niveau)
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
            niveau=data.get('niveau'),  # Ajout du niveau
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


# routes/soutenances.py

from datetime import date


# GET /api/soutenances/all
# routes/soutenances.py

# GET /api/soutenances/all
@soutenances_bp.route('/all', methods=['GET'])
def get_all_soutenances():
    # Récupérer TOUTES les soutenances
    soutenances = Soutenance.query \
        .join(Student) \
        .join(User) \
        .outerjoin(Salle) \
        .order_by(Soutenance.date_soutenance.desc(), Soutenance.heure_debut) \
        .all()

    result = []
    for s in soutenances:
        # S'assurer que l'étudiant a un niveau
        niveau_etudiant = s.student.niveau if s.student and s.student.niveau else 'Non spécifié'

        result.append({
            "id": s.id,
            "heure_debut": s.heure_debut.strftime('%H:%M'),
            "date_soutenance": s.date_soutenance.strftime('%Y-%m-%d'),
            "salle": s.salle.name if s.salle else None,
            "salle_id": s.salle_id,
            "student": {
                "id": s.student.user_id,
                "name": f"{s.student.user.prenom} {s.student.user.name}",
                "cne": s.student.cne,
                "filiere": s.student.filiere,
                "niveau": niveau_etudiant  # Ajout du niveau
            },
            "teachers": [
                {"id": j.teacher.id, "name": f"{j.teacher.prenom} {j.teacher.name}", "role": j.role}
                for j in s.juries
            ],
            "statut": s.statut
        })

    return jsonify(result)


# =====================================================
# GET /api/soutenances/students
# =====================================================



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
@soutenances_bp.route('/<int:id>', methods=['DELETE'])
def delete_soutenance(id):
    try:
        # Vérifier si la soutenance existe
        soutenance = Soutenance.query.get(id)
        if not soutenance:
            return jsonify({'error': 'Soutenance non trouvée', 'id': id}), 404

        # Récupérer les enseignants du jury
        teachers_in_jury = [jury.teacher for jury in soutenance.juries]

        # Récupérer les informations avant suppression pour le logging
        student_name = f"{soutenance.student.user.prenom} {soutenance.student.user.name}" if soutenance.student else "Inconnu"
        date_soutenance = soutenance.date_soutenance
        heure_debut = soutenance.heure_debut

        # Supprimer d'abord les jurys (à cause de la contrainte de clé étrangère)
        deleted_juries = Jury.query.filter_by(soutenance_id=id).delete()

        # Supprimer la soutenance
        db.session.delete(soutenance)

        # Vérifier si les enseignants ont d'autres soutenances
        for teacher in teachers_in_jury:
            other_juries = Jury.query.join(Soutenance).filter(
                Jury.teacher_id == teacher.id,
                Soutenance.id != id
            ).count()

            # Si l'enseignant n'a plus d'autres soutenances, remettre son rôle à 'teacher'
            if other_juries == 0:
                teacher.role = 'teacher'
                current_app.logger.info(f"Rôle remis à 'teacher' pour {teacher.prenom} {teacher.name}")

        db.session.commit()

        current_app.logger.info(
            f"Soutenance {id} supprimée - Étudiant: {student_name}, "
            f"Date: {date_soutenance}, Heure: {heure_debut}, "
            f"Jurys supprimés: {deleted_juries}"
        )
        SoutenanceService.update_teacher_roles()
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


# Dans routes/soutenances.py
@soutenances_bp.route('/check-slot-availability', methods=['GET'])
def check_slot_availability():
    """Vérifie la disponibilité pour un créneau spécifique"""
    try:
        date_str = request.args.get('date')
        time_str = request.args.get('time')
        duree = int(request.args.get('duree', 15))

        if not date_str or not time_str:
            return jsonify({'error': 'Date et heure requises'}), 400

        date_soutenance = datetime.strptime(date_str, '%Y-%m-%d').date()
        heure_debut = datetime.strptime(time_str, '%H:%M').time()

        # Vérifier les conflits
        available_teachers = SoutenanceService.get_available_teachers(
            date_soutenance, heure_debut, duree
        )

        # Vérifier les salles disponibles
        busy_salles = db.session.query(Soutenance.salle_id).filter(
            Soutenance.date_soutenance == date_soutenance,
            Soutenance.heure_debut == heure_debut
        ).all()

        busy_salle_ids = {s[0] for s in busy_salles}

        available_salles = Salle.query.filter(
            ~Salle.id.in_(busy_salle_ids)
        ).all()

        return jsonify({
            'date': date_str,
            'time': time_str,
            'duration': duree,
            'available_teachers': len(available_teachers),
            'teachers_list': available_teachers,
            'available_salles': len(available_salles),
            'salles_list': [{'id': s.id, 'name': s.name} for s in available_salles],
            'is_available': len(available_teachers) >= 3 and len(available_salles) >= 1
        })

    except Exception as e:
        current_app.logger.error(f"Erreur vérification créneau: {str(e)}")
        return jsonify({'error': str(e)}), 500


# =====================================================
# NOUVELLES ROUTES À AJOUTER
# =====================================================

@soutenances_bp.route('/students-without', methods=['GET'])
def get_students_without_soutenance():
    """Récupérer les étudiants avec/sans soutenance pour une filière/niveau"""
    try:
        filiere = request.args.get('filiere')
        niveau = request.args.get('niveau')
        date_str = request.args.get('date')

        if not filiere:
            return jsonify({'error': 'Filière requise'}), 400

        # Si date fournie, parser, sinon utiliser None
        date_soutenance = None
        if date_str:
            date_soutenance = datetime.strptime(date_str, '%Y-%m-%d').date()

        # Construire la requête de base
        query = db.session.query(
            Student,
            Soutenance,
            Salle,
            User
        ).outerjoin(
            Soutenance, Student.user_id == Soutenance.student_id
        ).outerjoin(
            Salle, Soutenance.salle_id == Salle.id
        ).join(
            User, Student.user_id == User.id
        ).filter(
            Student.filiere == filiere
        )

        # Appliquer le filtre niveau si fourni
        if niveau and niveau != 'Tous les niveaux':
            query = query.filter(Student.niveau == niveau)

        # Filtrer par date si fournie
        if date_soutenance:
            query = query.filter(
                (Soutenance.date_soutenance == date_soutenance) |
                (Soutenance.id.is_(None))
            )

        # Exécuter la requête
        results = query.all()

        students_list = []
        for student, soutenance, salle, user in results:
            has_soutenance = soutenance is not None

            student_data = {
                'id': student.user_id,
                'name': f"{user.prenom} {user.name}",
                'cne': student.cne,
                'filiere': student.filiere,
                'niveau': student.niveau or 'Non spécifié',
                'has_soutenance': has_soutenance,
                'soutenance_id': soutenance.id if soutenance else None,
                'soutenance_heure': soutenance.heure_debut.strftime(
                    '%H:%M') if soutenance and soutenance.heure_debut else None,
                'soutenance_salle': salle.name if salle else None,
                'soutenance_date': soutenance.date_soutenance.strftime(
                    '%Y-%m-%d') if soutenance and soutenance.date_soutenance else None
            }
            students_list.append(student_data)

        # Trier par nom
        students_list.sort(key=lambda x: x['name'])

        return jsonify(students_list)

    except Exception as e:
        current_app.logger.error(f"Erreur récupération étudiants: {str(e)}")
        current_app.logger.error(traceback.format_exc())
        return jsonify({'error': str(e)}), 500


@soutenances_bp.route('/stats', methods=['GET'])
def get_soutenance_stats():
    """Récupérer les statistiques des soutenances pour une filière/niveau"""
    try:
        filiere = request.args.get('filiere')
        niveau = request.args.get('niveau')
        date_str = request.args.get('date')

        if not filiere:
            return jsonify({'error': 'Filière requise'}), 400

        # Si date fournie, parser, sinon utiliser None
        date_soutenance = None
        if date_str:
            date_soutenance = datetime.strptime(date_str, '%Y-%m-%d').date()

        # Compter le total des étudiants
        query_total = db.session.query(Student).filter(Student.filiere == filiere)

        # Filtrer par niveau si fourni
        if niveau and niveau != 'Tous les niveaux':
            query_total = query_total.filter(Student.niveau == niveau)

        total_students = query_total.count()

        # Compter les étudiants avec soutenance
        if date_soutenance:
            # Si date spécifiée, vérifier les soutenances à cette date
            query_with_soutenance = db.session.query(Student).join(
                Soutenance, Student.user_id == Soutenance.student_id
            ).filter(
                Student.filiere == filiere,
                Soutenance.date_soutenance == date_soutenance
            )
        else:
            # Sinon, compter tous les étudiants qui ont au moins une soutenance
            query_with_soutenance = db.session.query(Student).join(
                Soutenance, Student.user_id == Soutenance.student_id
            ).filter(
                Student.filiere == filiere
            ).distinct(Student.user_id)

        # Filtrer par niveau si fourni
        if niveau and niveau != 'Tous les niveaux':
            query_with_soutenance = query_with_soutenance.filter(Student.niveau == niveau)

        with_soutenance = query_with_soutenance.count()

        # Calculer sans soutenance
        without_soutenance = total_students - with_soutenance

        return jsonify({
            'totalStudents': total_students,
            'withSoutenance': with_soutenance,
            'withoutSoutenance': without_soutenance
        })

    except Exception as e:
        current_app.logger.error(f"Erreur récupération statistiques: {str(e)}")
        current_app.logger.error(traceback.format_exc())
        return jsonify({'error': str(e)}), 500


@soutenances_bp.route('/by-filiere-niveau', methods=['GET'])
def get_soutenances_by_filiere_niveau():
    """Récupérer toutes les soutenances groupées par filière et niveau"""
    try:
        # Récupérer toutes les soutenances avec les relations
        soutenances = Soutenance.query \
            .join(Student) \
            .join(User) \
            .outerjoin(Salle) \
            .order_by(
            Student.filiere,
            Student.niveau,
            Soutenance.date_soutenance,
            Soutenance.heure_debut
        ) \
            .all()

        # Grouper par filière et niveau
        grouped_data = {}

        for s in soutenances:
            filiere = s.student.filiere or 'Filière non spécifiée'
            niveau = s.student.niveau or 'Non spécifié'

            key = f"{filiere}-{niveau}"

            if key not in grouped_data:
                grouped_data[key] = {
                    'filiere': filiere,
                    'niveau': niveau,
                    'soutenances': []
                }

            # Préparer les données du jury
            teachers = []
            for jury in s.juries:
                teachers.append({
                    'id': jury.teacher.id,
                    'name': f"{jury.teacher.prenom} {jury.teacher.name}",
                    'role': jury.role
                })

            # Ajouter la soutenance
            grouped_data[key]['soutenances'].append({
                'id': s.id,
                'heure_debut': s.heure_debut.strftime('%H:%M'),
                'date_soutenance': s.date_soutenance.strftime('%Y-%m-%d'),
                'salle': s.salle.name if s.salle else None,
                'salle_id': s.salle_id,
                'student': {
                    'id': s.student.user_id,
                    'name': f"{s.student.user.prenom} {s.student.user.name}",
                    'cne': s.student.cne,
                    'filiere': s.student.filiere,
                    'niveau': niveau
                },
                'teachers': teachers,
                'statut': s.statut
            })

        # Convertir en liste
        result = list(grouped_data.values())

        # Trier par filière puis niveau
        result.sort(key=lambda x: (x['filiere'], x['niveau']))

        return jsonify(result)

    except Exception as e:
        current_app.logger.error(f"Erreur récupération groupée: {str(e)}")
        current_app.logger.error(traceback.format_exc())
        return jsonify({'error': str(e)}), 500


@soutenances_bp.route('/update-status/<int:id>', methods=['PUT'])
def update_soutenance_status(id):
    """Mettre à jour le statut d'une soutenance"""
    try:
        data = request.get_json()
        new_status = data.get('statut')

        if not new_status:
            return jsonify({'error': 'Statut requis'}), 400

        # Vérifier les statuts valides
        valid_statuses = ['planned', 'in_progress', 'done', 'cancelled']
        if new_status not in valid_statuses:
            return jsonify({'error': f'Statut invalide. Valeurs autorisées: {valid_statuses}'}), 400

        # Récupérer la soutenance
        soutenance = Soutenance.query.get(id)
        if not soutenance:
            return jsonify({'error': 'Soutenance non trouvée'}), 404

        # Mettre à jour le statut
        old_status = soutenance.statut
        soutenance.statut = new_status
        db.session.commit()

        # Journaliser
        current_app.logger.info(
            f"Soutenance {id} - Statut mis à jour: {old_status} -> {new_status}"
        )

        return jsonify({
            'status': 'updated',
            'id': id,
            'statut': new_status,
            'message': f'Statut mis à jour avec succès'
        })

    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Erreur mise à jour statut: {str(e)}")
        return jsonify({'error': str(e)}), 500
