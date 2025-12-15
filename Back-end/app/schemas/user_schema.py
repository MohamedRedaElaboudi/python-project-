from marshmallow import Schema, fields, validate

class RegisterSchema(Schema):
    name = fields.String(required=True, validate=validate.Length(min=2))
    prenom = fields.String(required=True, validate=validate.Length(min=2))
    email = fields.Email(required=True)
    password = fields.String(required=True, validate=validate.Length(min=6))
    role = fields.String(required=True, validate=validate.OneOf(
        ["student", "teacher", "jury", "admin"]
    ))


class StudentRegisterSchema(Schema):  # 🔥 NE PAS hériter
    name = fields.String(required=True, validate=validate.Length(min=2))
    prenom = fields.String(required=True, validate=validate.Length(min=2))
    email = fields.Email(required=True)
    password = fields.String(required=True, validate=validate.Length(min=6))

    cin = fields.String(required=True)
    cne = fields.String(required=True)
    tel = fields.String(required=False)
    filiere = fields.String(required=True)
    niveau = fields.String(required=True)



class LoginSchema(Schema):
    email = fields.Email(required=True)
    password = fields.String(required=True)

class UploadReportSchema(Schema):
    pdf = fields.Raw(required=True)  # un fichier PDF
