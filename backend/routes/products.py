from flask import Blueprint, jsonify, request
from models.product import Product
from models import db

products_bp = Blueprint("products", __name__)
@products_bp.route("/products", methods=["POST"])
def add_product():
    data = request.json

    name = data["name"]
    category = data["category"]
    price = data["price"]

    new_product = Product(
        name=name,
        category=category,
        price=price
    )

    db.session.add(new_product)
    db.session.commit()

    return jsonify({"message": "Product added"})

@products_bp.route("/products", methods=["GET"])
def get_products():
    products = Product.query.all()
    return jsonify([{
        "id": p.id,
        "name": p.name,
        "category": p.category,
        "price": p.price
        
    } for p in products])