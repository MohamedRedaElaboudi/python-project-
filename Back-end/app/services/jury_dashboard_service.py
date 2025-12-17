from datetime import datetime
from sqlalchemy import func, case
from app.models import db, Jury, Soutenance, Rapport, Evaluation, EvaluationGrade, EvaluationCriterion
from app.extensions import db

def get_dashboard_stats(user_id):
    """
    Get KPIs for the jury dashboard:
    - Total assigned reports
    - Pending evaluations
    - Completed evaluations
    - Average grade given
    """
    # Get all reports assigned to this jury member
    assigned_query = db.session.query(Rapport).join(
        Soutenance, Soutenance.rapport_id == Rapport.id
    ).join(
        Jury, Jury.soutenance_id == Soutenance.id
    ).filter(
        Jury.teacher_id == user_id
    )

    total_assigned = assigned_query.count()

    # Get evaluation stats
    evaluations_query = db.session.query(Evaluation).filter(Evaluation.jury_id == user_id)
    
    completed_evaluations = evaluations_query.filter(Evaluation.statut == 'completed').count()
    # Pending is Total Assigned - Completed (since one evaluation per report per jury)
    # However, evaluation record might not exist yet if not started. 
    # So Pending = Total Assigned - Completed is a safe bet, or count explicitly.
    pending_evaluations = total_assigned - completed_evaluations
    
    # Calculate average grade
    avg_grade = evaluations_query.filter(
        Evaluation.statut == 'completed',
        Evaluation.final_note.isnot(None)
    ).with_entities(func.avg(Evaluation.final_note)).scalar()
    
    avg_grade = round(float(avg_grade), 2) if avg_grade else 0.0

    return {
        "total_assigned": total_assigned,
        "pending": pending_evaluations,
        "evaluated": completed_evaluations,
        "avg_grade": avg_grade
    }

def get_upcoming_soutenances(user_id):
    """
    Get upcoming soutenances for the jury member.
    """
    now = datetime.now()
    soutenances = db.session.query(Soutenance).join(
        Jury, Jury.soutenance_id == Soutenance.id
    ).filter(
        Jury.teacher_id == user_id,
        Soutenance.date_soutenance >= now.date(),
        Soutenance.statut == 'planned'
    ).order_by(Soutenance.date_soutenance, Soutenance.heure_debut).limit(5).all()

    results = []
    for s in soutenances:
        # Check if today is the day and time has passed, if so skip? 
        # But 'planned' status should handle it.
        
        # Get student info safely
        student_name = "N/A"
        filiere = "N/A"
        if s.etudiant:
            student_name = f"{s.etudiant.prenom} {s.etudiant.name}"
            # Try to get filiere from student profile
            if s.etudiant.student_profile:
                filiere = s.etudiant.student_profile.filiere

        results.append({
            "id": s.id,
            "title": s.rapport.titre if s.rapport else "Sans Rapport",
            "student": student_name,
            "filiere": filiere,
            "date": s.date_soutenance.isoformat(),
            "time": s.heure_debut.isoformat(),
            "salle": s.salle.name if s.salle else "N/A"
        })
    
    return results

def get_assigned_reports(user_id):
    """
    Get all reports assigned to the jury member with evaluation status.
    """
    # Determine the columns to select
    results = db.session.query(
        Rapport,
        Soutenance,
        Evaluation
    ).join(
        Soutenance, Soutenance.rapport_id == Rapport.id
    ).join(
        Jury, Jury.soutenance_id == Soutenance.id
    ).outerjoin(
        Evaluation, (Evaluation.rapport_id == Rapport.id) & (Evaluation.jury_id == user_id)
    ).filter(
        Jury.teacher_id == user_id
    ).order_by(Soutenance.date_soutenance.desc()).all()

    reports_data = []
    for rapport, soutenance, evaluation in results:
        student_name = "N/A"
        filiere = "N/A"
        niveau = "N/A"
        
        if soutenance.etudiant:
            student_name = f"{soutenance.etudiant.prenom} {soutenance.etudiant.name}"
            if soutenance.etudiant.student_profile:
                filiere = soutenance.etudiant.student_profile.filiere
                niveau = soutenance.etudiant.student_profile.niveau

        reports_data.append({
            "id": rapport.id,
            "title": rapport.titre,
            "student": student_name,
            "filiere": filiere,
            "niveau": niveau,
            "soutenance_date": soutenance.date_soutenance.isoformat(),
            "soutenance_status": soutenance.statut,
            "evaluation_status": evaluation.statut if evaluation else "pending",
            "note": float(evaluation.final_note) if evaluation and evaluation.final_note else None,
            "soutenance_id": soutenance.id
        })
        
    return reports_data

