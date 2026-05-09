// src/components/RecommendationSection.jsx
import { useEffect, useState } from "react";
import { FaHeart, FaShoppingCart, FaStar } from "react-icons/fa";
import "../CSS/RecommendationSection.css";

function RecommendationSection({
  onToggleFavorite,
  onToggleCart,
  favorites,
  cart,
}) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const userId = localStorage.getItem("user_id");

  useEffect(() => {
    if (!userId) return;

    fetch(`http://127.0.0.1:5000/recommendations/${userId}`)
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [userId]);

  if (!userId) return null;

  return (
    <section className="recommendation-section">
      <div className="recommendation-header">
        <h2>
          <FaStar className="title-icon" />
          Recommandé pour vous
        </h2>
        <p>Découvrez des produits adaptés à vos préférences</p>
      </div>

      {loading ? (
        <div className="loading">Chargement des recommandations...</div>
      ) : products.length === 0 ? (
        <div className="empty-state">
          Aucune recommandation disponible.
        </div>
      ) : (
        <div className="products-grid">
          {products.map((product) => {
            const isFavorite = favorites.some(
              (f) => f.id === product.id
            );

            const isInCart = cart.some(
              (c) => c.id === product.id
            );

            return (
              <div className="product-card" key={product.id}>
               

                <div className="product-info">
                  <span className="category-badge">
                    {product.category}
                  </span>

                  <h3>{product.name}</h3>

                  <p className="price">
                    {product.price} TND
                  </p>

                  <div className="actions">
                    <button
                      className={`icon-btn favorite-btn ${
                        isFavorite ? "active-fav" : ""
                      }`}
                      onClick={() => onToggleFavorite(product.id)}
                    >
                      <FaHeart />
                    </button>

                    <button
                      className={`icon-btn cart-btn ${
                        isInCart ? "active-cart" : ""
                      }`}
                      onClick={() => onToggleCart(product.id)}
                    >
                      <FaShoppingCart />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default RecommendationSection;