import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";

function Products() {
  const navigate = useNavigate();

  return (
    <div>
      <Sidebar />

      <div className="main-content">
        <h1>📦 Gestion des Produits</h1>

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

          <button 
            className="add-btn"
            onClick={() => navigate("/admin/add-product")}
          >
            ➕ Ajouter Produit
          </button>

        </div>
      </div>
    </div>
  );
}

export default Products;