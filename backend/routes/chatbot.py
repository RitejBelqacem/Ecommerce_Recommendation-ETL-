from flask import Blueprint, request, jsonify
from models.product import Product

chatbot_bp = Blueprint("chatbot", __name__)

@chatbot_bp.route("/chatbot", methods=["POST"])
def chatbot():
    msg = request.json["message"]

    if "cheap" in msg:
        products = Product.query.filter(Product.price < 50).all()
    else:
        return jsonify({"response": "Je ne comprends pas"})

    return jsonify([p.name for p in products])