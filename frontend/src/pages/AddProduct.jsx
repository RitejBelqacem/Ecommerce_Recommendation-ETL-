import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../CSS/AddProduct.css";

function AddProduct() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [brand, setBrand] = useState("");
  const [price, setPrice] = useState("");
  const [oldPrice, setOldPrice] = useState("");
  const [stock, setStock] = useState("");
  const [image, setImage] = useState("");

  const navigate = useNavigate();

  const handleSubmit = () => {
    fetch("http://127.0.0.1:5000/products", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name,
        description,
        category,
        brand,
        price: parseFloat(price),
        old_price: parseFloat(oldPrice),
        stock: parseInt(stock),
        image
      })
    })
      .then(res => res.json())
      .then(data => {
        alert(data.message);
        navigate("/admin/products");
      });
  };

  return (
    <div className="add-container">
      <div className="add-form">
        <h2>➕ Ajouter un produit</h2>

        {/* Nom */}
        <input
          placeholder="Nom du produit"
          value={name}
          onChange={e => setName(e.target.value)}
        />

        {/* Description */}
        <input
          placeholder="Description"
          value={description}
          onChange={e => setDescription(e.target.value)}
        />

        {/* Catégorie */}
        <select
          value={category}
          onChange={e => setCategory(e.target.value)}
        >
          <option value="">-- Choisir une catégorie --</option>
          <option value="Electronique">💻 Électronique</option>
          <option value="Vetements">👕 Vêtements</option>
          <option value="other">📦 Autre</option>
        </select>

        {/* Marque */}
        <input
          placeholder="Marque"
          value={brand}
          onChange={e => setBrand(e.target.value)}
        />

        {/* Prix */}
        <input
          type="number"
          placeholder="Prix"
          value={price}
          onChange={e => setPrice(e.target.value)}
        />

        {/* Ancien prix */}
        <input
          type="number"
          placeholder="Ancien prix (optionnel)"
          value={oldPrice}
          onChange={e => setOldPrice(e.target.value)}
        />

        {/* Stock */}
        <input
          type="number"
          placeholder="Stock"
          value={stock}
          onChange={e => setStock(e.target.value)}
        />

        {/* Image */}
        <input
          placeholder="URL image"
          value={image}
          onChange={e => setImage(e.target.value)}
        />

        {/* Bouton */}
        <button className="btn-primary" onClick={handleSubmit}>
          Ajouter
        </button>

        <button
          className="btn-secondary"
          onClick={() => navigate("/admin/products")}
        >
          Annuler
        </button>
      </div>
    </div>
  );
}

export default AddProduct;