import sqlite3
import json
import os
import pandas as pd
from datetime import datetime

DB_PATH       = "instance/database.db"
JSON_DIR      = "etl_output"


# ─────────────────────────────────────────
#  HELPERS
# ─────────────────────────────────────────

def _get_connection(db_path: str) -> sqlite3.Connection:
    conn = sqlite3.connect(db_path)
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA foreign_keys=ON")
    return conn


def _ensure_json_dir(path: str) -> None:
    os.makedirs(path, exist_ok=True)


def _f(v) -> float:
    """Convertit numpy.float64 / numpy.int64 en type Python natif pour SQLite."""
    if hasattr(v, "item"):
        return v.item()
    return v


# ─────────────────────────────────────────
#  LOAD — USERS
#  Clés transform : total_users, new_7d, new_30d,
#                   by_country, by_role, registrations_over_time
# ─────────────────────────────────────────

def load_kpi_users(conn: sqlite3.Connection, kpis: dict) -> None:
    s = kpis["users"]
    cur = conn.cursor()

    # ── kpi_users_summary ──
    cur.execute("""
        CREATE TABLE IF NOT EXISTS kpi_users_summary (
            computed_at TEXT PRIMARY KEY,
            total_users INTEGER,
            new_7d      INTEGER,
            new_30d     INTEGER
        )
    """)
    cur.execute(
        "INSERT OR REPLACE INTO kpi_users_summary VALUES (?,?,?,?)",
        (datetime.now().isoformat(), s["total_users"], s["new_7d"], s["new_30d"]),
    )

    # ── kpi_users_by_country ──
    cur.execute("""
        CREATE TABLE IF NOT EXISTS kpi_users_by_country (
            country TEXT PRIMARY KEY,
            count   INTEGER
        )
    """)
    cur.executemany(
        "INSERT OR REPLACE INTO kpi_users_by_country VALUES (?,?)",
        [(r["country"], r["count"]) for r in s["by_country"]],
    )

    # ── kpi_users_by_role ──
    cur.execute("""
        CREATE TABLE IF NOT EXISTS kpi_users_by_role (
            role  TEXT PRIMARY KEY,
            count INTEGER
        )
    """)
    cur.executemany(
        "INSERT OR REPLACE INTO kpi_users_by_role VALUES (?,?)",
        [(r["role"], r["count"]) for r in s["by_role"]],
    )

    # ── kpi_users_registrations ──
    cur.execute("""
        CREATE TABLE IF NOT EXISTS kpi_users_registrations (
            month TEXT PRIMARY KEY,
            count INTEGER
        )
    """)
    cur.executemany(
        "INSERT OR REPLACE INTO kpi_users_registrations VALUES (?,?)",
        [(r["month"], r["count"]) for r in s["registrations_over_time"]],
    )


# ─────────────────────────────────────────
#  LOAD — PRODUCTS
#  Clés transform : total_products, avg_price, avg_discount,
#                   featured, out_of_stock, available,
#                   by_category, price_by_category, top_discounted
# ─────────────────────────────────────────

