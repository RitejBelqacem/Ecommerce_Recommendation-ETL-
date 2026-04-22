from flask import Blueprint, request, jsonify
from models import db
from models.commande import Commande

commande_bp = Blueprint("commande", __name__)

@commande_bp.route("/commande", methods=["POST"])
def create_commande():
    data = request.json

    new_cmd = Commande(
        user_id=data["user_id"],
        nom=data["nom"],
        prenom=data["prenom"],
        phone=data["phone"],
        address=data["address"],
        total=data["total"]
    )

    db.session.add(new_cmd)
    db.session.commit()

    return jsonify({"message": "Commande créée avec succès"})