from . import db
from datetime import datetime

class Panier(db.Model):
    id = db.Column(db.Integer, primary_key=True)

    user_id = db.Column(db.Integer, nullable=False)
    product_id = db.Column(db.Integer, nullable=False)

    product_name = db.Column(db.String(100))
    category = db.Column(db.String(50))

    quantity = db.Column(db.Integer, default=1)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)