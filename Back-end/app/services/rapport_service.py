import os
from ..dao.rapport_dao import RapportDAO

UPLOAD_FOLDER = "uploads/reports"

class RapportService:

    @staticmethod
    def upload_pdf(student_id, file):
        if not os.path.exists(UPLOAD_FOLDER):
            os.makedirs(UPLOAD_FOLDER)

        filename = file.filename
        path = os.path.join(UPLOAD_FOLDER, filename)
        file.save(path)

        return RapportDAO.create(student_id, filename, path)

    @staticmethod
    def list_student_reports(student_id):
        return RapportDAO.get_by_student(student_id)

    @staticmethod
    def get_pdf_path(rapport_id):
        rapport = RapportDAO.get_by_id(rapport_id)
        return rapport["storage_path"] if rapport else None
