from flask import Blueprint, jsonify
from models.product import Product

recommend_bp = Blueprint("recommend", __name__)

@recommend_bp.route("/recommend/<int:id>")
def recommend(id):
    product = Product.query.get(id)
    recs = Product.query.filter_by(category=product.category).all()

    return jsonify([p.name for p in recs])