def get_evaluation_details(user_id, rapport_id):
    """
    Get detailed evaluation data including criteria grades.
    If evaluation doesn't exist, create a pending one.
    """
    evaluation = Evaluation.query.filter_by(
        rapport_id=rapport_id,
        jury_id=user_id
    ).first()

    if not evaluation:
        # Verify assignment first
        is_assigned = db.session.query(Jury).join(Soutenance).filter(
            Jury.teacher_id == user_id,
            Soutenance.rapport_id == rapport_id
        ).first() is not None

        if not is_assigned:
            return None, "Report not assigned to this user"

        # Create pending evaluation
        evaluation = Evaluation(
            rapport_id=rapport_id,
            jury_id=user_id,
            statut='pending'
        )
        db.session.add(evaluation)
        db.session.commit()

    # Get all criteria
    criteria = EvaluationCriterion.query.all()
    
    # Get existing grades mapped by criterion_id
    grades = {g.criterion_id: g for g in evaluation.grades}
    
    criteria_data = []
    for c in criteria:
        grade = grades.get(c.id)
        criteria_data.append({
            "id": c.id,
            "name": c.name,
            "description": c.description,
            "max": c.max_score,
            "score": float(grade.score) if grade and grade.score is not None else 0,
            "comment": grade.comment if grade else ""
        })
    
    # Determine soutenance_id safely
    soutenance = None
    if evaluation.rapport:
        # Check if backref is list or scalar
        rels = evaluation.rapport.soutenance
        if isinstance(rels, list):
             soutenance = rels[0] if rels else None
        else:
             soutenance = rels

    return {
        "id": evaluation.id,
        "rapport_id": evaluation.rapport_id,
        "soutenance_id": soutenance.id if soutenance else None,
        "statut": evaluation.statut,
        "global_comment": evaluation.global_comment,
        "final_note": float(evaluation.final_note) if evaluation.final_note else None,
        "criteria": criteria_data
    }, None

def save_evaluation(user_id, data):
    """
    Save or update evaluation.
    data format:
    {
        "evaluation_id": 1,
        "global_comment": "...",
        "grades": [
            {"criterion_id": 1, "score": 15, "comment": "Good"},
            ...
        ],
        "submit": true/false # if true, mark as completed
    }
    """
    evaluation_id = data.get("evaluation_id")
    evaluation = Evaluation.query.filter_by(id=evaluation_id, jury_id=user_id).first()
    
    if not evaluation:
        return None, "Evaluation not found"

    # Update global fields
    if "global_comment" in data:
        evaluation.global_comment = data["global_comment"]
    
    # Update grades
    total_score = 0
    total_max = 0
    
    criteria_map = {c.id: c.max_score for c in EvaluationCriterion.query.all()}
    
    for item in data.get("grades", []):
        c_id = item["criterion_id"]
        score = item["score"]
        comment = item.get("comment", "")
        
        if c_id not in criteria_map:
            continue
            
        grade = EvaluationGrade.query.filter_by(
            evaluation_id=evaluation.id,
            criterion_id=c_id
        ).first()
        
        if not grade:
            grade = EvaluationGrade(
                evaluation_id=evaluation.id,
                criterion_id=c_id
            )
            db.session.add(grade)
        
        grade.score = score
        grade.comment = comment
        
        # For auto-calculation (simple sum for now, or weighted average?)
        # Assuming sum of scores is the final note, scaled to 20? 
        # Let's assume the criteria max scores sum up to 20.
        total_score += float(score)
        total_max += criteria_map[c_id]
        
    # Auto-calculate final note
    # If total_max is 20, just use total_score. 
    # If total_max != 20, normalize? 
    # Let's assume simple sum for now as per "Note finale automatique"
    evaluation.final_note = total_score 

    if data.get("submit"):
        evaluation.statut = 'completed'
    
    db.session.commit()
    
    return evaluation, None
