from flask import Blueprint, request, jsonify
from models import db
from models.favoris import Favoris
from models.product import Product

favoris_bp = Blueprint("favoris", __name__)

# =========================
# ADD / REMOVE FAVORIS (TOGGLE)
# =========================
@favoris_bp.route("/favoris", methods=["POST"])
def toggle_favoris():
    data = request.json

    user_id = data["user_id"]
    product_id = data["product_id"]

    existing = Favoris.query.filter_by(
        user_id=user_id,
        product_id=product_id
    ).first()

    if existing:
        db.session.delete(existing)
        db.session.commit()
        return jsonify({"message": "Retiré des favoris"})

    product = Product.query.get(product_id)

    new_fav = Favoris(
        user_id=user_id,
        product_id=product_id,
        product_name=product.name,
        category=product.category
    )

    db.session.add(new_fav)
    db.session.commit()

    return jsonify({"message": "Ajouté aux favoris"})


# =========================
# GET FAVORIS
# =========================
@favoris_bp.route("/favoris/<int:user_id>", methods=["GET"])
def get_favoris(user_id):
    items = Favoris.query.filter_by(user_id=user_id).all()

    result = []
    for item in items:
        product = Product.query.get(item.product_id)

        result.append({
            "id": item.product_id,
            "name": item.product_name,
            "category": item.category,
            "price": product.price if product else 0
        })

    return jsonify(result)