from flask_sqlalchemy import SQLAlchemy
db = SQLAlchemy()
from .user      import User
from .product   import Product
from .commande  import Commande
from .favoris   import Favoris
from .panier    import Panier
from .product_view import ProductView  