import { useNavigate } from "react-router-dom";
import "../CSS/Sidebar.css";

function Sidebar() {
  const navigate = useNavigate();
const handleLogout = () => {
     localStorage.removeItem("token");

    navigate("/");
  };
 
  return (
    <div className="sidebar">
      <h2 className="sidebar-title">Admin Panel</h2>

      <ul className="sidebar-links">
        <li onClick={() => navigate("/admin")}>📊 Dashboard</li>
        <li onClick={() => navigate("/admin/products")}>📦 Produits</li>
        <li onClick={() => navigate("/admin/users")}>👤 Utilisateurs</li>
        <li onClick={() => navigate("/admin/settings")}>⚙️ Paramètres</li>
      </ul>
      <button className="btn logout" onClick={handleLogout}>
          Déconnexion 
          </button>
    </div>
  );
}

export default Sidebar;