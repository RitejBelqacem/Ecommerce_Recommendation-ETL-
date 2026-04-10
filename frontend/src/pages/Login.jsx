import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../CSS/Login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await fetch("http://127.0.0.1:5000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Erreur de connexion");
        return;
      }

      if (data.user_id) {
        localStorage.setItem("user_id", data.user_id);
        localStorage.setItem("role", data.role);

        if (data.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/home");
        }
      } else {
        alert("Réponse invalide du serveur");
      }

    } catch (err) {
      console.error(err);
      alert("Erreur serveur");
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <h2>Login</h2>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />

        <button className="btn-primary" onClick={handleLogin}>
          Se connecter
        </button>

        <p 
          style={{ cursor: "pointer", color: "blue" }} 
          onClick={() => navigate("/forgot-password")}
        >
          Mot de passe oublié ?
        </p>

        <p>Pas de compte ?</p>

        <button className="btn-secondary" onClick={() => navigate("/register")}>
          Créer un compte
        </button>
      </div>
    </div>
  );
}

export default Login;