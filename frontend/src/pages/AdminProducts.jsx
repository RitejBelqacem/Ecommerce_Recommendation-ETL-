import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import "../CSS/Products.css";
import "../CSS/ProductsList.css";

function AdminProducts() {
  const { category } = useParams();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);

  // MODAL STATES
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "",
    brand: "",
    price: "",
    old_price: "",
    stock: "",
    image: ""
  });

  // 🔥 GET PRODUCTS
  const fetchProducts = () => {
    fetch("http://127.0.0.1:5000/products")
      .then(res => res.json())
      .then(data => {
        if (category === "all") {
          setProducts(data);
        } else {
          const filtered = data.filter(
            p => p.category.toLowerCase() === category.toLowerCase()
          );
          setProducts(filtered);
        }
      });
  };

  useEffect(() => {
    fetchProducts();
  }, [category]);

  // ❌ DELETE PRODUCT
  const handleDelete = (id) => {
    if (!window.confirm("❌ Voulez-vous vraiment supprimer ce produit ?")) return;

    fetch(`http://127.0.0.1:5000/products/${id}`, {
      method: "DELETE"
    })
      .then(res => res.json())
      .then(() => fetchProducts());
  };

  // ✏️ OPEN MODAL + PRE-FILL FORM
  const handleEdit = (product) => {
    setSelectedProduct(product);

    setForm({
      name: product.name || "",
      description: product.description || "",
      category: product.category || "",
      brand: product.brand || "",
      price: product.price || "",
      old_price: product.old_price || "",
      stock: product.stock || "",
      image: product.image || ""
    });

    setIsModalOpen(true);
  };

  // 🖊 HANDLE INPUT CHANGE
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  // 💾 UPDATE PRODUCT
  const handleUpdate = () => {
    fetch(`http://127.0.0.1:5000/products/${selectedProduct.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        ...form,
        price: parseFloat(form.price),
        old_price: parseFloat(form.old_price),
        stock: parseInt(form.stock)
      })
    })
      .then(res => res.json())
      .then(() => {
        setIsModalOpen(false);
        fetchProducts();
      });
  };

  return (
    <div>
      <Sidebar />

      <div className="main-content">

        {/* BUTTONS */}
        <div className="buttons-container">
          <button onClick={() => navigate("/admin/products/all")}>
            📋 Tous les produits
          </button>

          <button onClick={() => navigate("/admin/products/electronics")}>
            💻 Électronique
          </button>

          <button onClick={() => navigate("/admin/products/clothes")}>
            👕 Vêtements
          </button>
        </div>

        {/* TITLE */}
        <h1 style={{ marginTop: "30px" }}>
          Produits - {category}
        </h1>

        {/* PRODUCTS */}
        <div className="products-grid">
          {products.map(product => (
            <div className="product-card" key={product.id}>

              <h3>{product.name}</h3>
              <p>💰 {product.price} TND</p>

              <div className="actions">

                <button
                  className="edit-btn"
                  onClick={() => handleEdit(product)}
                >
                  ✏️ Modifier
                </button>

                <button
                  className="delete-btn"
                  onClick={() => handleDelete(product.id)}
                >
                  ❌ Supprimer
                </button>

              </div>
            </div>
          ))}
        </div>

        {/* ================= MODAL ================= */}
        {isModalOpen && (
          <div className="modal-overlay">

            <div className="modal">

              <h2>✏️ Modifier produit</h2>

              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Nom"
              />

              <input
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Description"
              />

              <input
                name="category"
                value={form.category}
                onChange={handleChange}
                placeholder="Catégorie"
              />

              <input
                name="brand"
                value={form.brand}
                onChange={handleChange}
                placeholder="Marque"
              />

              <input
                name="price"
                type="number"
                value={form.price}
                onChange={handleChange}
                placeholder="Prix"
              />

              <input
                name="old_price"
                type="number"
                value={form.old_price}
                onChange={handleChange}
                placeholder="Ancien prix"
              />

              <input
                name="stock"
                type="number"
                value={form.stock}
                onChange={handleChange}
                placeholder="Stock"
              />

              <input
                name="image"
                value={form.image}
                onChange={handleChange}
                placeholder="Image URL"
              />

              <div className="modal-actions">

                <button className="btn-primary" onClick={handleUpdate}>
                  💾 Sauvegarder
                </button>

                <button
                  className="btn-secondary"
                  onClick={() => setIsModalOpen(false)}
                >
                  ❌ Fermer
                </button>

              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default AdminProducts;