from flask import Blueprint, request, jsonify
from models import db
from models.panier import Panier
from models.product import Product

panier_bp = Blueprint("panier", __name__)

# =========================
# ADD TO PANIER
# =========================
@panier_bp.route("/panier", methods=["POST"])
def add_to_panier():
    data = request.json

    user_id = data["user_id"]
    product_id = data["product_id"]

    product = Product.query.get(product_id)

    if not product:
        return jsonify({"error": "Produit introuvable"}), 404

    existing = Panier.query.filter_by(
        user_id=user_id,
        product_id=product_id
    ).first()

    if existing:
        existing.quantity += 1
    else:
        new_item = Panier(
            user_id=user_id,
            product_id=product_id,
            product_name=product.name,
            category=product.category,
            quantity=1
        )
        db.session.add(new_item)

    db.session.commit()

    return jsonify({"message": "Produit ajouté"})


# =========================
# GET PANIER
# =========================
@panier_bp.route("/panier/<int:user_id>", methods=["GET"])
def get_panier(user_id):
    items = Panier.query.filter_by(user_id=user_id).all()

    result = []
    for item in items:
        product = Product.query.get(item.product_id)

        result.append({
            "id": item.product_id,
            "name": item.product_name,
            "category": item.category,
            "price": product.price if product else 0,
            "quantity": item.quantity
        })

    return jsonify(result)


# =========================
# UPDATE QUANTITY
# =========================
@panier_bp.route("/panier/update", methods=["PUT"])
def update_panier():
    data = request.json

    item = Panier.query.filter_by(
        user_id=data["user_id"],
        product_id=data["product_id"]
    ).first()

    if not item:
        return jsonify({"error": "Produit introuvable"}), 404

    if data["action"] == "increase":
        item.quantity += 1

    elif data["action"] == "decrease":
        item.quantity -= 1
        if item.quantity <= 0:
            db.session.delete(item)

    db.session.commit()

    return jsonify({"message": "Quantité mise à jour"})


# =========================
# DELETE PRODUCT
# =========================
@panier_bp.route("/panier", methods=["DELETE"])
def remove_from_panier():
    data = request.json

    item = Panier.query.filter_by(
        user_id=data["user_id"],
        product_id=data["product_id"]
    ).first()

    if item:
        db.session.delete(item)
        db.session.commit()

    return jsonify({"message": "Produit supprimé"})