def load_kpi_products(conn: sqlite3.Connection, kpis: dict) -> None:
    s = kpis["products"]
    cur = conn.cursor()

    # ── kpi_products_summary ──
    cur.execute("""
        CREATE TABLE IF NOT EXISTS kpi_products_summary (
            computed_at    TEXT PRIMARY KEY,
            total_products INTEGER,
            avg_price      REAL,
            avg_discount   REAL,
            featured       INTEGER,
            out_of_stock   INTEGER,
            available      INTEGER
        )
    """)
    cur.execute(
        "INSERT OR REPLACE INTO kpi_products_summary VALUES (?,?,?,?,?,?,?)",
        (
            datetime.now().isoformat(),
            s["total_products"],
            _f(s["avg_price"]),      # numpy.float64 → float
            _f(s["avg_discount"]),   # numpy.float64 → float
            s["featured"],
            s["out_of_stock"],
            s["available"],
        ),
    )

    # ── kpi_products_by_category ──
    # by_category  : [{"category", "count"}]
    # price_by_category : [{"category", "avg_price"}]
    cur.execute("""
        CREATE TABLE IF NOT EXISTS kpi_products_by_category (
            category  TEXT PRIMARY KEY,
            count     INTEGER,
            avg_price REAL
        )
    """)
    price_map = {r["category"]: _f(r["avg_price"]) for r in s["price_by_category"]}
    cur.executemany(
        "INSERT OR REPLACE INTO kpi_products_by_category VALUES (?,?,?)",
        [(r["category"], r["count"], price_map.get(r["category"])) for r in s["by_category"]],
    )

    # ── kpi_products_top_discounted ──
    # top_discounted : [{"name", "category", "price", "old_price", "discount"}]
    cur.execute("""
        CREATE TABLE IF NOT EXISTS kpi_products_top_discounted (
            name      TEXT PRIMARY KEY,
            category  TEXT,
            price     REAL,
            old_price REAL,
            discount  REAL
        )
    """)
    cur.executemany(
        "INSERT OR REPLACE INTO kpi_products_top_discounted VALUES (?,?,?,?,?)",
        [(r["name"], r["category"], _f(r["price"]), _f(r["old_price"]), _f(r["discount"]))
         for r in s["top_discounted"]],
    )


# ─────────────────────────────────────────
#  LOAD — COMMANDES
#  Clés transform : total_orders, revenue, avg_cart, min_order, max_order,
#                   orders_7d, users_ordered, conversion_rate,
#                   monthly, revenue_cumulative, orders_daily, top_users
# ─────────────────────────────────────────

def load_kpi_commandes(conn: sqlite3.Connection, kpis: dict) -> None:
    s = kpis["commandes"]
    cur = conn.cursor()

    # ── kpi_orders_summary ──
    cur.execute("""
        CREATE TABLE IF NOT EXISTS kpi_orders_summary (
            computed_at     TEXT PRIMARY KEY,
            total_orders    INTEGER,
            revenue         REAL,
            avg_cart        REAL,
            min_order       REAL,
            max_order       REAL,
            orders_7d       INTEGER,
            users_ordered   INTEGER,
            conversion_rate REAL
        )
    """)
    cur.execute(
        "INSERT OR REPLACE INTO kpi_orders_summary VALUES (?,?,?,?,?,?,?,?,?)",
        (
            datetime.now().isoformat(),
            s["total_orders"],
            _f(s["revenue"]),
            _f(s["avg_cart"]),
            _f(s["min_order"]),
            _f(s["max_order"]),
            s["orders_7d"],
            s["users_ordered"],
            _f(s["conversion_rate"]),
        ),
    )

    # ── kpi_orders_monthly ──
    # monthly : [{"month", "orders", "revenue"}]
    cur.execute("""
        CREATE TABLE IF NOT EXISTS kpi_orders_monthly (
            month   TEXT PRIMARY KEY,
            orders  INTEGER,
            revenue REAL
        )
    """)
    cur.executemany(
        "INSERT OR REPLACE INTO kpi_orders_monthly VALUES (?,?,?)",
        [(r["month"], r["orders"], _f(r["revenue"])) for r in s["monthly"]],
    )

    # ── kpi_orders_cumulative ──
    # revenue_cumulative : [{"created_at", "cumulative"}]
    cur.execute("""
        CREATE TABLE IF NOT EXISTS kpi_orders_cumulative (
            created_at TEXT PRIMARY KEY,
            cumulative REAL
        )
    """)
    cur.executemany(
        "INSERT OR REPLACE INTO kpi_orders_cumulative VALUES (?,?)",
        [(r["created_at"], _f(r["cumulative"])) for r in s["revenue_cumulative"]],
    )

    # ── kpi_orders_daily ──
    # orders_daily : [{"created_at", "count"}]
    if s.get("orders_daily"):
        cur.execute("""
            CREATE TABLE IF NOT EXISTS kpi_orders_daily (
                date  TEXT PRIMARY KEY,
                count INTEGER
            )
        """)
        cur.executemany(
            "INSERT OR REPLACE INTO kpi_orders_daily VALUES (?,?)",
            [(r["created_at"], r["count"]) for r in s["orders_daily"]],
        )

    # ── kpi_orders_top_users ──
    # top_users : [{"user_id", "total_spent"}]
    if s.get("top_users"):
        cur.execute("""
            CREATE TABLE IF NOT EXISTS kpi_orders_top_users (
                user_id     INTEGER PRIMARY KEY,
                total_spent REAL
            )
        """)
        cur.executemany(
            "INSERT OR REPLACE INTO kpi_orders_top_users VALUES (?,?)",
            [(r["user_id"], _f(r["total_spent"])) for r in s["top_users"]],
        )


