import pandas as pd
from datetime import datetime


# ─────────────────────────────────────────
#  USERS
# ─────────────────────────────────────────

def transform_users(df_users: pd.DataFrame) -> dict:
    """
    Calcule les KPIs utilisateurs à partir du DataFrame brut.

    Retourne :
        total_users       : nombre total de comptes
        new_7d            : nouveaux inscrits cette semaine
        new_30d           : nouveaux inscrits ce mois
        by_country        : répartition par pays
        by_role           : répartition par rôle (admin / user)
        registrations_over_time : inscriptions par mois
    """
    now = pd.Timestamp.now()

    total_users = len(df_users)

    new_7d  = int(df_users[df_users["created_at"] >= now - pd.Timedelta(days=7)].shape[0])
    new_30d = int(df_users[df_users["created_at"] >= now - pd.Timedelta(days=30)].shape[0])

    by_country = (
        df_users[df_users["country"].notna()]
        .groupby("country")
        .size()
        .reset_index(name="count")
        .sort_values("count", ascending=False)
        .to_dict(orient="records")
    )

    by_role = (
        df_users.groupby("role")
        .size()
        .reset_index(name="count")
        .to_dict(orient="records")
    )

    registrations_over_time = (
        df_users.dropna(subset=["created_at"])
        .assign(month=df_users["created_at"].dt.to_period("M").astype(str))
        .groupby("month")
        .size()
        .reset_index(name="count")
        .sort_values("month")
        .to_dict(orient="records")
    )

    return {
        "total_users":              total_users,
        "new_7d":                   new_7d,
        "new_30d":                  new_30d,
        "by_country":               by_country,
        "by_role":                  by_role,
        "registrations_over_time":  registrations_over_time,
    }


# ─────────────────────────────────────────
#  PRODUCTS
# ─────────────────────────────────────────

def transform_products(df_products: pd.DataFrame) -> dict:
    """
    Calcule les KPIs produits à partir du DataFrame brut.

    Retourne :
        total_products    : nombre total de produits
        avg_price         : prix moyen
        avg_discount      : remise moyenne (old_price - price)
        featured          : produits mis en avant
        out_of_stock      : produits en rupture (stock = 0)
        available         : produits disponibles
        by_category       : répartition par catégorie
        price_by_category : prix moyen par catégorie
        top_discounted    : top 5 produits avec la plus grande remise
    """
    total_products = len(df_products)
    avg_price      = round(df_products["price"].mean(), 2)
    featured       = int(df_products["is_featured"].sum())
    out_of_stock   = int((df_products["stock"] == 0).sum())
    available      = int(df_products["is_available"].sum())

    df_products = df_products.copy()
    df_products["discount"] = df_products["old_price"] - df_products["price"]
    avg_discount = round(df_products["discount"].dropna().mean(), 2)

    by_category = (
        df_products.groupby("category")
        .size()
        .reset_index(name="count")
        .sort_values("count", ascending=False)
        .to_dict(orient="records")
    )

    price_by_category = (
        df_products.groupby("category")["price"]
        .mean()
        .round(2)
        .reset_index(name="avg_price")
        .sort_values("avg_price", ascending=False)
        .to_dict(orient="records")
    )

    top_discounted = (
        df_products[df_products["discount"] > 0]
        .nlargest(5, "discount")[["name", "category", "price", "old_price", "discount"]]
        .round(2)
        .to_dict(orient="records")
    )

    return {
        "total_products":    total_products,
        "avg_price":         avg_price,
        "avg_discount":      avg_discount,
        "featured":          featured,
        "out_of_stock":      out_of_stock,
        "available":         available,
        "by_category":       by_category,
        "price_by_category": price_by_category,
        "top_discounted":    top_discounted,
    }


# ─────────────────────────────────────────
#  COMMANDES
# ─────────────────────────────────────────

def transform_commandes(df_commandes: pd.DataFrame, df_users: pd.DataFrame) -> dict:
    """
    Calcule les KPIs commandes à partir des DataFrames bruts.

    Paramètres :
        df_commandes : DataFrame brut de la table commandes
        df_users     : DataFrame brut de la table user (pour le taux de conversion)

    Retourne :
        total_orders       : nombre total de commandes
        revenue            : CA total
        avg_cart           : panier moyen
        min_order          : commande minimale
        max_order          : commande maximale
        orders_7d          : commandes des 7 derniers jours
        conversion_rate    : commandes uniques / total users (%)
        monthly            : CA et volume par mois
        revenue_cumulative : CA cumulé dans le temps
    """
    now = pd.Timestamp.now()

    total_orders = len(df_commandes)
    revenue      = round(float(df_commandes["total"].sum()), 2)
    avg_cart     = round(float(df_commandes["total"].mean()), 2)
    min_order    = round(float(df_commandes["total"].min()), 2)
    max_order    = round(float(df_commandes["total"].max()), 2)

    orders_7d = int(
        df_commandes[df_commandes["created_at"] >= now - pd.Timedelta(days=7)].shape[0]
    )

    users_ordered   = df_commandes["user_id"].nunique()
    total_users     = len(df_users)
    conversion_rate = round(users_ordered / total_users * 100, 2) if total_users else 0

    monthly = (
        df_commandes.dropna(subset=["created_at"])
        .assign(month=df_commandes["created_at"].dt.to_period("M").astype(str))
        .groupby("month")
        .agg(orders=("id", "count"), revenue=("total", "sum"))
        .round(2)
        .reset_index()
        .sort_values("month")
        .to_dict(orient="records")
    )

    revenue_cumulative = (
        df_commandes.dropna(subset=["created_at"])
        .sort_values("created_at")
        .assign(cumulative=df_commandes["total"].cumsum().round(2))
        [["created_at", "cumulative"]]
        .assign(created_at=lambda x: x["created_at"].dt.strftime("%Y-%m-%d"))
        .to_dict(orient="records")
    )
    # ── Commandes par jour ──
    orders_daily = (
    df_commandes.dropna(subset=["created_at"])
    .assign(created_at=df_commandes["created_at"].dt.strftime("%Y-%m-%d"))
    .groupby("created_at")
    .size()
    .reset_index(name="count")
    .sort_values("created_at")
    .to_dict(orient="records")
)

