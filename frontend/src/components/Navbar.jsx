import { Link, useNavigate } from "react-router-dom";
import "../CSS/Navbar.css";

function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
     localStorage.removeItem("token");

    navigate("/");
  };

  return (
    <nav className="navbar">
      <div className="navbar-content">
        
        <div className="navbar-logo">
          <Link to="/" style={{ color: "white", textDecoration: "none" }}>
            🛒 E-Shop
          </Link>
        </div>

        <ul className="navbar-links">
          <li>
            <Link to="/Home">Home</Link>
          </li>
         <li>
            <Link to="/favorites">Favorites</Link>
          </li>
          <li>
            <Link to="/panier">Panier</Link>
          </li>

        </ul>

        <div className="navbar-actions">
          <button className="btn logout" onClick={handleLogout}>
          Déconnexion 
          </button>
        </div>

      </div>
    </nav>
  );
}

export default Navbar