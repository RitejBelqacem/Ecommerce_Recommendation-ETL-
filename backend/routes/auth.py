from flask import Blueprint, request, jsonify
from models.user import User
from models import db
from werkzeug.security import generate_password_hash, check_password_hash
import uuid
import smtplib
from email.mime.text import MIMEText
from email.utils import formataddr
import smtplib
from email.message import EmailMessage

# -----------------------------
#  INIT BLUEPRINT (TOUJOURS EN HAUT)
# -----------------------------
auth_bp = Blueprint("auth", __name__)

# -----------------------------
# 🟡 STOCKAGE TOKEN (temporaire)
# -----------------------------
reset_tokens = {}

# -----------------------------
# 📧 MAILHOG FUNCTION
# -----------------------------
def send_email(to_email, subject, body):
    try:
        print("Préparation email...")

        # 🔥 EmailMessage (meilleur que MIMEText ici)
        msg = EmailMessage()

        msg["From"] = "no-reply@test.com"
        msg["To"] = to_email

        # 🔥 FORCER UTF-8 propre
        msg["Subject"] = subject

        msg.set_content(body, subtype="plain", charset="utf-8")

        print("Connexion SMTP...")
        server = smtplib.SMTP("127.0.0.1", 1025)
        server.set_debuglevel(1)
        server.ehlo()

        print("Envoi...")
        server.send_message(msg)

        server.quit()
        print("Email envoyé ✅")

    except Exception as e:
        print("Erreur email:", e)

# -----------------------------
#  REGISTER
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

    if not email or not password:
        return jsonify({"error": "Email et mot de passe requis"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Email déjà utilisé"}), 400

    new_user = User(
        first_name=first_name,
        last_name=last_name,
        email=email,
        password=generate_password_hash(password),
        phone=phone
    )

    db.session.add(new_user)
    db.session.commit()

    # 📧 Email bienvenue
    send_email(
        email,
        "Bienvenue 🎉",
        f"Bonjour {first_name}, votre compte a été créé avec succès !"
    )

    return jsonify({"message": "Compte créé avec succès ✅"}), 201

# -----------------------------
# 🔵 LOGIN
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
# 📧 FORGOT PASSWORD
# -----------------------------
@auth_bp.route("/forgot-password", methods=["POST"])
def forgot_password():
    data = request.get_json()
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

    return jsonify({"message": "Email envoyé 📧"})

# -----------------------------
# 🔑 RESET PASSWORD
# -----------------------------
@auth_bp.route("/reset-password/<token>", methods=["POST"])
def reset_password(token):

    if token not in reset_tokens:
        return jsonify({"error": "Token invalide"}), 400

    data = request.get_json()
    new_password = data.get("password")

    user_id = reset_tokens[token]
    user = User.query.get(user_id)

    user.password = generate_password_hash(new_password)
    db.session.commit()

    del reset_tokens[token]

    return jsonify({"message": "Mot de passe mis à jour ✅"})