# ─────────────────────────────────────────
#  LOAD — FAVORIS
#  Clés transform : total_favoris, users_with_fav, pct_users_fav,
#                   avg_fav_per_user, top_products, by_category
# ─────────────────────────────────────────

def load_kpi_favoris(conn: sqlite3.Connection, kpis: dict) -> None:
    s = kpis["favoris"]
    cur = conn.cursor()

    # ── kpi_favoris_summary ──
    cur.execute("""
        CREATE TABLE IF NOT EXISTS kpi_favoris_summary (
            computed_at      TEXT PRIMARY KEY,
            total_favoris    INTEGER,
            users_with_fav   INTEGER,
            pct_users_fav    REAL,
            avg_fav_per_user REAL
        )
    """)
    cur.execute(
        "INSERT OR REPLACE INTO kpi_favoris_summary VALUES (?,?,?,?,?)",
        (
            datetime.now().isoformat(),
            s["total_favoris"],
            s["users_with_fav"],
            _f(s["pct_users_fav"]),
            _f(s["avg_fav_per_user"]),
        ),
    )

    # ── kpi_favoris_by_category ──
    # by_category : [{"category", "count"}]
    cur.execute("""
        CREATE TABLE IF NOT EXISTS kpi_favoris_by_category (
            category TEXT PRIMARY KEY,
            count    INTEGER
        )
    """)
    cur.executemany(
        "INSERT OR REPLACE INTO kpi_favoris_by_category VALUES (?,?)",
        [(r["category"], r["count"]) for r in s["by_category"]],
    )

    # ── kpi_favoris_top_products ──
    # top_products : [{"product_id", "product_name", "count"}]
    cur.execute("""
        CREATE TABLE IF NOT EXISTS kpi_favoris_top_products (
            product_id   INTEGER PRIMARY KEY,
            product_name TEXT,
            count        INTEGER
        )
    """)
    cur.executemany(
        "INSERT OR REPLACE INTO kpi_favoris_top_products VALUES (?,?,?)",
        [(r["product_id"], r["product_name"], r["count"]) for r in s["top_products"]],
    )


# ─────────────────────────────────────────
#  LOAD — PANIER
#  Clés transform : total_items, total_quantity, users_with_cart,
#                   abandoned_carts, abandon_rate,
#                   by_category, top_products
# ─────────────────────────────────────────

def load_kpi_panier(conn: sqlite3.Connection, kpis: dict) -> None:
    s = kpis["panier"]
    cur = conn.cursor()

    # ── kpi_panier_summary ──
    cur.execute("""
        CREATE TABLE IF NOT EXISTS kpi_panier_summary (
            computed_at     TEXT PRIMARY KEY,
            total_items     INTEGER,
            total_quantity  INTEGER,
            users_with_cart INTEGER,
            abandoned_carts INTEGER,
            abandon_rate    REAL
        )
    """)
    cur.execute(
        "INSERT OR REPLACE INTO kpi_panier_summary VALUES (?,?,?,?,?,?)",
        (
            datetime.now().isoformat(),
            s["total_items"],
            s["total_quantity"],
            s["users_with_cart"],
            s["abandoned_carts"],
            _f(s["abandon_rate"]),
        ),
    )

    # ── kpi_panier_by_category ──
    # by_category : [{"category", "quantity"}]
    cur.execute("""
        CREATE TABLE IF NOT EXISTS kpi_panier_by_category (
            category TEXT PRIMARY KEY,
            quantity INTEGER
        )
    """)
    cur.executemany(
        "INSERT OR REPLACE INTO kpi_panier_by_category VALUES (?,?)",
        [(r["category"], r["quantity"]) for r in s["by_category"]],
    )

    # ── kpi_panier_top_products ──
    # top_products : [{"product_id", "product_name", "total_quantity"}]
    cur.execute("""
        CREATE TABLE IF NOT EXISTS kpi_panier_top_products (
            product_id     INTEGER PRIMARY KEY,
            product_name   TEXT,
            total_quantity INTEGER
        )
    """)
    cur.executemany(
        "INSERT OR REPLACE INTO kpi_panier_top_products VALUES (?,?,?)",
        [(r["product_id"], r["product_name"], r["total_quantity"])
         for r in s["top_products"]],
    )



