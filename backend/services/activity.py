from models import db
from sqlalchemy import text
from datetime import datetime


def get_recent_activity(limit=5):
    events = []

    # ─────────────────────────────
    # 1. Commandes récentes
    # ─────────────────────────────
    try:
        rows = db.session.execute(text("""
            SELECT c.id, c.total, c.statut, c.created_at, u.name
            FROM commande c
            LEFT JOIN user u ON c.user_id = u.id
            ORDER BY c.created_at DESC
            LIMIT :limit
        """), {"limit": limit}).fetchall()

        for r in rows:
            events.append({
                "type": "commande",
                "label": f"Commande #{r[0]} — {round(float(r[1] or 0), 2)} DT",
                "detail": r[4] or "Utilisateur inconnu",
                "statut": r[2] or "en_attente",
                "created_at": str(r[3]),
            })

    except Exception as e:
        print(f"[activity] commande error: {e}")

    # ─────────────────────────────
    # 2. Nouveaux utilisateurs
    # ─────────────────────────────
    try:
        rows = db.session.execute(text("""
            SELECT id, name, email, created_at
            FROM user
            ORDER BY created_at DESC
            LIMIT :limit
        """), {"limit": limit}).fetchall()

        for r in rows:
            events.append({
                "type": "user",
                "label": "Nouvel utilisateur inscrit",
                "detail": r[1] or r[2] or f"User #{r[0]}",
                "statut": "nouveau",
                "created_at": str(r[3]),
            })

    except Exception as e:
        print(f"[activity] user error: {e}")

    # ─────────────────────────────
    # 3. Produits ajoutés
    # ─────────────────────────────
    try:
        rows = db.session.execute(text("""
            SELECT id, name, category, created_at
            FROM product
            ORDER BY created_at DESC
            LIMIT :limit
        """), {"limit": limit}).fetchall()

        for r in rows:
            events.append({
                "type": "product",
                "label": f"Produit ajouté — {r[1]}",
                "detail": r[2] or "Sans catégorie",
                "statut": "ajout",
                "created_at": str(r[3]),
            })

    except Exception as e:
        print(f"[activity] product error: {e}")

    # ─────────────────────────────
    # 4. Tri par date (plus récent en premier)
    # ─────────────────────────────
    def parse_date(e):
        try:
            return datetime.fromisoformat(e["created_at"])
        except:
            return datetime.min

    events.sort(key=parse_date, reverse=True)

    return events[:limit]