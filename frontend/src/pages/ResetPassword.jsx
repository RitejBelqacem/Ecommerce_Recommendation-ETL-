import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../CSS/Password.css";

function ResetPassword() {
  const [password, setPassword] = useState("");
  const { token } = useParams();
  const navigate = useNavigate();

  const handleReset = async () => {
    const res = await fetch(
      `http://127.0.0.1:5000/reset-password/${token}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ password })
      }
    );

    const data = await res.json();
    alert(data.message || data.error);

    if (res.ok) navigate("/");
  };

  return (
    <div className="forgot-container">
      <div className="forgot-form">
        <h2>Nouveau mot de passe</h2>

        <input
          type="password"
          placeholder="Nouveau mot de passe"
          onChange={e => setPassword(e.target.value)}
        />

        <button 
          className="btn-secondary" 
          onClick={() => navigate("/")}
        >
          Enregistrer

       </button>
      </div>
    </div>
  );
}

export default ResetPassword;