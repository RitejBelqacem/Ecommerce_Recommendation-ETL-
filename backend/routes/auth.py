from flask import Blueprint, request, jsonify
from models.user import User
from models import db
from werkzeug.security import generate_password_hash, check_password_hash
import uuid
import smtplib
from email.message import EmailMessage

# -----------------------------
# INIT BLUEPRINT
# -----------------------------
auth_bp = Blueprint("auth", __name__)

# -----------------------------
# RESET TOKENS (temporaire)
# -----------------------------
reset_tokens = {}

# -----------------------------
# EMAIL FUNCTION (MAILHOG)
# -----------------------------
def send_email(to_email, subject, body):
    try:
        msg = EmailMessage()
        msg["From"] = "no-reply@test.com"
        msg["To"] = to_email
        msg["Subject"] = subject
        msg.set_content(body, subtype="plain", charset="utf-8")

        server = smtplib.SMTP("127.0.0.1", 1025)
        server.send_message(msg)
        server.quit()

        print("Email envoyé ✅")

    except Exception as e:
        print("Erreur email:", e)


# -----------------------------
# REGISTER
# -----------------------------
@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()

    if not data:
        return jsonify({"error": "Aucune donnée reçue"}), 400

    email = data.get("email")
    password = data.get("password")
    first_name = data.get("first_name", "")
    last_name = data.get("last_name", "")
    phone = data.get("phone", "")
    address = data.get("address", "")
    city = data.get("city", "")
    country = data.get("country", "")
    age = data.get("age")

    # validation minimale
    if not email or not password:
        return jsonify({"error": "Email et mot de passe requis"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Email déjà utilisé"}), 400

    # création user
    new_user = User(
        first_name=first_name,
        last_name=last_name,
        age=int(age) if age else None,
        email=email,
        password=generate_password_hash(password),
        phone=phone,
        address=address,
        city=city,
        country=country,
        role="admin" if email == "admin@gmail.com" else "user"
    )

    db.session.add(new_user)
    db.session.commit()

    # email bienvenue
    send_email(
        email,
        "Bienvenue 🎉",
        f"Bonjour {first_name}, votre compte a été créé avec succès !"
    )

    return jsonify({"message": "Compte créé avec succès ✅"}), 201


# -----------------------------
# LOGIN
# -----------------------------
@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()

    if not data:
        return jsonify({"error": "Aucune donnée reçue"}), 400

    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "Email et mot de passe requis"}), 400

    user = User.query.filter_by(email=email).first()

    if not user:
        return jsonify({"error": "Utilisateur non trouvé"}), 404

    if not check_password_hash(user.password, password):
        return jsonify({"error": "Mot de passe incorrect"}), 401

    return jsonify({
        "message": "Connexion réussie ✅",
        "user_id": user.id,
        "role": user.role
    }), 200


# -----------------------------
# FORGOT PASSWORD
# -----------------------------
@auth_bp.route("/forgot-password", methods=["POST"])
def forgot_password():
    data = request.get_json()

    if not data:
        return jsonify({"error": "Aucune donnée reçue"}), 400

    email = data.get("email")

    user = User.query.filter_by(email=email).first()

    if not user:
        return jsonify({"error": "Email introuvable"}), 404

    token = str(uuid.uuid4())
    reset_tokens[token] = user.id

    reset_link = f"http://localhost:5173/reset-password/{token}"

    send_email(
        email,
        "Reset Password 🔐",
        f"Cliquez ici pour réinitialiser votre mot de passe:\n{reset_link}"
    )

    return jsonify({"message": "Email envoyé 📧"}), 200


# -----------------------------
# RESET PASSWORD
# -----------------------------
@auth_bp.route("/reset-password/<token>", methods=["POST"])
def reset_password(token):

    if token not in reset_tokens:
        return jsonify({"error": "Token invalide"}), 400

    data = request.get_json()

    if not data:
        return jsonify({"error": "Aucune donnée reçue"}), 400

    new_password = data.get("password")

    if not new_password:
        return jsonify({"error": "Mot de passe requis"}), 400

    user_id = reset_tokens[token]
    user = User.query.get(user_id)

    if not user:
        return jsonify({"error": "Utilisateur introuvable"}), 404

    user.password = generate_password_hash(new_password)
    db.session.commit()

    del reset_tokens[token]

    return jsonify({"message": "Mot de passe mis à jour ✅"}), 200