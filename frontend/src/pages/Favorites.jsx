import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { FaHeart } from "react-icons/fa";
import "../CSS/Favorites.css";

function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const userId = localStorage.getItem("user_id");

  // =========================
  // LOAD FAVORITES
  // =========================
  const loadFavorites = () => {
    fetch(`http://127.0.0.1:5000/favoris/${userId}`)
      .then(res => res.json())
      .then(data => setFavorites(data));
  };

  useEffect(() => {
    if (!userId) return;
    loadFavorites();
  }, [userId]);

  // =========================
  // REMOVE FAVORITE
  // =========================
  const removeFavorite = (productId) => {
    fetch("http://127.0.0.1:5000/favoris", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        user_id: userId,
        product_id: productId
      })
    }).then(loadFavorites);
  };

  return (
    <div>
      <Navbar />

      <div className="favorites-grid">

        {favorites.length === 0 ? (
          <h2 style={{ textAlign: "center" }}>
            ❤️ Aucun favori
          </h2>
        ) : (
          favorites.map(product => (
            <div className="favorite-card" key={product.id}>

              <div className="product-info">
                <h3>{product.name}</h3>
                <p>{product.category}</p>
                <p className="price">{product.price} TND</p>
              </div>

              <FaHeart
                onClick={() => removeFavorite(product.id)}
                style={{ color: "red", cursor: "pointer" }}
              />

            </div>
          ))
        )}

      </div>
    </div>
  );
}

export default Favorites;