from . import db
from datetime import datetime

class Product(db.Model):
    id = db.Column(db.Integer, primary_key=True)

    # Infos principales
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)

    # Classification
    category = db.Column(db.String(50))
    brand = db.Column(db.String(50))

    # Prix & stock
    price = db.Column(db.Float, nullable=False)
    old_price = db.Column(db.Float)  # pour promotions
    stock = db.Column(db.Integer, default=0)

    # Images
    image = db.Column(db.String(255))


    # Statut produit
    is_available = db.Column(db.Boolean, default=True)
    is_featured = db.Column(db.Boolean, default=False)

    # Tracking
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)