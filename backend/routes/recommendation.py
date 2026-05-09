from flask import Blueprint, jsonify
from models import db
from models.favoris import Favoris
from models.panier import Panier
from models.product import Product
from sqlalchemy import func

recommend_bp = Blueprint('recommendation', __name__)

@recommend_bp.route('/recommendations/<int:user_id>', methods=['GET'])
def get_recommendations(user_id):

    # 1. Produits déjà en favoris/panier de l'user
    user_favs = Favoris.query.filter_by(user_id=user_id).all()
    user_pans = Panier.query.filter_by(user_id=user_id).all()

    user_fav_ids = {f.product_id for f in user_favs}
    user_pan_ids = {p.product_id for p in user_pans}
    already_seen = user_fav_ids | user_pan_ids

    # ── Aucun favoris ni panier → retourner liste vide ──────────────
    if not already_seen:
        return jsonify([])  # ← RIEN pour les nouveaux users

    # 2. Trouver les catégories des produits en favoris/panier
    user_products = Product.query.filter(Product.id.in_(already_seen)).all()
    user_categories = {p.category for p in user_products if p.category}

    if not user_categories:
        return jsonify([])

    # 3. Recommander des produits de la même catégorie (pas encore vus)
    recommended = Product.query.filter(
        Product.category.in_(user_categories),
        Product.id.notin_(already_seen)
    ).limit(10).all()

    if not recommended:
        return jsonify([])

    return jsonify([serialize(p) for p in recommended])


def serialize(p):
    return {
        'id': p.id,
        'name': p.name,
        'price': p.price,
        'category': p.category,
    }