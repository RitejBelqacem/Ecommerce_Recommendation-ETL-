import sqlite3
import pandas as pd
from datetime import datetime

DB_PATH = "instance/database.db"


def get_connection(db_path: str = DB_PATH) -> sqlite3.Connection:
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn


def extract_users(db_path: str = DB_PATH) -> pd.DataFrame:
    """Lit la table user et retourne un DataFrame brut.
    Note : la colonne password est exclue."""
    conn = get_connection(db_path)
    df = pd.read_sql_query(
        """
        SELECT id, first_name, last_name, email, phone,
               role, address, city, country, created_at, age
        FROM user
        """,
        conn,
        parse_dates=["created_at"],
    )
    conn.close()
    return df


def extract_products(db_path: str = DB_PATH) -> pd.DataFrame:
    """Lit la table product et retourne un DataFrame brut."""
    conn = get_connection(db_path)
    df = pd.read_sql_query(
        """
        SELECT id, name, category, price, brand, old_price,
               stock, is_available, is_featured, created_at, updated_at
        FROM product
        """,
        conn,
        parse_dates=["created_at", "updated_at"],
    )
    conn.close()
    return df


def extract_commandes(db_path: str = DB_PATH) -> pd.DataFrame:
    """Lit la table commandes et retourne un DataFrame brut."""
    conn = get_connection(db_path)
    df = pd.read_sql_query(
        """
        SELECT id, user_id, nom, prenom, phone, address, total, created_at
        FROM commandes
        """,
        conn,
        parse_dates=["created_at"],
    )
    conn.close()
    return df


def extract_favoris(db_path: str = DB_PATH) -> pd.DataFrame:
    """Lit la table favoris et retourne un DataFrame brut."""
    conn = get_connection(db_path)
    df = pd.read_sql_query(
        """
        SELECT id, user_id, product_id, product_name, category, created_at
        FROM favoris
        """,
        conn,
        parse_dates=["created_at"],
    )
    conn.close()
    return df


def extract_panier(db_path: str = DB_PATH) -> pd.DataFrame:
    """Lit la table panier et retourne un DataFrame brut."""
    conn = get_connection(db_path)
    df = pd.read_sql_query(
        """
        SELECT id, user_id, product_id, product_name, category, quantity, created_at
        FROM panier
        """,
        conn,
        parse_dates=["created_at"],
    )
    conn.close()
    return df


def extract_all(db_path: str = DB_PATH) -> dict:
    """
    Point d'entrée du pipeline ETL — phase Extract uniquement.
    Retourne les données brutes de toutes les tables.

    Usage :
        from etl.extract import extract_all
        raw = extract_all("instance/database.db")
        df_users = raw["users"]
    """
    print(f"[{datetime.now().strftime('%H:%M:%S')}] EXTRACT — début")

    raw = {
        "users":     extract_users(db_path),
        "products":  extract_products(db_path),
        "commandes": extract_commandes(db_path),
        "favoris":   extract_favoris(db_path),
        "panier":    extract_panier(db_path),
    }

    for name, df in raw.items():
        print(f"  ✓ {name:<12} {len(df)} lignes extraites")

    print(f"[{datetime.now().strftime('%H:%M:%S')}] EXTRACT — terminé")
    return raw