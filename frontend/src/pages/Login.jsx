import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../CSS/Login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await fetch("http://127.0.0.1:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Erreur de connexion");
        return;
      }

      localStorage.setItem("user_id", data.user_id);
      localStorage.setItem("role", data.role);

      navigate(data.role === "admin" ? "/admin" : "/home");
    } catch (err) {
      alert("Erreur serveur");
    }
  };

  return (
    <div className="login-page">

      {/* IMAGE À GAUCHE */}
      <div className="login-left"></div>

      {/* FORMULAIRE */}
      <div className="login-right">

        <h2 className="login-title">Connexion</h2>

        {/* Email */}
        <div className="input-wrap">
          <span className="input-icon">👤</span>
          <input
            type="text"
            placeholder="Adresse email"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
        </div>

        {/* Password */}
        <div className="input-wrap">
          <span className="input-icon">🔒</span>
          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </div>

        {/* Options */}
        <div className="login-row">
          <label>
            <input
              type="checkbox"
              checked={remember}
              onChange={e => setRemember(e.target.checked)}
            />
            Se souvenir de moi
          </label>

          <span
            className="forgot"
            onClick={() => navigate("/forgot-password")}
          >
            Mot de passe oublié ?
          </span>
        </div>

        {/* Bouton login */}
        <button className="login-btn" onClick={handleLogin}>
          Se connecter
        </button>

        {/* Lien inscription */}
        <p className="signup-text">
          Vous n’avez pas de compte ?{" "}
          <span onClick={() => navigate("/register")}>
            Créer un compte
          </span>
        </p>

      </div>
    </div>
  );
}

export default Login;