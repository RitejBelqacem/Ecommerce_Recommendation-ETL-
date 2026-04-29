import sys
import os

# 🔥 Ajouter backend au path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

# 🔥 Dossier scripts (CSV)
BASE_DIR = os.path.dirname(__file__)

import csv
import random
from datetime import datetime, timedelta
from werkzeug.security import generate_password_hash

from app import app, db
from models.user import User
from models.product import Product
from models.commande import Commande
from models.favoris import Favoris
from models.panier import Panier


def random_date(start_year=2022):
    start = datetime(start_year, 1, 1)
    end = datetime.now()
    delta = end - start
    random_days = random.randint(0, delta.days)
    return start + timedelta(days=random_days)


# 🔹 USERS
def seed_users():
    print("Seeding users...")
    with open(os.path.join(BASE_DIR, "users.csv"), newline='', encoding="utf-8") as f:
        reader = csv.DictReader(f)

        for row in reader:
            existing = User.query.filter_by(email=row["email"]).first()
            if existing:
                continue

            user = User(
                first_name=row["first_name"],
                last_name=row["last_name"],
                age=int(row["age"]) if row["age"] else None,
                email=row["email"],
                password=generate_password_hash(row["password"]),
                phone=row["phone"],
                address=row["address"],
                city=row["city"],
                country=row["country"],
                role="user",
                created_at=random_date()
            )
            db.session.add(user)

    db.session.commit()
    print("Users added ✅")


# 🔹 PRODUCTS
def seed_products():
    print("Seeding products...")
    with open(os.path.join(BASE_DIR, "products.csv"), newline='', encoding="utf-8") as f:
        reader = csv.DictReader(f)

        for row in reader:
            product = Product(
                name=row["name"],
                description=row["description"],
                category=row["category"],
                brand=row["brand"],
                price=float(row["price"]),
                old_price=float(row["old_price"]) if row["old_price"] else None,
                stock=int(row["stock"]),
                image=row["image"],
    
                is_available=row["is_available"] == "True",
                is_featured=row["is_featured"] == "True",
                created_at=random_date(),
                updated_at=random_date()
            )
            db.session.add(product)

    db.session.commit()
    print("Products added ✅")


# 🔹 COMMANDES
def seed_commandes():
    print("Seeding commandes...")
    with open(os.path.join(BASE_DIR, "commandes.csv"), newline='', encoding="utf-8") as f:
        reader = csv.DictReader(f)

        for row in reader:
            commande = Commande(
                user_id=int(row["user_id"]),
                nom=row["nom"],
                prenom=row["prenom"],
                phone=row["phone"],
                address=row["address"],
                total=float(row["total"]),
                created_at=random_date()
            )
            db.session.add(commande)

    db.session.commit()
    print("Commandes added ✅")


# 🔹 FAVORIS
def seed_favoris():
    print("Seeding favoris...")
    with open(os.path.join(BASE_DIR, "favoris.csv"), newline='', encoding="utf-8") as f:
        reader = csv.DictReader(f)

        for row in reader:
            fav = Favoris(
                user_id=int(row["user_id"]),
                product_id=int(row["product_id"]),
                product_name=row["product_name"],
                category=row["category"],
                created_at=random_date()
            )
            db.session.add(fav)

    db.session.commit()
    print("Favoris added ✅")


# 🔹 PANIER
def seed_panier():
    print("Seeding panier...")
    with open(os.path.join(BASE_DIR, "panier.csv"), newline='', encoding="utf-8") as f:
        reader = csv.DictReader(f)

        for row in reader:
            panier = Panier(
                user_id=int(row["user_id"]),
                product_id=int(row["product_id"]),
                product_name=row["product_name"],
                category=row["category"],
                quantity=int(row["quantity"]),
                created_at=random_date()
            )
            db.session.add(panier)

    db.session.commit()
    print("Panier added ✅")


# 🔥 MAIN
if __name__ == "__main__":
    with app.app_context():
        print("START SEEDING DATABASE...\n")

        seed_users()
        seed_products()
        seed_commandes()
        seed_favoris()
        seed_panier()

        print("\nDATABASE SEEDED SUCCESSFULLY 🚀")