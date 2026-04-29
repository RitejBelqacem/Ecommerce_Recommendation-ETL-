import csv
import random
from faker import Faker

fake = Faker()

NUM_ROWS = 1000

# ==============================
# 🔹 USERS (tous = user)
# ==============================
with open("users.csv", "w", newline='', encoding="utf-8") as f:
    writer = csv.writer(f)
    writer.writerow([
        "first_name","last_name","age","email","password",
        "phone","address","city","country"
    ])

    countries = [
        "Tunisia", "France", "Germany", "Italy", "Spain",
        "United States", "Canada", "United Kingdom",
        "Morocco", "Algeria", "Egypt", "Turkey"
    ]

    for _ in range(NUM_ROWS):
        country = random.choice(countries)

        writer.writerow([
            fake.first_name(),
            fake.last_name(),
            random.randint(18, 60),
            fake.unique.email(),
            "123456",
            fake.phone_number(),
            fake.address().replace("\n", " "),
            fake.city(),
            country
        ])


# ==============================
# 🔹 PRODUCTS (aligné avec model)
# ==============================
with open("products.csv", "w", newline='', encoding="utf-8") as f:
    writer = csv.writer(f)
    writer.writerow([
        "name","description","category","brand",
        "price","old_price","stock",
        "image","is_available","is_featured"
    ])

    categories = ["Electronics","Clothing","Sports","Home","Beauty"]
    brands = ["Samsung","Apple","Nike","Adidas","Generic"]

    for i in range(NUM_ROWS):
        price = random.randint(50, 3000)

        writer.writerow([
            fake.word().capitalize() + " Product",
            fake.sentence(),
            random.choice(categories),
            random.choice(brands),
            price,
            price + random.randint(10, 200),
            random.randint(0, 50),
            f"img{i}.jpg",
            random.choice([True, False]),
            random.choice([True, False])
        ])


# ==============================
# 🔹 COMMANDES
# ==============================
with open("commandes.csv", "w", newline='', encoding="utf-8") as f:
    writer = csv.writer(f)
    writer.writerow([
        "user_id","nom","prenom","phone","address","total"
    ])

    for _ in range(NUM_ROWS):
        writer.writerow([
            random.randint(1, NUM_ROWS),
            fake.first_name(),
            fake.last_name(),
            fake.phone_number(),
            fake.address().replace("\n", " "),
            random.randint(50, 3000)
        ])


# ==============================
# 🔹 FAVORIS
# ==============================
with open("favoris.csv", "w", newline='', encoding="utf-8") as f:
    writer = csv.writer(f)
    writer.writerow([
        "user_id","product_id","product_name","category"
    ])

    for _ in range(NUM_ROWS):
        writer.writerow([
            random.randint(1, NUM_ROWS),
            random.randint(1, NUM_ROWS),
            fake.word().capitalize(),
            random.choice(["Electronics","Sports","Clothing","Home","Beauty"])
        ])


# ==============================
# 🔹 PANIER
# ==============================
with open("panier.csv", "w", newline='', encoding="utf-8") as f:
    writer = csv.writer(f)
    writer.writerow([
        "user_id","product_id","product_name","category","quantity"
    ])

    for _ in range(NUM_ROWS):
        writer.writerow([
            random.randint(1, NUM_ROWS),
            random.randint(1, NUM_ROWS),
            fake.word().capitalize(),
            random.choice(["Electronics","Sports","Clothing","Home","Beauty"]),
            random.randint(1, 5)
        ])


print("✅ CSV files generated successfully!")