# ── Top 5 clients ──
    top_users = (
    df_commandes.groupby("user_id")["total"]
    .sum()
    .reset_index(name="total_spent")
    .sort_values("total_spent", ascending=False)
    .head(5)
    .round(2)
    .to_dict(orient="records")
)
    return {
        "total_orders":        total_orders,
        "revenue":             revenue,
        "avg_cart":            avg_cart,
        "min_order":           min_order,
        "max_order":           max_order,
        "orders_7d":           orders_7d,
        "users_ordered":       users_ordered,
        "conversion_rate":     conversion_rate,
        "monthly":             monthly,
        "revenue_cumulative":  revenue_cumulative,
        "orders_daily":        orders_daily,
        "top_users":           top_users
    }


# ─────────────────────────────────────────
#  FAVORIS
# ─────────────────────────────────────────

def transform_favoris(df_favoris: pd.DataFrame, df_users: pd.DataFrame) -> dict:
    """
    Calcule les KPIs favoris.

    Retourne :
        total_favoris    : nombre total de favoris
        users_with_fav   : nombre d'utilisateurs ayant au moins un favori
        pct_users_fav    : % d'utilisateurs avec favoris
        top_products     : top 10 produits les plus mis en favori
        by_category      : répartition des favoris par catégorie
        avg_fav_per_user : moyenne de favoris par utilisateur actif
    """
    total_favoris  = len(df_favoris)
    users_with_fav = df_favoris["user_id"].nunique()
    total_users    = len(df_users)
    pct_users_fav  = round(users_with_fav / total_users * 100, 2) if total_users else 0
    avg_fav_per_user = round(total_favoris / users_with_fav, 2) if users_with_fav else 0

    top_products = (
        df_favoris.groupby(["product_id", "product_name"])
        .size()
        .reset_index(name="count")
        .sort_values("count", ascending=False)
        .head(10)
        .to_dict(orient="records")
    )

    by_category = (
        df_favoris.groupby("category")
        .size()
        .reset_index(name="count")
        .sort_values("count", ascending=False)
        .to_dict(orient="records")
    )

    return {
        "total_favoris":     total_favoris,
        "users_with_fav":    users_with_fav,
        "pct_users_fav":     pct_users_fav,
        "avg_fav_per_user":  avg_fav_per_user,
        "top_products":      top_products,
        "by_category":       by_category,
    }


# ─────────────────────────────────────────
#  PANIER
# ─────────────────────────────────────────

def transform_panier(
    df_panier: pd.DataFrame,
    df_commandes: pd.DataFrame,
    df_users: pd.DataFrame,
) -> dict:
    """
    Calcule les KPIs panier.

    Paramètres :
        df_panier    : DataFrame brut de la table panier
        df_commandes : nécessaire pour calculer le taux d'abandon
        df_users     : nécessaire pour les pourcentages globaux

    Retourne :
        total_items      : nombre de lignes panier
        total_quantity   : quantité totale d'articles
        users_with_cart  : utilisateurs avec au moins un article
        abandoned_carts  : users avec panier mais sans commande
        abandon_rate     : taux d'abandon (%)
        by_category      : quantités par catégorie
        top_products     : top 10 produits dans les paniers
    """
    total_items     = len(df_panier)
    total_quantity  = int(df_panier["quantity"].sum())
    users_with_cart = df_panier["user_id"].nunique()
    total_users     = len(df_users)

    users_ordered  = set(df_commandes["user_id"].unique())
    users_carted   = set(df_panier["user_id"].unique())
    abandoned      = len(users_carted - users_ordered)
    abandon_rate   = round(abandoned / users_with_cart * 100, 2) if users_with_cart else 0

    by_category = (
        df_panier.groupby("category")["quantity"]
        .sum()
        .reset_index(name="quantity")
        .sort_values("quantity", ascending=False)
        .to_dict(orient="records")
    )

    top_products = (
        df_panier.groupby(["product_id", "product_name"])["quantity"]
        .sum()
        .reset_index(name="total_quantity")
        .sort_values("total_quantity", ascending=False)
        .head(10)
        .to_dict(orient="records")
    )

    return {
        "total_items":      total_items,
        "total_quantity":   total_quantity,
        "users_with_cart":  users_with_cart,
        "abandoned_carts":  abandoned,
        "abandon_rate":     abandon_rate,
        "by_category":      by_category,
        "top_products":     top_products,
    }



