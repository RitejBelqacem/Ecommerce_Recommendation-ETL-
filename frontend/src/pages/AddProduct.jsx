import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../CSS/AddProduct.css";

import {
  FaBox,
  FaAlignLeft,
  FaTags,
  FaIndustry,
  FaDollarSign,
  FaWarehouse,
  FaImage,
  FaPlus,
  FaTimes
} from "react-icons/fa";

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
      headers: { "Content-Type": "application/json" },
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
        <h2><FaPlus /> Ajouter un produit</h2>

        {/* NAME */}
        <div className="input-box">
          <FaBox className="icon" />
          <input
            placeholder="Nom du produit"
            value={name}
            onChange={e => setName(e.target.value)}
          />
        </div>

        {/* DESCRIPTION */}
        <div className="input-box">
          <FaAlignLeft className="icon" />
          <input
            placeholder="Description"
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
        </div>

        {/* CATEGORY */}
        <div className="input-box">
          <FaTags className="icon" />
          <select value={category} onChange={e => setCategory(e.target.value)}>
            <option value="">Catégorie</option>
            <option value="Electronics">💻 Electronics</option>
            <option value="Sports">⚽ Sports</option>
            <option value="Clothing">👕 Clothing</option>
            <option value="Home">🏠 Home</option>
            <option value="Beauty">💄 Beauty</option>
          </select>
        </div>

        {/* BRAND */}
        <div className="input-box">
          <FaIndustry className="icon" />
          <input
            placeholder="Marque"
            value={brand}
            onChange={e => setBrand(e.target.value)}
          />
        </div>

        {/* PRICE */}
        <div className="input-box">
          <FaDollarSign className="icon" />
          <input
            type="number"
            placeholder="Prix"
            value={price}
            onChange={e => setPrice(e.target.value)}
          />
        </div>

        {/* OLD PRICE */}
        <div className="input-box">
          <FaDollarSign className="icon" />
          <input
            type="number"
            placeholder="Ancien prix"
            value={oldPrice}
            onChange={e => setOldPrice(e.target.value)}
          />
        </div>

        {/* STOCK */}
        <div className="input-box">
          <FaWarehouse className="icon" />
          <input
            type="number"
            placeholder="Stock"
            value={stock}
            onChange={e => setStock(e.target.value)}
          />
        </div>

        {/* IMAGE */}
        <div className="input-box">
          <FaImage className="icon" />
          <input
            placeholder="URL image"
            value={image}
            onChange={e => setImage(e.target.value)}
          />
        </div>

        {/* BUTTONS */}
        <button className="btn-primary" onClick={handleSubmit}>
          Ajouter
        </button>

        <button className="btn-secondary" onClick={() => navigate("/admin/products")}>
          <FaTimes /> Annuler
        </button>
      </div>
    </div>
  );
}

export default AddProduct;