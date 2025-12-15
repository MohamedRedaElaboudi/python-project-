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
        Récupère les enseignants disponibles pour un créneau donné
        """
        # Calculer l'heure de fin
        heure_fin = (datetime.combine(date.today(), heure_debut) +
                     timedelta(minutes=duree_minutes)).time()

        # Récupérer tous les enseignants
        all_teachers = User.query.filter_by(role='teacher').all()

        available_teachers = []
        for teacher in all_teachers:
            # Vérifier si le professeur est déjà occupé pendant ce créneau
            conflict = Jury.query.join(Soutenance).filter(
                Jury.teacher_id == teacher.id,
                Soutenance.date_soutenance == date_soutenance,
                or_(
                    # Créneau qui chevauche le début
                    and_(
                        Soutenance.heure_debut <= heure_debut,
                        Soutenance.heure_debut >= heure_fin
                    ),
                    # Créneau qui chevauche la fin
                    and_(
                        Soutenance.heure_debut <= heure_fin,
                        Soutenance.heure_debut >= heure_debut
                    ),
                    # Créneau qui contient complètement
                    and_(
                        Soutenance.heure_debut <= heure_debut,
                        (datetime.combine(date.today(), Soutenance.heure_debut) +
                         timedelta(minutes=Soutenance.duree_minutes)).time() >= heure_fin
                    )
                )
            ).first()

            if not conflict:
                available_teachers.append(teacher)

        return available_teachers

    @staticmethod
    def check_teacher_conflicts(date_soutenance: date, heure_debut: time, duree_minutes: int, teacher_ids: List[int]):
        """
        Vérifie si des enseignants ont des conflits d'horaire
        """
        heure_fin = (datetime.combine(date.today(), heure_debut) +
                     timedelta(minutes=duree_minutes)).time()

        conflicts = []
        for teacher_id in teacher_ids:
            # Vérifier si le professeur a déjà une soutenance pendant ce créneau
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
                conflicts.append(teacher_id)

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
            # 3️⃣ Enseignants disponibles ce jour
            # =============================
            busy_teachers = (
                db.session.query(Jury.teacher_id)
                .join(Soutenance)
                .filter(Soutenance.date_soutenance == date_soutenance)
                .distinct()
                .all()
            )
            busy_ids = {t[0] for t in busy_teachers}

            available_teachers = User.query.filter(
                User.role == 'teacher',
                ~User.id.in_(busy_ids)
            ).all()

            if len(available_teachers) < 6:
                return False, "Pas assez d'enseignants disponibles pour la journée", []

            # =============================
            # 4️⃣ Jurys FIXES
            # =============================
            roles = ['president', 'member', 'member']

            jury_morning = random.sample(available_teachers, 3)
            remaining_teachers = [
                t for t in available_teachers if t.id not in {j.id for j in jury_morning}
            ]
            jury_afternoon = random.sample(remaining_teachers, 3)

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

                # Choisir le jury selon la période
                jury_members = (
                    jury_morning if current_time < morning_end else jury_afternoon
                )

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
                        {'id': t.id, 'name': f"{t.prenom} {t.name}", 'role': r}
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
    def get_busy_teachers(date_soutenance, heure_debut):
        """Retourne les IDs des enseignants déjà occupés à ce créneau"""
        busy = (
            db.session.query(Jury.teacher_id)
            .join(Soutenance)
            .filter(
                Soutenance.date_soutenance == date_soutenance,
                Soutenance.heure_debut == heure_debut
            )
            .distinct()
            .all()
        )
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
        Un enseignant est 'jury' UNIQUEMENT s'il est affecté
        à AU MOINS une soutenance existante
        """

        teachers = User.query.filter(User.role.in_(['teacher', 'jury'])).all()

        active_jury_ids = {
            t[0] for t in
            db.session.query(Jury.teacher_id)
            .join(Soutenance)
            .all()
        }

        updated_to_jury = 0
        updated_to_teacher = 0

        for teacher in teachers:
            if teacher.id in active_jury_ids:
                if teacher.role != 'jury':
                    teacher.role = 'jury'
                    updated_to_jury += 1
            else:
                if teacher.role != 'teacher':
                    teacher.role = 'teacher'
                    updated_to_teacher += 1

        db.session.commit()

        return {
            "updated_to_jury": updated_to_jury,
            "updated_to_teacher": updated_to_teacher
        }