# ─────────────────────────────────────────
#  PRODUCT VIEWS (produits les plus consultés)
# ─────────────────────────────────────────

def transform_product_views(df_views: pd.DataFrame) -> dict:
    """
    Calcule les KPIs de consultation produits.

    Retourne :
        total_views        : nombre total de consultations
        unique_products    : nombre de produits distincts consultés
        unique_visitors    : nombre de visiteurs uniques (user_id non null)
        top_products       : top 10 produits les plus vus
        by_category        : vues par catégorie
        by_source          : vues par source (home, search, recommendation…)
        views_over_time    : évolution des vues par jour (30 derniers jours)
        avg_views_per_product : moyenne de vues par produit
    """
    if df_views.empty:
        return {
            "total_views": 0, "unique_products": 0, "unique_visitors": 0,
            "top_products": [], "by_category": [], "by_source": [],
            "views_over_time": [], "avg_views_per_product": 0,
        }

    total_views     = len(df_views)
    unique_products = df_views["product_id"].nunique()
    unique_visitors = df_views["user_id"].dropna().nunique()
    avg_views       = round(total_views / unique_products, 2) if unique_products else 0

    # ── Top 10 produits les plus consultés ──
    top_products = (
        df_views.groupby(["product_id", "product_name", "category"])
        .size()
        .reset_index(name="views")
        .sort_values("views", ascending=False)
        .head(10)
        .to_dict(orient="records")
    )

    # ── Vues par catégorie ──
    by_category = (
        df_views.groupby("category")
        .size()
        .reset_index(name="views")
        .sort_values("views", ascending=False)
        .to_dict(orient="records")
    )

    # ── Vues par source ──
    by_source = (
        df_views[df_views["source"].notna()]
        .groupby("source")
        .size()
        .reset_index(name="views")
        .sort_values("views", ascending=False)
        .to_dict(orient="records")
    )

    # ── Évolution des vues (30 derniers jours) ──
    now = pd.Timestamp.now()
    views_over_time = (
        df_views[df_views["viewed_at"] >= now - pd.Timedelta(days=30)]
        .dropna(subset=["viewed_at"])
        .assign(date=lambda x: x["viewed_at"].dt.strftime("%Y-%m-%d"))
        .groupby("date")
        .size()
        .reset_index(name="views")
        .sort_values("date")
        .to_dict(orient="records")
    )

    return {
        "total_views":           total_views,
        "unique_products":       unique_products,
        "unique_visitors":       unique_visitors,
        "avg_views_per_product": avg_views,
        "top_products":          top_products,
        "by_category":           by_category,
        "by_source":             by_source,
        "views_over_time":       views_over_time,
    }


# ─────────────────────────────────────────
#  TRANSFORM GLOBAL (point d'entrée ETL)
# ─────────────────────────────────────────

def transform_all(raw: dict) -> dict:
    """
    Point d'entrée de la phase Transform.
    Reçoit le dict retourné par extract_all() et retourne
    tous les KPIs calculés, prêts pour la phase Load.

    Usage :
        from etl.extract import extract_all
        from etl.transform import transform_all

        raw  = extract_all("instance/database.db")
        kpis = transform_all(raw)
    """
    print(f"[{datetime.now().strftime('%H:%M:%S')}] TRANSFORM — début")

    kpis = {
        "users":         transform_users(raw["users"]),
        "products":      transform_products(raw["products"]),
        "commandes":     transform_commandes(raw["commandes"], raw["users"]),
        "favoris":       transform_favoris(raw["favoris"], raw["users"]),
        "panier":        transform_panier(raw["panier"], raw["commandes"], raw["users"]),
        "product_views": transform_product_views(raw["product_views"]),
    }

    print(f"  ✓ users      — {kpis['users']['total_users']} users, {kpis['users']['new_30d']} nouveaux ce mois")
    print(f"  ✓ products   — {kpis['products']['total_products']} produits, {kpis['products']['out_of_stock']} ruptures")
    print(f"  ✓ commandes  — CA {kpis['commandes']['revenue']} DT, panier moy. {kpis['commandes']['avg_cart']} DT")
    print(f"  ✓ favoris    — {kpis['favoris']['total_favoris']} favoris, {kpis['favoris']['pct_users_fav']}% des users")
    print(f"  ✓ panier     — {kpis['panier']['abandon_rate']}% taux d'abandon")
    print(f"  ✓ views      — {kpis['product_views']['total_views']} vues, top: {kpis['product_views']['top_products'][0]['product_name'] if kpis['product_views']['top_products'] else 'N/A'}")
    print(f"[{datetime.now().strftime('%H:%M:%S')}] TRANSFORM — terminé")

    return kpis