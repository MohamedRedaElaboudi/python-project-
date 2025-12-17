from flask import Blueprint, jsonify
from sqlalchemy import func
from ..models import db, User, Soutenance, Rapport, Student, Salle
from datetime import date

dashboard_bp = Blueprint('dashboard_bp', __name__, url_prefix='/api/dashboard')


@dashboard_bp.route('/stats', methods=['GET'])
def get_dashboard_stats():
    try:
        # ========== USERS ==========
        users_total = db.session.query(func.count(User.id)).scalar()

        # Compter par rôle
        users_admin = db.session.query(func.count(User.id)).filter(User.role == 'admin').scalar() or 0
        users_teacher = db.session.query(func.count(User.id)).filter(User.role == 'teacher').scalar() or 0
        users_student = db.session.query(func.count(User.id)).filter(User.role == 'student').scalar() or 0
        users_jury = db.session.query(func.count(User.id)).filter(User.role == 'jury').scalar() or 0


        # Format byRole (pour le graphique)
        users_by_role = [
            {
                "role": "admin",
                "count": users_admin,
                "percentage": round((users_admin / users_total) * 100, 1) if users_total else 0
            },
            {
                "role": "teacher",
                "count": users_teacher,
                "percentage": round((users_teacher / users_total) * 100, 1) if users_total else 0
            },
            {
                "role": "student",
                "count": users_student,
                "percentage": round((users_student / users_total) * 100, 1) if users_total else 0
            },
            {
                "role": "jury",
                "count": users_jury,
                "percentage": round((users_jury / users_total) * 100, 1) if users_total else 0
            },

        ]

        # ========== SOUTENANCES ==========

        soutenances_total = db.session.query(func.count(Soutenance.id)).scalar() or 0

        # ========== RAPPORTS ==========
        # Si votre modèle Rapport a des statuts


        rapports_total = db.session.query(func.count(Rapport.id)).scalar() or 0

        # ========== SALLES ==========
        salles_total = db.session.query(func.count(Salle.id)).scalar() or 0

        # Salles occupées aujourd'hui
        today = date.today()
        salles_occupied = db.session.query(func.count(Soutenance.id)).filter(
            Soutenance.date_soutenance == today,
            Soutenance.statut == 'planned'
        ).scalar() or 0

        salles_free = max(0, salles_total - salles_occupied)

        # ========== SOUTENANCES À VENIR ==========
        upcoming_soutenances_query = (
            db.session.query(Soutenance, Student, User, Salle)
            .join(Student, Soutenance.student_id == Student.user_id)
            .join(User, Student.user_id == User.id)
            .outerjoin(Salle, Soutenance.salle_id == Salle.id)
            .filter(Soutenance.statut == 'planned')
            .order_by(Soutenance.date_soutenance, Soutenance.heure_debut)
            .limit(5)
        ).all()

        upcoming_soutenances = [
            {
                "id": s.Soutenance.id,
                "date_soutenance": s.Soutenance.date_soutenance.isoformat(),
                "heure_debut": s.Soutenance.heure_debut.strftime('%H:%M'),
                "salle": s.Salle.name if s.Salle else None,
                "student_name": f"{s.User.prenom} {s.User.name}",
                "student_filiere": s.Student.filiere,
            }
            for s in upcoming_soutenances_query
        ]

        # ========== DONNÉES PAR FILIÈRE ==========
        filiere_stats_query = db.session.query(
            Student.filiere,
            func.count(Student.filiere).label('count')
        ).group_by(Student.filiere).all()

        filiere_stats = [
            {
                "filiere": filiere,
                "count": count
            }
            for filiere, count in filiere_stats_query
            if filiere  # Exclure les valeurs None
        ]

        # ========== RÉPONSE FINALE ==========
        data = {
            # Format attendu par votre frontend actuel
            "users": {
                "total": users_total,
                "admin": users_admin,
                "teacher": users_teacher,
                "student": users_student,
                "jury": users_jury,
            },
            # Format pour le graphique
            "usersByRole": users_by_role,

            "soutenances": {
                "total": soutenances_total
            },

            "rapports": {
                "total": rapports_total
            },

            "salles": {
                "total": salles_total,
            },

            "upcomingSoutenances": upcoming_soutenances,
            "filiereStats": filiere_stats
        }

        return jsonify(data)

    except Exception as e:
        import traceback
        print(f"❌ Erreur dans get_dashboard_stats: {str(e)}")
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500