# ─────────────────────────────────────────
#  LOAD — PRODUCT VIEWS
#  Clés transform : total_views, unique_products, unique_visitors,
#                   avg_views_per_product, top_products,
#                   by_category, by_source, views_over_time
# ─────────────────────────────────────────

def load_kpi_product_views(conn: sqlite3.Connection, kpis: dict) -> None:
    s = kpis["product_views"]
    cur = conn.cursor()

    # ── kpi_views_summary ──
    cur.execute("""
        CREATE TABLE IF NOT EXISTS kpi_views_summary (
            computed_at          TEXT PRIMARY KEY,
            total_views          INTEGER,
            unique_products      INTEGER,
            unique_visitors      INTEGER,
            avg_views_per_product REAL
        )
    """)
    cur.execute(
        "INSERT OR REPLACE INTO kpi_views_summary VALUES (?,?,?,?,?)",
        (
            datetime.now().isoformat(),
            s["total_views"],
            s["unique_products"],
            s["unique_visitors"],
            _f(s["avg_views_per_product"]),
        ),
    )

    # ── kpi_views_top_products ──
    # top_products : [{"product_id", "product_name", "category", "views"}]
    cur.execute("""
        CREATE TABLE IF NOT EXISTS kpi_views_top_products (
            product_id   INTEGER PRIMARY KEY,
            product_name TEXT,
            category     TEXT,
            views        INTEGER
        )
    """)
    cur.executemany(
        "INSERT OR REPLACE INTO kpi_views_top_products VALUES (?,?,?,?)",
        [(r["product_id"], r["product_name"], r["category"], r["views"])
         for r in s["top_products"]],
    )

    # ── kpi_views_by_category ──
    # by_category : [{"category", "views"}]
    cur.execute("""
        CREATE TABLE IF NOT EXISTS kpi_views_by_category (
            category TEXT PRIMARY KEY,
            views    INTEGER
        )
    """)
    cur.executemany(
        "INSERT OR REPLACE INTO kpi_views_by_category VALUES (?,?)",
        [(r["category"], r["views"]) for r in s["by_category"]],
    )

    # ── kpi_views_by_source ──
    # by_source : [{"source", "views"}]
    cur.execute("""
        CREATE TABLE IF NOT EXISTS kpi_views_by_source (
            source TEXT PRIMARY KEY,
            views  INTEGER
        )
    """)
    cur.executemany(
        "INSERT OR REPLACE INTO kpi_views_by_source VALUES (?,?)",
        [(r["source"], r["views"]) for r in s["by_source"]],
    )

    # ── kpi_views_over_time ──
    # views_over_time : [{"date", "views"}]
    cur.execute("""
        CREATE TABLE IF NOT EXISTS kpi_views_over_time (
            date  TEXT PRIMARY KEY,
            views INTEGER
        )
    """)
    cur.executemany(
        "INSERT OR REPLACE INTO kpi_views_over_time VALUES (?,?)",
        [(r["date"], r["views"]) for r in s["views_over_time"]],
    )


# ─────────────────────────────────────────
#  LOG ETL
# ─────────────────────────────────────────

def _log_etl_run(conn: sqlite3.Connection, status: str, detail: str = "") -> None:
    conn.execute("""
        CREATE TABLE IF NOT EXISTS etl_logs (
            id     INTEGER PRIMARY KEY AUTOINCREMENT,
            ran_at TEXT,
            status TEXT,
            detail TEXT
        )
    """)
    conn.execute(
        "INSERT INTO etl_logs (ran_at, status, detail) VALUES (?,?,?)",
        (datetime.now().isoformat(), status, detail),
    )


