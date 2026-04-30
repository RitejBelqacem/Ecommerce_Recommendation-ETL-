from . import db
from datetime import datetime


class ProductView(db.Model):
    __tablename__ = "product_view"

    id = db.Column(db.Integer, primary_key=True)

    # Relations
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=True)
    product_id = db.Column(db.Integer, db.ForeignKey("product.id"), nullable=False)

    # Tracking
    viewed_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        nullable=False
    )

    # Infos optionnelles utiles pour analytics
    session_id = db.Column(db.String(100), nullable=True)
    source = db.Column(db.String(50))  # ex: "home", "search", "recommendation"
#pour KPI
    device = db.Column(db.String(50))  
    country = db.Column(db.String(50))