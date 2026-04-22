import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { FaTrash } from "react-icons/fa";
import "../CSS/Panier.css";

function Panier() {
  const [cart, setCart] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    nom: "",
    prenom: "",
    phone: "",
    address: ""
  });

  const userId = localStorage.getItem("user_id");

  // =========================
  // LOAD CART FROM DB
  // =========================
  const loadCart = () => {
    if (!userId) return;

    fetch(`http://127.0.0.1:5000/panier/${userId}`)
      .then(res => res.json())
      .then(data => setCart(data));
  };

  useEffect(() => {
    loadCart();
  }, [userId]);

  // =========================
  // INCREASE QTY
  // =========================
  const increaseQty = (id) => {
    fetch("http://127.0.0.1:5000/panier/update", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: userId,
        product_id: id,
        action: "increase"
      })
    }).then(loadCart);
  };

  // =========================
  // DECREASE QTY
  // =========================
  const decreaseQty = (id) => {
    fetch("http://127.0.0.1:5000/panier/update", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: userId,
        product_id: id,
        action: "decrease"
      })
    }).then(loadCart);
  };

  // =========================
  // REMOVE PRODUCT
  // =========================
  const removeProduct = (id) => {
    fetch("http://127.0.0.1:5000/panier", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: userId,
        product_id: id
      })
    }).then(loadCart);
  };

  // =========================
  // TOTAL
  // =========================
  const total = cart.reduce((sum, item) => {
    return sum + item.price * (item.quantity || 1);
  }, 0);

  // =========================
  // COMMANDER
  // =========================
  const handleOrder = () => {
    fetch("http://127.0.0.1:5000/commande", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: userId,
        ...form,
        total,
        cart
      })
    })
      .then(res => res.json())
      .then(() => {
        alert("Commande envoyée !");
        setCart([]);
        setShowModal(false);
      });
  };

  return (
    <div>
      <Navbar />

      <div className="panier-grid">

        {cart.length === 0 ? (
          <h2 className="empty">🛒 Votre panier est vide</h2>
        ) : (
          <>
            {cart.map(item => (
              <div className="panier-card" key={item.id}>
                <div className="panier-info">
                  <h3>{item.name}</h3>
                  <p>{item.category}</p>
                  <p className="price">{item.price} TND</p>

                  <div className="qty">
                    <button onClick={() => decreaseQty(item.id)}>-</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => increaseQty(item.id)}>+</button>
                  </div>
                </div>

                <FaTrash
                  className="trash"
                  onClick={() => removeProduct(item.id)}
                />
              </div>
            ))}

            {/* TOTAL + BUTTON */}
            <div className="total-bar">
              <div className="total-price">
                Total: <span>{total} TND</span>
              </div>

              <button
                className="order-btn"
                onClick={() => setShowModal(true)}
              >
                Commander
              </button>
            </div>
          </>
        )}
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="modal">
          <div className="modal-content">

            <h2>Commande</h2>

            <input
              placeholder="Nom"
              onChange={e => setForm({ ...form, nom: e.target.value })}
            />

            <input
              placeholder="Prénom"
              onChange={e => setForm({ ...form, prenom: e.target.value })}
            />

            <input
              placeholder="Téléphone"
              onChange={e => setForm({ ...form, phone: e.target.value })}
            />

            <input
              placeholder="Adresse"
              onChange={e => setForm({ ...form, address: e.target.value })}
            />

            <button className="validate-btn" onClick={handleOrder}>
              Valider commande
            </button>

            <button className="cancel-btn" onClick={() => setShowModal(false)}>
              Annuler
            </button>

          </div>
        </div>
      )}
    </div>
  );
}

export default Panier;