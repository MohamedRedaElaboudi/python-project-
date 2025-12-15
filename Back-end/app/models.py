from .extensions import db
from datetime import datetime

class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    prenom = db.Column(db.String(100))
    email = db.Column(db.String(200), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(
        db.Enum('student', 'teacher', 'jury', 'admin'),
        nullable=False
    )

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # 🔗 relation 1–1 avec Student
    student_profile = db.relationship(
        "Student",
        back_populates="user",
        uselist=False,
        cascade="all, delete"
    )
class Report(db.Model):
    __tablename__ = "rapports"

    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    filename = db.Column(db.String(200), nullable=False)
    path = db.Column(db.String(300), nullable=False)
    status = db.Column(db.String(20), default="pending")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    student = db.relationship("User", backref="reports")


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

    user = db.relationship(
        "User",
        back_populates="student_profile"
    )
class Salle(db.Model):
    __tablename__ = "salles"

    id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    name = db.Column(db.String(150), nullable=False)

    def __repr__(self):
        return f"<Salle {self.name}>"

class Jury(db.Model):
    __tablename__ = "juries"

    id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    soutenance_id = db.Column(
        db.BigInteger,
        db.ForeignKey("soutenances.id", ondelete="CASCADE"),
        nullable=False
    )
    teacher_id = db.Column(
        db.BigInteger,
        db.ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False
    )

    role = db.Column(db.Enum("president", "member", "supervisor"), default="member")

    soutenance = db.relationship(
        "Soutenance",
        back_populates="juries"
    )

    teacher = db.relationship("User", backref="jury_assignments")


class Soutenance(db.Model):
    __tablename__ = "soutenances"

    id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    student_id = db.Column(
        db.BigInteger,
        db.ForeignKey("students.user_id", ondelete="CASCADE"),
        nullable=False
    )
    salle_id = db.Column(
        db.BigInteger,
        db.ForeignKey("salles.id"),
        nullable=True
    )

    date_soutenance = db.Column(db.Date, nullable=False)
    heure_debut = db.Column(db.Time, nullable=False)
    duree_minutes = db.Column(db.Integer, default=15)

    statut = db.Column(
        db.Enum("planned", "done", "cancelled"),
        default="planned"
    )

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relations ORM
    salle = db.relationship("Salle", backref="soutenances")
    student = db.relationship("Student", backref="soutenances")

    # 🔗 relation avec Jury (OBLIGATOIRE)
    juries = db.relationship(
        "Jury",
        back_populates="soutenance",
        cascade="all, delete-orphan"
    )

    # ✅ ICI EXACTEMENT
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
