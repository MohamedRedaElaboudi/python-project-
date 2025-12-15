import traceback
from datetime import datetime, time, timedelta, date
from typing import List, Dict, Optional, Tuple
from flask import current_app
from ..models import db, Soutenance, Jury, User, Salle, Student
import random
from sqlalchemy import and_, or_, not_


class SoutenanceService:

    @staticmethod
    def get_working_slots():
        """Retourne tous les créneaux horaires de 15 minutes"""
        current_app.logger.info("Génération des créneaux horaires")

        slots = []

        # Créneaux du matin : 8h30 à 12h30
        morning_start = time(8, 30)
        morning_end = time(12, 30)

        # Créneaux de l'après-midi : 14h30 à 18h30
        afternoon_start = time(14, 30)
        afternoon_end = time(18, 30)

        # Générer les créneaux du matin
        current_time = morning_start
        while current_time < morning_end:
            slots.append({
                'heure': current_time.strftime('%H:%M'),
                'label': current_time.strftime('%H:%M')
            })
            # Ajouter 15 minutes
            current_time = (datetime.combine(date.today(), current_time) +
                            timedelta(minutes=15)).time()

        # Générer les créneaux de l'après-midi
        current_time = afternoon_start
        while current_time < afternoon_end:
            slots.append({
                'heure': current_time.strftime('%H:%M'),
                'label': current_time.strftime('%H:%M')
            })
            # Ajouter 15 minutes
            current_time = (datetime.combine(date.today(), current_time) +
                            timedelta(minutes=15)).time()

        current_app.logger.info(f"{len(slots)} créneaux générés")
        return slots

    @staticmethod
    def get_available_teachers(date_soutenance: date, heure_debut: time, duree_minutes: int):
        """
        Récupère les enseignants ET jurys disponibles pour un créneau donné
        """
        # Calculer l'heure de fin
        heure_fin = (datetime.combine(date.today(), heure_debut) +
                     timedelta(minutes=duree_minutes)).time()

        # Récupérer tous les enseignants ET jurys
        all_teachers = User.query.filter(
            User.role.in_(['teacher', 'jury'])
        ).all()

        available_teachers = []
        for teacher in all_teachers:
            # Vérifier si le professeur/jury est déjà occupé pendant ce créneau
            conflict = Jury.query.join(Soutenance).filter(
                Jury.teacher_id == teacher.id,
                Soutenance.date_soutenance == date_soutenance,
                or_(
                    # Les créneaux se chevauchent
                    and_(
                        Soutenance.heure_debut < heure_fin,
                        (datetime.combine(date.today(), Soutenance.heure_debut) +
                         timedelta(minutes=Soutenance.duree_minutes)).time() > heure_debut
                    )
                )
            ).first()

            if not conflict:
                available_teachers.append({
                    'id': teacher.id,
                    'name': f"{teacher.prenom} {teacher.name}",
                    'role': teacher.role,
                    'email': teacher.email
                })

        return available_teachers

    @staticmethod
    def check_teacher_conflicts(date_soutenance: date, heure_debut: time, duree_minutes: int, teacher_ids: List[int]):
        """
        Vérifie si des enseignants/jurys ont des conflits d'horaire
        """
        heure_fin = (datetime.combine(date.today(), heure_debut) +
                     timedelta(minutes=duree_minutes)).time()

        conflicts = []
        for teacher_id in teacher_ids:
            # Vérifier si le professeur/jury a déjà une soutenance pendant ce créneau
            existing_jury = Jury.query.join(Soutenance).filter(
                Jury.teacher_id == teacher_id,
                Soutenance.date_soutenance == date_soutenance,
                or_(
                    # Les créneaux se chevauchent
                    and_(
                        Soutenance.heure_debut < heure_fin,
                        (datetime.combine(date.today(), Soutenance.heure_debut) +
                         timedelta(minutes=Soutenance.duree_minutes)).time() > heure_debut
                    )
                )
            ).first()

            if existing_jury:
                # Récupérer les infos du conflit
                teacher = User.query.get(teacher_id)
                conflicts.append({
                    'teacher_id': teacher_id,
                    'teacher_name': f"{teacher.prenom} {teacher.name}",
                    'soutenance_id': existing_jury.soutenance_id,
                    'existing_time': existing_jury.soutenance.heure_debut.strftime('%H:%M'),
                    'existing_duree': existing_jury.soutenance.duree_minutes
                })

        return conflicts

    @staticmethod
    def schedule_soutenances_for_filiere(
            filiere: str,
            date_soutenance: date,
            start_time: time = time(8, 30),
            end_time: time = time(18, 30),
            duree_minutes: int = 15
    ):
        try:
            # =============================
            # 1️⃣ Étudiants
            # =============================
            students = Student.query.filter_by(filiere=filiere).all()
            if not students:
                return False, f"Aucun étudiant trouvé pour la filière {filiere}", []

            total_students = len(students)
            created_soutenances = []

            # =============================
            # 2️⃣ Salle unique
            # =============================
            salles = Salle.query.all()
            if not salles:
                return False, "Aucune salle disponible", []
            salle = random.choice(salles)

            # =============================
            # 3️⃣ Enseignants ET Jurys disponibles ce jour
            # =============================
            # Récupérer les IDs des enseignants/jurys déjà occupés à n'importe quelle heure ce jour-là
            busy_teachers_today = SoutenanceService.get_busy_teachers_for_date(date_soutenance)

            # Filtrer pour n'avoir que les enseignants/jurys qui ne sont pas occupés du tout ce jour
            available_teachers = User.query.filter(
                User.role.in_(['teacher', 'jury']),
                ~User.id.in_(busy_teachers_today)
            ).all()

            if len(available_teachers) < 6:
                # Deuxième tentative : chercher ceux qui ne sont pas occupés aux créneaux spécifiques
                # On va procéder créneau par créneau
                current_time = start_time
                jury_by_slot = {}

                # Pour chaque créneau, trouver des enseignants/jurys disponibles
                while current_time < end_time:
                    # Pause déjeuner
                    if time(12, 30) < current_time < time(14, 30):
                        current_time = time(14, 30)
                        continue

                    # Chercher des enseignants/jurys disponibles à ce créneau précis
                    busy_at_this_time = SoutenanceService.get_busy_teachers(date_soutenance, current_time)
                    available_at_this_time = [
                        t for t in User.query.filter(User.role.in_(['teacher', 'jury'])).all()
                        if t.id not in busy_at_this_time
                    ]

                    if len(available_at_this_time) >= 3:
                        jury_by_slot[current_time] = random.sample(available_at_this_time, 3)

                    # Avancer au prochain créneau
                    current_datetime = datetime.combine(date_soutenance, current_time) + timedelta(
                        minutes=duree_minutes)
                    current_time = current_datetime.time()

                if not jury_by_slot:
                    return False, "Pas assez d'enseignants/jurys disponibles pour la journée", []

            # =============================
            # 4️⃣ Jurys - approche flexible
            # =============================
            roles = ['president', 'member', 'member']

            # Si on a assez d'enseignants/jurys pour toute la journée
            if len(available_teachers) >= 6:
                jury_morning = random.sample(available_teachers, 3)
                remaining_teachers = [
                    t for t in available_teachers if t.id not in {j.id for j in jury_morning}
                ]
                jury_afternoon = random.sample(remaining_teachers, 3)
            else:
                # Utiliser l'approche par créneau
                pass  # À implémenter selon votre logique

            # =============================
            # 5️⃣ Créneaux
            # =============================
            morning_end = time(12, 30)
            afternoon_start = time(14, 30)

            current_datetime = datetime.combine(date_soutenance, start_time)
            current_time = current_datetime.time()

            student_index = 0

            # =============================
            # 6️⃣ Boucle principale
            # =============================
            while student_index < total_students:
                if current_time > end_time:
                    break

                # Pause déjeuner
                if morning_end < current_time < afternoon_start:
                    current_datetime = datetime.combine(date_soutenance, afternoon_start)
                    current_time = current_datetime.time()

                student = students[student_index]

                # Étudiant déjà planifié
                exists = Soutenance.query.filter_by(
                    student_id=student.user_id,
                    date_soutenance=date_soutenance
                ).first()

                if exists:
                    student_index += 1
                    continue

                # Vérifier la disponibilité des enseignants/jurys à ce créneau précis
                busy_at_this_time = SoutenanceService.get_busy_teachers(date_soutenance, current_time)

                # Chercher des enseignants/jurys disponibles à ce créneau
                available_now = [
                    t for t in User.query.filter(User.role.in_(['teacher', 'jury'])).all()
                    if t.id not in busy_at_this_time
                ]

                if len(available_now) < 3:
                    # Chercher un autre créneau
                    current_datetime += timedelta(minutes=duree_minutes)
                    current_time = current_datetime.time()
                    continue

                # Sélectionner 3 enseignants/jurys disponibles
                jury_members = random.sample(available_now, 3)

                # =============================
                # 7️⃣ Création soutenance
                # =============================
                soutenance = Soutenance(
                    student_id=student.user_id,
                    date_soutenance=date_soutenance,
                    heure_debut=current_time,
                    duree_minutes=duree_minutes,
                    salle_id=salle.id,
                    statut='planned'
                )
                db.session.add(soutenance)
                db.session.flush()

                for teacher, role in zip(jury_members, roles):
                    db.session.add(Jury(
                        soutenance_id=soutenance.id,
                        teacher_id=teacher.id,
                        role=role
                    ))

                created_soutenances.append({
                    'id': soutenance.id,
                    'student': {
                        'id': student.user_id,
                        'name': f"{student.user.prenom} {student.user.name}",
                        'cne': student.cne,
                        'filiere': student.filiere
                    },
                    'heure_debut': current_time.strftime('%H:%M'),
                    'salle': salle.name,
                    'salle_id': salle.id,
                    'teachers': [
                        {'id': t.id, 'name': f"{t.prenom} {t.name}", 'role': r, 'user_role': t.role}
                        for t, r in zip(jury_members, roles)
                    ],
                    'statut': 'planned'
                })

                current_datetime += timedelta(minutes=duree_minutes)
                current_time = current_datetime.time()
                student_index += 1

            db.session.commit()
            SoutenanceService.update_teacher_roles()
            return True, (
                f"{len(created_soutenances)} soutenances créées "
                f"pour {filiere} le {date_soutenance}"
            ), created_soutenances

        except Exception as e:
            db.session.rollback()
            current_app.logger.error(traceback.format_exc())
            return False, str(e), []

    @staticmethod
    def get_students_by_filiere(filiere: str, date_soutenance=None):
        students = Student.query.filter_by(filiere=filiere).all()
        result = []

        for student in students:
            soutenance = None
            if date_soutenance:
                soutenance = Soutenance.query.filter(
                    Soutenance.student_id == student.user_id,
                    Soutenance.date_soutenance == date_soutenance
                ).first()

            result.append({
                'id': student.user_id,
                'name': f"{student.user.prenom} {student.user.name}",
                'cne': student.cne,
                'filiere': student.filiere,
                'niveau': student.niveau,
                'has_soutenance': soutenance is not None,
                'soutenance_heure': soutenance.heure_debut.strftime('%H:%M') if soutenance else None,
                'soutenance_salle': soutenance.salle.name if soutenance and soutenance.salle else None
            })

        return result

    @staticmethod
    def get_soutenances_by_date_and_filiere(date_soutenance, filiere=None):
        query = db.session.query(Soutenance).join(Student).join(User).outerjoin(Salle)

        query = query.filter(Soutenance.date_soutenance == date_soutenance)

        if filiere:
            query = query.filter(Student.filiere == filiere)

        # Trier par heure pour une meilleure lisibilité
        soutenances = query.order_by(Soutenance.heure_debut).all()

        result = []

        for s in soutenances:
            result.append({
                'id': s.id,
                'heure_debut': s.heure_debut.strftime('%H:%M'),
                'salle': s.salle.name if s.salle else None,
                'salle_id': s.salle_id,
                'student': {
                    'id': s.student.user_id,
                    'name': f"{s.student.user.prenom} {s.student.user.name}",
                    'cne': s.student.cne,
                    'filiere': s.student.filiere
                },
                'teachers': [
                    {
                        'id': j.teacher.id,
                        'name': f"{j.teacher.prenom} {j.teacher.name}",
                        'role': j.role
                    }
                    for j in s.juries
                ],
                'statut': s.statut
            })

        return result

    @staticmethod
    def get_busy_teachers(date_soutenance, heure_debut=None):
        """
        Retourne les IDs des enseignants ET jurys déjà occupés
        """
        query = (
            db.session.query(Jury.teacher_id)
            .join(Soutenance)
            .filter(Soutenance.date_soutenance == date_soutenance)
        )

        if heure_debut:
            query = query.filter(Soutenance.heure_debut == heure_debut)

        busy = query.distinct().all()
        return {t[0] for t in busy}

    @staticmethod
    def get_busy_teachers_for_date(date_soutenance):
        busy = (
            db.session.query(Jury.teacher_id)
            .join(Soutenance)
            .filter(Soutenance.date_soutenance == date_soutenance)
            .distinct()
            .all()
        )
        return {t[0] for t in busy}

    @staticmethod
    def update_soutenances_status():
        """
        Met à jour le statut des soutenances :
        - 'done' si date_soutenance < aujourd'hui
        - conserve 'planned' ou 'cancelled' sinon
        """
        today = date.today()

        # Récupérer toutes les soutenances planifiées avec date passée
        soutenances_to_update = Soutenance.query.filter(
            Soutenance.statut == 'planned',
            Soutenance.date_soutenance < today
        ).all()

        for s in soutenances_to_update:
            s.statut = 'done'

        db.session.commit()
        return len(soutenances_to_update)

    @staticmethod
    def update_teacher_roles():
        """
        Met à jour les rôles automatiquement :
        - 'jury' si l'utilisateur a AU MOINS une soutenance future
        - 'teacher' si l'utilisateur n'a plus de soutenances futures
        """
        today = date.today()

        # IDs des enseignants avec au moins une soutenance future
        future_jury_ids = {
            t[0] for t in
            db.session.query(Jury.teacher_id)
            .join(Soutenance)
            .filter(Soutenance.date_soutenance >= today)
            .distinct()
            .all()
        }

        teachers = User.query.filter(User.role.in_(['teacher', 'jury'])).all()

        updated_to_jury = 0
        updated_to_teacher = 0

        for teacher in teachers:
            if teacher.id in future_jury_ids:
                if teacher.role != 'jury':
                    teacher.role = 'jury'
                    updated_to_jury += 1
            else:
                # Vérifier s'il a des soutenances passées
                past_juries = Jury.query.join(Soutenance).filter(
                    Jury.teacher_id == teacher.id,
                    Soutenance.date_soutenance < today
                ).count()

                if past_juries > 0 and teacher.role != 'teacher':
                    # Garder 'jury' s'il a des soutenances passées (pour l'historique)
                    pass
                elif teacher.role != 'teacher':
                    teacher.role = 'teacher'
                    updated_to_teacher += 1

        db.session.commit()

        return {
            "updated_to_jury": updated_to_jury,
            "updated_to_teacher": updated_to_teacher,
            "total_future_jurys": len(future_jury_ids)
        }


