from flask import Blueprint, request, jsonify
from models import db
from models.product_view import ProductView  

analytics_bp = Blueprint("analytics", __name__)


@analytics_bp.route("/track-view", methods=["POST"])
def track_view():
    data = request.get_json()

    product_id = data.get("product_id")
    user_id = data.get("user_id")

    if not product_id:
        return jsonify({"error": "product_id requis"}), 400

    view = ProductView(
        product_id=product_id,
        user_id=user_id
    )

    db.session.add(view)
    db.session.commit()

    return jsonify({"message": "View enregistrée ✅"})