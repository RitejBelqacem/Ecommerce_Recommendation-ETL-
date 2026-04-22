import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { FaHeart, FaShoppingCart } from "react-icons/fa";
import "../CSS/Home.css";

function Home() {
  const [products, setProducts] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [cart, setCart] = useState([]);

  const userId = localStorage.getItem("user_id");

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  // =========================
  // LOAD PRODUCTS
  // =========================
  useEffect(() => {
    fetch("http://127.0.0.1:5000/products")
      .then(res => res.json())
      .then(data => setProducts(data));
  }, []);

  // =========================
  // LOAD FAVORITES FROM DB
  // =========================
  const loadFavorites = () => {
    fetch(`http://127.0.0.1:5000/favoris/${userId}`)
      .then(res => res.json())
      .then(data => setFavorites(data));
  };

  // =========================
  // LOAD CART FROM DB
  // =========================
  const loadCart = () => {
    fetch(`http://127.0.0.1:5000/panier/${userId}`)
      .then(res => res.json())
      .then(data => setCart(data));
  };

  useEffect(() => {
    if (!userId) return;
    loadFavorites();
    loadCart();
  }, [userId]);

  // =========================
  // TOGGLE FAVORITE (DB)
  // =========================
  const toggleFavorite = (productId) => {
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

  // =========================
  // ADD TO CART (DB)
  // =========================
  const toggleCart = (productId) => {
    fetch("http://127.0.0.1:5000/panier", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        user_id: userId,
        product_id: productId
      })
    }).then(loadCart);
  };

  // =========================
  // CHECKS
  // =========================
  const isFavorite = (id) => {
    return favorites.some(item => item.id === id);
  };

  const isInCart = (id) => {
    return cart.some(item => item.id === id);
  };

  // =========================
  // FILTERS
  // =========================
  const categories = [...new Set(products.map(p => p.category))];

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(search.toLowerCase()) &&
    (categoryFilter === "" || product.category === categoryFilter)
  );

  return (
    <div>
      <Navbar />

      <div className="home-container">

        {/* FILTERS */}
        <div className="filters">

          <input
            type="text"
            placeholder="🔍 Rechercher..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-bar"
          />

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="category-select"
          >
            <option value="">Toutes les catégories</option>
            {categories.map((cat, i) => (
              <option key={i} value={cat}>{cat}</option>
            ))}
          </select>

        </div>

        {/* PRODUCTS */}
        <div className="products-grid">

          {filteredProducts.map(product => (
            <div className="product-card" key={product.id}>

              <h3>{product.name}</h3>
              <p>{product.category}</p>
              <p className="price">💰 {product.price} TND</p>

              <div className="icons">

                {/* FAVORITE */}
                <FaHeart
                  onClick={() => toggleFavorite(product.id)}
                  style={{
                    color: isFavorite(product.id) ? "red" : "gray",
                    cursor: "pointer"
                  }}
                />

                {/* CART */}
                <FaShoppingCart
                  onClick={() => toggleCart(product.id)}
                  style={{
                    color: isInCart(product.id) ? "green" : "gray",
                    cursor: "pointer"
                  }}
                />

              </div>

            </div>
          ))}

        </div>

      </div>
    </div>
  );
}

export default Home;