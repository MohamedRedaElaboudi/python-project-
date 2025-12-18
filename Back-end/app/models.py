from datetime import datetime, time
from .extensions import db
from sqlalchemy import event
from datetime import date


class Salle(db.Model):
    __tablename__ = 'salles'
    id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    name = db.Column(db.String(150), nullable=False)

    def __repr__(self):
        return f"<Salle {self.name}>"


class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    prenom = db.Column(db.String(150), nullable=False)
    name = db.Column(db.String(150), nullable=False)
    email = db.Column(db.String(200), nullable=False, unique=True)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(
        db.Enum('student', 'teacher', 'jury', 'admin', 'chef'),
        nullable=False
    )
    created_at = db.Column(db.DateTime, server_default=db.func.current_timestamp())
    updated_at = db.Column(db.DateTime, nullable=True)

    # Relation 1–1 avec Student
    student_profile = db.relationship(
        'Student',
        back_populates='user',
        uselist=False,
        cascade='all, delete-orphan'
    )





class Soutenance(db.Model):
    __tablename__ = 'soutenances'

    id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)

    # Champs directs
    student_id = db.Column(
        db.BigInteger,
        db.ForeignKey('students.user_id', ondelete='CASCADE'),
        nullable=False
    )
    salle_id = db.Column(
        db.BigInteger,
        db.ForeignKey('salles.id'),
        nullable=True
    )
    rapport_id = db.Column(db.Integer, db.ForeignKey('rapports.id'), nullable=True)
    rapport = db.relationship("Rapport", backref="soutenance", uselist=False)

    # Date et durée
    date_soutenance = db.Column(db.Date, nullable=False)
    heure_debut = db.Column(db.Time, nullable=False)
    duree_minutes = db.Column(db.Integer, default=15)

    # Statut
    statut = db.Column(
        db.Enum('planned', 'done', 'cancelled'),
        default='planned'
    )
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relations ORM
    salle = db.relationship('Salle', backref='soutenances')
    student = db.relationship('Student', backref='soutenances')

    juries = db.relationship(
        'Jury',
        back_populates='soutenance',
        cascade='all, delete-orphan'
    )

    # Propriété pour récupérer l'utilisateur étudiant
    @property
    def etudiant(self):
        return self.student.user if self.student else None

    # Méthode pour récupérer la soutenance en dictionnaire
    def to_dict(self):
        return {
            "id": self.id,
            "date_debut": f"{self.date_soutenance} {self.heure_debut}",
            "duree_minutes": self.duree_minutes,
            "statut": self.statut,
            "salle": self.salle.name if self.salle else None,
            "jury": [
                {
                    "id": j.teacher.id,
                    "nom": f"{j.teacher.prenom} {j.teacher.name}",
                    "role": j.role
                }
                for j in self.juries
            ]
        }

    def __repr__(self):
        return f"<Soutenance {self.id} - {self.statut}>"

class Rapport(db.Model):
    __tablename__ = "rapports"

    id = db.Column(db.Integer, primary_key=True)
    auteur_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    titre = db.Column(db.String(255), nullable=True)
    filename = db.Column(db.String(200), nullable=False)
    storage_path = db.Column(db.String(300), nullable=False)
    status = db.Column(db.String(20), default="pending")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    author = db.relationship("User", foreign_keys=[auteur_id])

    def to_dict(self):
        return {
            "id": self.id,
            "titre": self.titre,
            "filename": self.filename,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "storage_path": self.storage_path
        }

class Jury(db.Model):
    __tablename__ = 'juries'
    id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    soutenance_id = db.Column(db.BigInteger, db.ForeignKey('soutenances.id', ondelete='CASCADE'), nullable=False)
    teacher_id = db.Column(db.BigInteger, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    role = db.Column(db.Enum('president', 'member', 'supervisor'), default='member')

    # Relations
    # Relation inverse vers Soutenance
    soutenance = db.relationship(
        'Soutenance',
        back_populates='juries'
    )
    teacher = db.relationship('User', backref='jury_assignments')

# models.py
from sqlalchemy import event
from datetime import date

@event.listens_for(Soutenance, 'before_insert')
@event.listens_for(Soutenance, 'before_update')
def update_soutenance_status_before_save(mapper, connection, target):
    """
    Met à jour automatiquement le statut si la date est passée
    """
    if target.date_soutenance and target.date_soutenance < date.today():
        if target.statut == 'planned':
            target.statut = 'done'
            target.statut = 'done'
            target.statut = 'done'

"""Asmae"""
from .extensions import db




class Student(db.Model):
    __tablename__ = "students"

    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id", ondelete="CASCADE"),
        primary_key=True
    )

    cin = db.Column(db.String(20), nullable=False, unique=True)
    cne = db.Column(db.String(20), nullable=False, unique=True)
    tel = db.Column(db.String(20))
    filiere = db.Column(db.String(100))
    niveau = db.Column(db.String(50))


    # Relation inverse vers User
    user = db.relationship(
        "User",
        back_populates="student_profile"
    )

# --- JURY & EVALUATION EXTENSIONS ---

class Evaluation(db.Model):
    __tablename__ = 'evaluations'
    id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    rapport_id = db.Column(db.Integer, db.ForeignKey('rapports.id'), nullable=False)
    jury_id = db.Column(db.BigInteger, db.ForeignKey('users.id'), nullable=False)
    statut = db.Column(db.String(20), default='pending') # pending, completed
    final_note = db.Column(db.Float, nullable=True)
    global_comment = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    rapport = db.relationship('Rapport', backref='evaluations')
    jury = db.relationship('User', backref='evaluations_given')
    grades = db.relationship('EvaluationGrade', back_populates='evaluation', cascade='all, delete-orphan')

class EvaluationCriterion(db.Model):
    __tablename__ = 'evaluation_criteria'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    max_score = db.Column(db.Float, nullable=False)

class EvaluationGrade(db.Model):
    __tablename__ = 'evaluation_grades'
    id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    evaluation_id = db.Column(db.BigInteger, db.ForeignKey('evaluations.id'), nullable=False)
    criterion_id = db.Column(db.Integer, db.ForeignKey('evaluation_criteria.id'), nullable=False)
    score = db.Column(db.Float)
    comment = db.Column(db.Text)

    evaluation = db.relationship('Evaluation', back_populates='grades')
    criterion = db.relationship('EvaluationCriterion')

class PlagiatAnalysis(db.Model):
    __tablename__ = 'plagiat_analyses'
    id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    rapport_id = db.Column(db.Integer, db.ForeignKey('rapports.id'), nullable=False)
    similarity_score = db.Column(db.Float)
    status = db.Column(db.String(50), default='pending')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    matches = db.relationship('PlagiatMatch', back_populates='analysis', cascade='all, delete-orphan')

class PlagiatMatch(db.Model):
    __tablename__ = 'plagiat_matches'
    id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    analysis_id = db.Column(db.BigInteger, db.ForeignKey('plagiat_analyses.id'), nullable=False)
    source_url = db.Column(db.String(500))
    similarity = db.Column(db.Float)
    content_snippet = db.Column(db.Text)
    
    analysis = db.relationship('PlagiatAnalysis', back_populates='matches')





