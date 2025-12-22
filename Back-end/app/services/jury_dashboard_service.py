from datetime import datetime
import os
from sqlalchemy import func, case
from app.models import db, Jury, Soutenance, Rapport, Evaluation, EvaluationGrade, EvaluationCriterion
from app.extensions import db

def get_dashboard_stats(user_id):
    """
    Get dashboard statistics for a jury member.
    """
    print(f"\n{'='*60}")
    print(f"DEBUG: get_dashboard_stats called for user_id={user_id}")
    print(f"{'='*60}")
    
    # Get all evaluations for this jury member
    evaluations = Evaluation.query.filter_by(jury_id=user_id).all()
    print(f"DEBUG: Found {len(evaluations)} evaluations for jury #{user_id}")
    
    # Get all reports assigned through jury assignments
    juries = Jury.query.filter_by(teacher_id=user_id).all()
    print(f"DEBUG: Found {len(juries)} jury assignments for teacher #{user_id}")
    
    # Get unique rapport IDs via student_id (since soutenance.rapport_id is NULL)
    rapport_ids = set()
    for jury in juries:
        if jury.soutenance and jury.soutenance.student_id:
            # Find rapports for this student
            rapports = Rapport.query.filter_by(auteur_id=jury.soutenance.student_id).all()
            for rapport in rapports:
                rapport_ids.add(rapport.id)
    
    total_reports = len(rapport_ids)
    print(f"DEBUG: Total unique reports: {total_reports}")
    
    # Count evaluations by status
    pending = sum(1 for e in evaluations if e.statut == 'pending')
    completed = sum(1 for e in evaluations if e.statut == 'completed')
    print(f"DEBUG: Pending: {pending}, Completed: {completed}")
    
    # Calculate average grade
    grades = [e.final_note for e in evaluations if e.final_note is not None]
    avg_grade = sum(grades) / len(grades) if grades else None
    print(f"DEBUG: Grades: {grades}, Average: {avg_grade}")

    stats = {
        "total_reports": total_reports,
        "pending_evaluations": pending,
        "completed_evaluations": completed,
        "average_grade": avg_grade
    }
    
    print(f"DEBUG: Returning stats: {stats}")
    print(f"{'='*60}\n")
    return stats

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
        # Find rapport via student_id instead of direct link
        rapport = None
        if s.student_id:
            rapport = Rapport.query.filter_by(auteur_id=s.student_id).first()
        
        # Check if report file exists physically (if rapport found)
        if rapport and rapport.storage_path:
            file_path = os.path.join(os.getcwd(), rapport.storage_path)
            if not os.path.exists(file_path):
                rapport = None  # Mark as no rapport if file doesn't exist
        
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
            "title": rapport.titre if rapport else "Sans Rapport",
            "student": student_name,
            "filiere": filiere,
            "date": s.date_soutenance.isoformat(),
            "time": s.heure_debut.isoformat(),
            "salle": s.salle.name if s.salle else "N/A",
            "storage_path": rapport.storage_path if rapport else None,
            "filename": rapport.filename if rapport else None
        })
    
    return results

def get_assigned_reports(user_id):
    """
    Get all reports assigned to the jury member with evaluation status.
    """
    print(f"\n{'='*60}")
    print(f"DEBUG: get_assigned_reports called for user_id={user_id}")
    print(f"{'='*60}")
    
    # Modified query to join via student_id instead of rapport_id
    # since soutenances.rapport_id can be NULL
    results = db.session.query(
        Rapport,
        Soutenance,
        Evaluation
    ).join(
        Soutenance, Soutenance.student_id == Rapport.auteur_id
    ).join(
        Jury, Jury.soutenance_id == Soutenance.id
    ).outerjoin(
        Evaluation, (Evaluation.soutenance_id == Soutenance.id) & (Evaluation.jury_id == user_id)
    ).filter(
        Jury.teacher_id == user_id
    ).order_by(Soutenance.date_soutenance.desc()).all()

    print(f"DEBUG: Query returned {len(results)} results")

    reports_data = []
    seen_reports = set()
    for i, (rapport, soutenance, evaluation) in enumerate(results):
        print(f"\nDEBUG: Processing result #{i+1}")
        print(f"  - Rapport ID: {rapport.id}, Title: {rapport.titre}")
        print(f"  - Soutenance ID: {soutenance.id}, Student ID: {soutenance.student_id}")
        print(f"  - Evaluation: {evaluation.id if evaluation else 'None'}")
        
        # Check if report file exists
        # TEMPORARY: Commented out to show reports even if files don't exist
        # if not rapport.storage_path or not os.path.exists(rapport.storage_path):
        #     continue
            
        # Deduplication
        if rapport.id in seen_reports:
            print(f"  - SKIPPED: Duplicate rapport #{rapport.id}")
            continue
        seen_reports.add(rapport.id)

        student_name = "N/A"
        filiere = "N/A"
        niveau = "N/A"
        
        try:
            if soutenance.etudiant:
                student_name = f"{soutenance.etudiant.prenom} {soutenance.etudiant.name}"
                if soutenance.etudiant.student_profile:
                    filiere = soutenance.etudiant.student_profile.filiere
                    niveau = soutenance.etudiant.student_profile.niveau
                print(f"  - Student: {student_name}, Filiere: {filiere}, Niveau: {niveau}")
            else:
                print(f"  - WARNING: No student found for soutenance #{soutenance.id}")
        except Exception as e:
            print(f"  - ERROR getting student info: {e}")

        report_data = {
            "id": rapport.id,
            "title": rapport.titre,
            "student": student_name,
            "filiere": filiere,
            "niveau": niveau,
            "soutenance_date": soutenance.date_soutenance.isoformat(),
            "soutenance_status": soutenance.statut,
            "evaluation_status": evaluation.statut if evaluation else "pending",
            "note": float(evaluation.final_note) if evaluation and evaluation.final_note else None,
            "soutenance_id": soutenance.id,
            "storage_path": rapport.storage_path,
            "filename": rapport.filename
        }
        reports_data.append(report_data)
        print(f"  - ADDED to reports_data")
    
    print(f"\nDEBUG: Returning {len(reports_data)} reports")
    print(f"{'='*60}\n")
    return reports_data

def get_evaluation_details(user_id, rapport_id):
    """
    Get detailed evaluation data including criteria grades.
    If evaluation doesn't exist, create a pending one.
    """
    # First, get the rapport to find the student
    rapport = Rapport.query.get(rapport_id)
    if not rapport:
        return None, "Report not found"
    
    # Find the soutenance for this student
    soutenance = db.session.query(Soutenance).filter(
        Soutenance.student_id == rapport.auteur_id
    ).first()
    
    if not soutenance:
        return None, "No soutenance found for this report"
    
    # Check if this jury is assigned to this soutenance
    is_assigned = db.session.query(Jury).filter(
        Jury.teacher_id == user_id,
        Jury.soutenance_id == soutenance.id
    ).first() is not None
    
    if not is_assigned:
        return None, "Report not assigned to this user"
    
    # Get or create evaluation
    evaluation = Evaluation.query.filter_by(
        soutenance_id=soutenance.id,
        jury_id=user_id
    ).first()

    if not evaluation:
        # Create pending evaluation
        evaluation = Evaluation(
            soutenance_id=soutenance.id,
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
    
    return {
        "id": evaluation.id,
        "rapport_id": rapport_id,
        "soutenance_id": evaluation.soutenance_id,
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
