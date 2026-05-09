from models.favoris import Favoris
from models.panier import Panier
from models.product import Product
from sqlalchemy import func
from extensions import db  # ou wherever tu init db

def get_recommendations_for_user(user_id, limit=10):
    """
    Recommande des produits basés sur favoris + panier de l'user
    et des users similaires.
    """

    # ── 1. Produits déjà vus par l'user (à exclure) ──────────────────
    user_favoris_ids = {
        f.product_id for f in Favoris.query.filter_by(user_id=user_id).all()
    }
    user_panier_ids = {
        p.product_id for p in Panier.query.filter_by(user_id=user_id).all()
    }
    already_seen = user_favoris_ids | user_panier_ids

    if not already_seen:
        # Cold start : retourner les produits les plus populaires
        return get_popular_products(limit, exclude_ids=set())

    # ── 2. Trouver users similaires (même favoris ou panier) ─────────
    similar_users_favoris = db.session.query(Favoris.user_id).filter(
        Favoris.product_id.in_(already_seen),
        Favoris.user_id != user_id
    ).distinct().all()

    similar_users_panier = db.session.query(Panier.user_id).filter(
        Panier.product_id.in_(already_seen),
        Panier.user_id != user_id
    ).distinct().all()

    similar_user_ids = {
        row.user_id for row in similar_users_favoris + similar_users_panier
    }

    if not similar_user_ids:
        return get_popular_products(limit, exclude_ids=already_seen)

    # ── 3. Produits que ces users similaires ont en favoris/panier ────
    recommended_from_favoris = db.session.query(
        Favoris.product_id,
        func.count(Favoris.user_id).label('score')
    ).filter(
        Favoris.user_id.in_(similar_user_ids),
        Favoris.product_id.notin_(already_seen)
    ).group_by(Favoris.product_id).all()

    recommended_from_panier = db.session.query(
        Panier.product_id,
        func.count(Panier.user_id).label('score')
    ).filter(
        Panier.user_id.in_(similar_user_ids),
        Panier.product_id.notin_(already_seen)
    ).group_by(Panier.product_id).all()

    # ── 4. Fusionner et scorer ────────────────────────────────────────
    scores = {}
    for row in recommended_from_favoris:
        scores[row.product_id] = scores.get(row.product_id, 0) + row.score * 1.5  # favoris = poids plus fort
    for row in recommended_from_panier:
        scores[row.product_id] = scores.get(row.product_id, 0) + row.score

    sorted_ids = sorted(scores, key=scores.get, reverse=True)[:limit]

    if not sorted_ids:
        return get_popular_products(limit, exclude_ids=already_seen)

    # ── 5. Charger les produits ───────────────────────────────────────
    products = Product.query.filter(Product.id.in_(sorted_ids)).all()
    # Réordonner selon le score
    product_map = {p.id: p for p in products}
    return [product_map[pid] for pid in sorted_ids if pid in product_map]


def get_popular_products(limit=10, exclude_ids=set()):
    """Fallback : produits les plus ajoutés en favoris + panier"""
    fav_scores = db.session.query(
        Favoris.product_id,
        func.count(Favoris.user_id).label('score')
    ).group_by(Favoris.product_id).all()

    panier_scores = db.session.query(
        Panier.product_id,
        func.count(Panier.user_id).label('score')
    ).group_by(Panier.product_id).all()

    scores = {}
    for row in fav_scores:
        if row.product_id not in exclude_ids:
            scores[row.product_id] = scores.get(row.product_id, 0) + row.score * 1.5
    for row in panier_scores:
        if row.product_id not in exclude_ids:
            scores[row.product_id] = scores.get(row.product_id, 0) + row.score

    sorted_ids = sorted(scores, key=scores.get, reverse=True)[:limit]
    products = Product.query.filter(Product.id.in_(sorted_ids)).all()
    product_map = {p.id: p for p in products}
    return [product_map[pid] for pid in sorted_ids if pid in product_map]