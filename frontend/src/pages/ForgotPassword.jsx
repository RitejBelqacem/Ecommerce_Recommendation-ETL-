import { useState } from "react";
import "../CSS/Password.css";

function ForgotPassword() {
  const [email, setEmail] = useState("");

  const handleSend = async () => {
    const res = await fetch("http://127.0.0.1:5000/forgot-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email })
    });

    const data = await res.json();
    alert(data.message || data.error);
  };

  return (
    <div className="forgot-container">
      <div className="forgot-form">
        <h2>Reset Password</h2>

        <input
          type="email"
          placeholder="Votre email"
          onChange={e => setEmail(e.target.value)}
        />

        <button onClick={handleSend}>
          Envoyer email
        </button>
      </div>
    </div>
  );
}

export default ForgotPassword;