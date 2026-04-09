from flask import Flask
from flask_cors import CORS
from flask_migrate import Migrate
from flask_mail import Mail
from models import db

# Import des blueprints
from routes.products import products_bp
from routes.auth import auth_bp
from routes.recommendation import recommend_bp
from routes.chatbot import chatbot_bp

# Initialisation de l'app
app = Flask(__name__)

# CORS (connexion React)
CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}})

# 🔵 Configuration base de données
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///database.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

#  Configuration  (MailHog)
app.config["MAIL_SERVER"] = "localhost"
app.config["MAIL_PORT"] = 1025
app.config["MAIL_USERNAME"] = ""
app.config["MAIL_PASSWORD"] = ""
app.config["MAIL_DEFAULT_SENDER"] = "noreply@test.com"

#  Secret key (important pour tokens plus tard)
app.config["SECRET_KEY"] = "super-secret-key"

# Initialisation extensions
db.init_app(app)
migrate = Migrate(app, db)
mail = Mail(app)

#  Enregistrer les routes
app.register_blueprint(products_bp)
app.register_blueprint(auth_bp)
app.register_blueprint(recommend_bp)
app.register_blueprint(chatbot_bp)


@app.route("/")
def home():
    return {"message": "API is working 🚀"}

# 🔵 Création DB (si elle n'existe pas)
with app.app_context():
    db.create_all()

# cer serveur
if __name__ == "__main__":
    app.run(debug=True)