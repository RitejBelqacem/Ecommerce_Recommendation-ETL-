# backend/chatbot_flask.py
# ─────────────────────────────────────────────────────────────────
# Ce fichier gère toute la logique du chatbot admin.
# Il est importé dans app.py.
# ─────────────────────────────────────────────────────────────────

import json
import os

KPI_PATH = os.path.join(os.path.dirname(__file__), "etl_output", "kpis_all.json")


def load_kpis() -> dict:
    """
    Charge les KPIs depuis le fichier JSON généré par l'ETL.
    Retourne un dict vide si le fichier n'existe pas encore.
    """
    try:
        with open(KPI_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        return {}
    except json.JSONDecodeError:
        return {}


def build_system_prompt(kpis: dict) -> str:
    """
    Construit le prompt système injecté à Claude.
    Contient toutes les données réelles des dashboards.
    """
    u   = kpis.get("users",         {})
    p   = kpis.get("products",      {})
    c   = kpis.get("commandes",     {})
    f   = kpis.get("favoris",       {})
    pan = kpis.get("panier",        {})
    v   = kpis.get("product_views", {})

    # ── Formatage des listes ──────────────────────────────────────

    top_fav = ", ".join(
        f"{x['product_name']} ({x['count']} ♥)"
        for x in f.get("top_products", [])[:5]
    ) or "N/A"

    top_pan = ", ".join(
        f"{x['product_name']} ({x['total_quantity']} articles)"
        for x in pan.get("top_products", [])[:5]
    ) or "N/A"

    top_views = ", ".join(
        f"{x['product_name']} ({x['views']} vues)"
        for x in v.get("top_products", [])[:5]
    ) or "N/A"

    top_cats = ", ".join(
        f"{x['category']} ({x['count']})"
        for x in p.get("by_category", [])[:5]
    ) or "N/A"

    top_countries = ", ".join(
        f"{x['country']} ({x['count']})"
        for x in u.get("by_country", [])[:5]
    ) or "N/A"

    top_discounted = ", ".join(
        f"{x['name']} (-{x['discount']} DT)"
        for x in p.get("top_discounted", [])[:5]
    ) or "N/A"

    # 3 derniers mois de CA
    monthly = c.get("monthly", [])[-3:]
    monthly_str = " | ".join(
        f"{m['month']}: {m['revenue']} DT ({m['orders']} cmds)"
        for m in monthly
    ) or "N/A"

    # Catégories favoris
    fav_cats = ", ".join(
        f"{x['category']} ({x['count']})"
        for x in f.get("by_category", [])[:5]
    ) or "N/A"

    # Catégories panier
    pan_cats = ", ".join(
        f"{x['category']} ({x['quantity']} articles)"
        for x in pan.get("by_category", [])[:5]
    ) or "N/A"

    # Vues par catégorie
    view_cats = ", ".join(
        f"{x['category']} ({x['views']} vues)"
        for x in v.get("by_category", [])[:5]
    ) or "N/A"

    return f"""Tu es l'assistant IA intégré au tableau de bord admin d'une boutique e-commerce tunisienne.

RÔLE :
- Tu réponds aux questions des administrateurs sur leurs données business
- Tu analyses les métriques et donnes des conseils basés sur les chiffres réels
- Tu réponds toujours en français, de façon concise et professionnelle
- Tu utilises UNIQUEMENT les données ci-dessous, sans inventer de chiffres
- Si une info n'est pas disponible, dis-le clairement

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 DONNÉES RÉELLES DU DASHBOARD (mise à jour ETL)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

👥 UTILISATEURS
  Total comptes       : {u.get('total_users', 'N/A')}
  Nouveaux ce mois    : {u.get('new_30d', 'N/A')}
  Nouveaux cette sem. : {u.get('new_7d', 'N/A')}
  Avec favoris        : {f.get('users_with_fav', 'N/A')} ({f.get('pct_users_fav', 'N/A')}%)
  Avec panier         : {pan.get('users_with_cart', 'N/A')}
  Top pays            : {top_countries}

📦 PRODUITS
  Total produits      : {p.get('total_products', 'N/A')}
  Disponibles         : {p.get('available', 'N/A')}
  Ruptures stock      : {p.get('out_of_stock', 'N/A')}
  Mis en avant        : {p.get('featured', 'N/A')}
  Prix moyen          : {p.get('avg_price', 'N/A')} DT
  Remise moyenne      : {p.get('avg_discount', 'N/A')} DT
  Top catégories      : {top_cats}
  Top remises         : {top_discounted}

💰 COMMANDES
  Total commandes     : {c.get('total_orders', 'N/A')}
  Chiffre d'affaires  : {c.get('revenue', 'N/A')} DT
  Panier moyen        : {c.get('avg_cart', 'N/A')} DT
  Commande min        : {c.get('min_order', 'N/A')} DT
  Commande max        : {c.get('max_order', 'N/A')} DT
  Commandes (7j)      : {c.get('orders_7d', 'N/A')}
  Acheteurs uniques   : {c.get('users_ordered', 'N/A')}
  Taux conversion     : {c.get('conversion_rate', 'N/A')}%
  CA derniers mois    : {monthly_str}

❤️  FAVORIS
  Total favoris       : {f.get('total_favoris', 'N/A')}
  Moy. par utilisateur: {f.get('avg_fav_per_user', 'N/A')}
  Top produits        : {top_fav}
  Top catégories      : {fav_cats}

🛒 PANIER
  Taux abandon        : {pan.get('abandon_rate', 'N/A')}%
  Paniers abandonnés  : {pan.get('abandoned_carts', 'N/A')}
  Total articles      : {pan.get('total_quantity', 'N/A')}
  Top produits        : {top_pan}
  Top catégories      : {pan_cats}

👁️  VUES PRODUITS
  Total vues          : {v.get('total_views', 'N/A')}
  Produits distincts  : {v.get('unique_products', 'N/A')}
  Visiteurs uniques   : {v.get('unique_visitors', 'N/A')}
  Moy. vues/produit   : {v.get('avg_views_per_product', 'N/A')}
  Top produits vus    : {top_views}
  Top catégories vues : {view_cats}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FORMAT DE RÉPONSE :
- Réponds en 2-4 phrases maximum pour les questions simples
- Pour les analyses, utilise des bullet points avec les vrais chiffres
- Si on te demande des recommandations, base-les sur les données ci-dessus
- Exemple de bonne réponse : "Le CA total est de X DT avec Y commandes. Le panier moyen est de Z DT."
"""