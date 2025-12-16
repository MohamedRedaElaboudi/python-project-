from datetime import datetime, time
from .extensions import db


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

    # relation 1–1
    student = db.relationship(
        'Student',
        backref='user',
        uselist=False,
        cascade='all, delete'
    )


class Student(db.Model):
    __tablename__ = 'students'

    user_id = db.Column(
        db.BigInteger,
        db.ForeignKey('users.id', ondelete='CASCADE'),
        primary_key=True
    )
    cin = db.Column(db.String(20), nullable=False, unique=True)
    cne = db.Column(db.String(20), nullable=False, unique=True)
    tel = db.Column(db.String(20))
    filiere = db.Column(db.String(100), nullable=False)
    niveau = db.Column(db.String(50))


class Soutenance(db.Model):
    __tablename__ = 'soutenances'
    id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)

    # Champs directs
    student_id = db.Column(db.BigInteger, db.ForeignKey('students.user_id', ondelete='CASCADE'), nullable=False)
    salle_id = db.Column(db.BigInteger, db.ForeignKey('salles.id'), nullable=True)

    # Date et durée
    date_soutenance = db.Column(db.Date, nullable=False)  # Date seulement (sans heure)
    heure_debut = db.Column(db.Time, nullable=False)  # Heure de début
    duree_minutes = db.Column(db.Integer, default=15)

    # Statut
    statut = db.Column(db.Enum('planned', 'done', 'cancelled'), default='planned')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relations
    salle = db.relationship('Salle', backref='soutenances')
    student = db.relationship('Student', backref='soutenances')

    # Propriété pour récupérer l'utilisateur étudiant
    @property
    def etudiant(self):
        return self.student.user if self.student else None

    def __repr__(self):
        return f"<Soutenance {self.id} - {self.statut}>"

class Rapport(db.Model):
    __tablename__ = "rapports"

    id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    auteur_id = db.Column(db.BigInteger, db.ForeignKey("users.id"), nullable=False)
    filename = db.Column(db.String(200), nullable=False)
    storage_path = db.Column(db.String(300), nullable=False)
    status = db.Column(db.String(20), default="pending")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    author = db.relationship("User", foreign_keys=[auteur_id])

class Jury(db.Model):
    __tablename__ = 'juries'
    id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    soutenance_id = db.Column(db.BigInteger, db.ForeignKey('soutenances.id', ondelete='CASCADE'), nullable=False)
    teacher_id = db.Column(db.BigInteger, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    role = db.Column(db.Enum('president', 'member', 'supervisor'), default='member')

    # Relations
    soutenance = db.relationship('Soutenance', backref='juries')
    teacher = db.relationship('User', backref='jury_assignments')

##Plagiat
class PlagiatAnalysis(db.Model):
    __tablename__ = "plagiat_analyses"

    id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    rapport_id = db.Column(db.BigInteger, db.ForeignKey("rapports.id", ondelete='CASCADE'))
    similarity_score = db.Column(db.Float)
    originality_score = db.Column(db.Float)
    risk_level = db.Column(db.Enum("low", "medium", "high"))
    total_matches = db.Column(db.Integer)
    sources_count = db.Column(db.Integer)
    status = db.Column(db.Enum("pending", "completed"))
    analyzed_at = db.Column(db.DateTime)
    rapport = db.relationship("Rapport", backref="analyses")

    @property
    def jury_assigned(self):
        if not self.rapport or not self.rapport.author.student:
            return []

        jurys = []
        for soutenance in self.rapport.author.student.soutenances:
            for jury in soutenance.juries:
                if jury.teacher:
                    jurys.append(jury.teacher.name)
        return jurys

    warnings = db.Column(db.JSON, nullable=True)
    recommendations = db.Column(db.JSON, nullable=True)
    ai_score = db.Column(db.Float, nullable=True)
    chunks_analyzed = db.Column(db.Integer, nullable=True)
    chunks_with_matches = db.Column(db.Integer, nullable=True)

    matches = db.relationship(
        "PlagiatMatch",
        back_populates="analysis",
        cascade="all, delete-orphan"
    )


class PlagiatMatch(db.Model):
    __tablename__ = 'plagiat_matches'

    id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    analysis_id = db.Column(db.BigInteger, db.ForeignKey('plagiat_analyses.id'), nullable=False)

    text = db.Column(db.Text, nullable=False)
    source_url = db.Column(db.String(500))
    source = db.Column(db.String(50), nullable=True)
    score = db.Column(db.Float, nullable=True)
    similarity = db.Column(db.Float, nullable=True)
    url = db.Column(db.String(500), nullable=True)
    matched_text = db.Column(db.Text, nullable=True)
    original_text = db.Column(db.Text, nullable=True)
    x = db.Column(db.Float, nullable=True)
    y = db.Column(db.Float, nullable=True)
    width = db.Column(db.Float, nullable=True)
    height = db.Column(db.Float, nullable=True)
    page = db.Column(db.Integer)
    chunk_index = db.Column(db.Integer, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    analysis = db.relationship("PlagiatAnalysis", back_populates="matches")
######


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