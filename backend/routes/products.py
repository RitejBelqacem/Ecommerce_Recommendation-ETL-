from flask import Blueprint, jsonify, request
from models.product import Product
from models import db

products_bp = Blueprint("products", __name__)

# ---------------- GET ALL PRODUCTS ----------------
@products_bp.route("/products", methods=["GET"])
def get_products():
    products = Product.query.all()

    return jsonify([
        {
            "id": p.id,
            "name": p.name,
            "description": p.description,
            "category": p.category,
            "brand": p.brand,
            "price": p.price,
            "old_price": p.old_price,
            "stock": p.stock,
            "image": p.image
        }
        for p in products
    ])


# ---------------- ADD PRODUCT ----------------
@products_bp.route("/products", methods=["POST"])
def add_product():
    data = request.json

    new_product = Product(
        name=data.get("name"),
        description=data.get("description"),
        category=data.get("category"),
        brand=data.get("brand"),
        price=data.get("price"),
        old_price=data.get("old_price"),
        stock=data.get("stock", 0),
        image=data.get("image"),
        image_2=data.get("image_2"),
        image_3=data.get("image_3"),
        is_available=data.get("is_available", True),
        is_featured=data.get("is_featured", False)
    )

    db.session.add(new_product)
    db.session.commit()

    return jsonify({"message": "Product added"})


# ---------------- GET ONE PRODUCT ----------------
@products_bp.route("/products/<int:id>", methods=["GET"])
def get_product(id):
    product = Product.query.get(id)

    if not product:
        return jsonify({"error": "Produit introuvable"}), 404

    return jsonify({
        "id": product.id,
        "name": product.name,
        "description": product.description,
        "category": product.category,
        "brand": product.brand,
        "price": product.price,
        "old_price": product.old_price,
        "stock": product.stock,
        "image": product.image
    })


# ---------------- DELETE PRODUCT ----------------
@products_bp.route("/products/<int:id>", methods=["DELETE"])
def delete_product(id):
    product = Product.query.get(id)

    if not product:
        return jsonify({"error": "Produit introuvable"}), 404

    db.session.delete(product)
    db.session.commit()

    return jsonify({"message": "Produit supprimé"})


# ---------------- UPDATE PRODUCT ----------------
@products_bp.route("/products/<int:id>", methods=["PUT"])
def update_product(id):
    data = request.get_json()

    product = Product.query.get(id)

    if not product:
        return jsonify({"error": "Produit introuvable"}), 404

    product.name = data.get("name")
    product.description = data.get("description")
    product.category = data.get("category")
    product.brand = data.get("brand")
    product.price = data.get("price")
    product.old_price = data.get("old_price")
    product.stock = data.get("stock")
    product.image = data.get("image")

    db.session.commit()

    return jsonify({"message": "Produit mis à jour"})