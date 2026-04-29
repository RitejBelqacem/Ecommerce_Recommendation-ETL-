import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import "../CSS/AddProduct.css";
import { FaLaptop, FaTshirt, FaHome, FaBasketballBall } from "react-icons/fa";
import { MdOutlineSportsSoccer } from "react-icons/md";
import { GiLipstick } from "react-icons/gi";

function Products() {
  const navigate = useNavigate();

  return (
    <div>
      <Sidebar />

      <div className="main-content">

        <h1 className="title">Gestion des Produits</h1>

        <div className="center-container">

  <button
    className="btn add"
    onClick={() => navigate("/admin/add-product")}
  >
    ➕ Ajouter Produit
  </button>

  <button
    className="btn"
    onClick={() => navigate("/admin/products/all")}
  >
    📋 Tous les produits
  </button>

  <button
    className="btn"
    onClick={() => navigate("/admin/products/electronics")}
  >
    <FaLaptop /> Electronics
  </button>

  <button
    className="btn"
    onClick={() => navigate("/admin/products/sports")}
  >
    <FaBasketballBall /> Sports
  </button>

  <button
    className="btn"
    onClick={() => navigate("/admin/products/clothing")}
  >
    <FaTshirt /> Clothing
  </button>

  <button
    className="btn"
    onClick={() => navigate("/admin/products/home")}
  >
    <FaHome /> Home
  </button>

  <button
    className="btn"
    onClick={() => navigate("/admin/products/beauty")}
  >
    <GiLipstick /> Beauty
  </button>

</div>
        {/* CSS LOCAL */}
        <style>{`
          .main-content {
            margin-left: 220px;
            padding: 40px;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
          }

          .title {
            margin-top: 30px;
            margin-bottom: 20px;
            color: #333;
            font-size: 30px;
          }

          /* CENTRAGE PLUS PRO */
          .center-container {
            height: 75vh;
            width: 100%;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            gap: 25px;
          }

          /* BOUTONS STYLE CARDS (comme ton CSS) */
          .btn {
            width: 320px; /* 🔥 plus large */
            padding: 22px;
            font-size: 17px;
            border: none;
            border-radius: 10px;
            cursor: pointer;

            background-color: white;
            color: #333;

            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            transition: all 0.3s ease;

            display: flex;
            justify-content: center;
            align-items: center;
            text-align: center;
          }

          .btn:hover {
            transform: translateY(-6px);
            background-color: #4a90e2;
            color: white;
          }

          /* ADD BUTTON (VERT comme ton CSS) */
          .add {
            background-color: #573ff5;
            color: white;
            font-weight: bold;
          }

          .add:hover {
            background-color: #573ff5;
            color: white;
          }

          /* RESPONSIVE */
          @media (max-width: 768px) {
            .main-content {
              margin-left: 0;
              padding: 20px;
            }

            .btn {
              width: 90%;
            }
          }
        `}</style>

      </div>
    </div>
  );
}

export default Products;