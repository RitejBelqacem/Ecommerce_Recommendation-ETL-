import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../CSS/Register.css";

function Register() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  const handleRegister = async () => {
    // 🟡 Validation simple
    if (!email || !password || !firstName) {
      setMessage("⚠️ Veuillez remplir les champs obligatoires");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("http://127.0.0.1:5000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          email,
          password,
          phone
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || "Erreur lors de l'inscription");
        setLoading(false);
        return;
      }

      // 🟢 Succès
      setMessage("✅ Compte créé ! Vérifiez votre email ");

      // ⏳ attendre 3s puis rediriger
      setTimeout(() => {
        navigate("/");
      }, 3000);

    } catch (err) {
      console.error(err);
      setMessage("❌ Erreur serveur");
    }

    setLoading(false);
  };

  return (
    <div className="register-container">
      <div className="register-form">
        <h2>Créer un compte</h2>

        {message && <p className="message">{message}</p>}

        <input 
          placeholder="Prénom *" 
          value={firstName} 
          onChange={e => setFirstName(e.target.value)} 
        />

        <input 
          placeholder="Nom" 
          value={lastName} 
          onChange={e => setLastName(e.target.value)} 
        />

        <input 
          type="email" 
          placeholder="Email *" 
          value={email} 
          onChange={e => setEmail(e.target.value)} 
        />

        <input 
          type="password" 
          placeholder="Mot de passe *" 
          value={password} 
          onChange={e => setPassword(e.target.value)} 
        />

        <input 
          placeholder="Téléphone" 
          value={phone} 
          onChange={e => setPhone(e.target.value)} 
        />

        <button 
          className="btn-primary" 
          onClick={handleRegister}
          disabled={loading}
        >
          {loading ? "Inscription..." : "S'inscrire"}
        </button>

        <p>Déjà un compte ?</p>

        <button 
          className="btn-secondary" 
          onClick={() => navigate("/")}
        >
          Se connecter
        </button>
      </div>
    </div>
  );
}

export default Register;