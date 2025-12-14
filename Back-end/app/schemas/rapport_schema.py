from marshmallow import Schema, fields, validate

class UploadReportSchema(Schema):
    """Schema pour valider l'upload d'un rapport PDF."""
    # Le fichier lui-même sera vérifié côté route (request.files)
    filename = fields.String(required=True, validate=validate.Length(min=3))


class ReportStatusSchema(Schema):
    """Schema pour valider la récupération d'un statut."""
    status = fields.String(
        validate=validate.OneOf(["pending", "reviewing", "accepted", "rejected"])
    )


class ReportSchema(Schema):
    """Schema général pour un rapport."""
    id = fields.Int()
    student_id = fields.Int(required=True)
    filename = fields.Str(required=True)
    status = fields.Str(required=True)
    created_at = fields.DateTime()
