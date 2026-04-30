from flask import Flask, jsonify
from flask_cors import CORS
from flask_migrate import Migrate
from flask_mail import Mail
from models import db
from flask import send_from_directory
import os
# Import des blueprints
from routes.products import products_bp
from routes.auth import auth_bp
from routes.recommendation import recommend_bp
from routes.panier import panier_bp
from routes.commande import commande_bp
from routes.favoris import favoris_bp
from etl.pipeline import run_etl 
from routes.activity import activity_bp
from routes.analytics import analytics_bp
from etl.extract import extract_product_views
from etl.transform import transform_product_views


# Initialisation de l'app
app = Flask(__name__)

# CORS (connexion React)
CORS(app, origins=[
    "http://localhost:5173",
    "http://127.0.0.1:5173"
])
# 🔵 Configuration base de données
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///database.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

#  Configuration  (MailHog)
app.config["MAIL_SERVER"] = "localhost"
app.config["MAIL_PORT"] = 1025
app.config["MAIL_USERNAME"] = ""
app.config["MAIL_PASSWORD"] = ""
app.config["MAIL_DEFAULT_SENDER"] = "E_shop@eshop.com"

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
app.register_blueprint(panier_bp)
app.register_blueprint(commande_bp)
app.register_blueprint(favoris_bp)
app.register_blueprint(activity_bp)
app.register_blueprint(analytics_bp) 
@app.route("/")
def home():
    return {"message": "API is working 🚀"}

# 🔵 Création DB (si elle n'existe pas)
with app.app_context():
    db.create_all()


@app.route("/api/etl/run", methods=["POST"])
def trigger_etl():
    result = run_etl()
    return jsonify(result)

@app.route("/run-etl", methods=["GET"])
def run_etl_route():
    try:
        run_etl()  # use the one already imported at the top
        return jsonify({"message": "ETL exécuté avec succès ✅"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route("/etl_output/<path:filename>")
def serve_etl_output(filename):
    return send_from_directory(
        os.path.join(os.getcwd(), "etl_output"),
        filename
    )

@app.route("/api/kpis/views")
def kpis_views():
    df = extract_product_views("instance/database.db")
    kpis = transform_product_views(df)
    return jsonify(kpis)

# cer serveur
if __name__ == "__main__":
    app.run(debug=True)

