from flask import Blueprint



plagiat_bp = Blueprint('plagiat', __name__, url_prefix='/api/plagiat')



from . import plagiat_analysis

from . import plagiat_dashboard
from . import plagiat_overview