# ─────────────────────────────────────────
#  EXPORT JSON
# ─────────────────────────────────────────

def load_to_json(kpis: dict, output_dir: str = JSON_DIR) -> None:
    _ensure_json_dir(output_dir)

    def _convert(obj):
        if isinstance(obj, pd.Timestamp):
            return obj.isoformat()
        if hasattr(obj, "item"):      # numpy scalars
            return obj.item()
        raise TypeError(f"Type non sérialisable : {type(obj)}")

    for section in ["users", "products", "commandes", "favoris", "panier", "product_views"]:
        with open(os.path.join(output_dir, f"kpis_{section}.json"), "w", encoding="utf-8") as f:
            json.dump(kpis[section], f, ensure_ascii=False, indent=2, default=_convert)

    with open(os.path.join(output_dir, "kpis_all.json"), "w", encoding="utf-8") as f:
        json.dump(kpis, f, ensure_ascii=False, indent=2, default=_convert)

    print(f"  ✓ JSON exporté dans → {output_dir}/")


# ─────────────────────────────────────────
#  LOAD GLOBAL (point d'entrée ETL)
# ─────────────────────────────────────────

def load_all(kpis: dict, db_path: str = DB_PATH, export_json: bool = True) -> dict:
    """
    Point d'entrée de la phase Load.
    Reçoit le dict de transform_all() et :
      1. Sauvegarde tous les KPIs dans des tables SQLite dédiées
      2. Exporte optionnellement les KPIs en JSON (pour React)
      3. Enregistre l'exécution dans etl_logs

    Usage :
        from etl.extract   import extract_all
        from etl.transform import transform_all
        from etl.load      import load_all

        raw    = extract_all("instance/database.db")
        kpis   = transform_all(raw)
        result = load_all(kpis, "instance/database.db")
    """
    print(f"[{datetime.now().strftime('%H:%M:%S')}] LOAD — début")

    conn = _get_connection(db_path)
    tables_written = []

    try:
        load_kpi_users(conn, kpis)
        tables_written += [
            "kpi_users_summary", "kpi_users_by_country",
            "kpi_users_by_role", "kpi_users_registrations",
        ]

        load_kpi_products(conn, kpis)
        tables_written += [
            "kpi_products_summary", "kpi_products_by_category",
            "kpi_products_top_discounted",
        ]

        load_kpi_commandes(conn, kpis)
        tables_written += ["kpi_orders_summary", "kpi_orders_monthly", "kpi_orders_cumulative"]
        if kpis["commandes"].get("orders_daily"):
            tables_written.append("kpi_orders_daily")
        if kpis["commandes"].get("top_users"):
            tables_written.append("kpi_orders_top_users")

        load_kpi_favoris(conn, kpis)
        tables_written += [
            "kpi_favoris_summary", "kpi_favoris_by_category",
            "kpi_favoris_top_products",
        ]

        load_kpi_panier(conn, kpis)
        tables_written += [
            "kpi_panier_summary", "kpi_panier_by_category",
            "kpi_panier_top_products",
        ]

        load_kpi_product_views(conn, kpis)
        tables_written += [
            "kpi_views_summary", "kpi_views_top_products",
            "kpi_views_by_category", "kpi_views_by_source",
            "kpi_views_over_time",
        ]

        _log_etl_run(conn, "SUCCESS", f"{len(tables_written)} tables écrites")
        conn.commit()

    except Exception as e:
        conn.rollback()
        _log_etl_run(conn, "ERROR", str(e))
        conn.commit()
        conn.close()
        raise

    conn.close()

    for t in tables_written:
        print(f"  ✓ {t}")

    if export_json:
        load_to_json(kpis)

    print(f"[{datetime.now().strftime('%H:%M:%S')}] LOAD — terminé ({len(tables_written)} tables)")

    return {
        "status":         "success",
        "tables_written": len(tables_written),
        "tables":         tables_written,
        "ran_at":         datetime.now().isoformat(),
    }