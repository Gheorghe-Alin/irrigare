import React, { useState } from "react";
import axios from "axios";

function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async () => {
    try {
      const res = await axios.post("/api/login", { username, password });

      if (res.status === 200 && res.data.success) {
        localStorage.setItem("auth", "true");
        setErrorMsg("");
        onLogin();
      } else {
        setErrorMsg("Date incorecte. Încearcă din nou.");
      }
    } catch (err) {
      setErrorMsg("Eroare la autentificare.");
    }
  };

  return (
    <div style={{ padding: 40, maxWidth: 400, margin: "auto" }}>
      <h2>Autentificare</h2>

      <div>
        <label>Utilizator:</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{ width: "100%", marginBottom: 10 }}
        />
      </div>

      <div>
        <label>Parolă:</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: "100%", marginBottom: 10 }}
        />
      </div>

      <button onClick={handleLogin} style={{ width: "100%" }}>
        Login
      </button>

      {errorMsg && <p style={{ color: "red", marginTop: 10 }}>{errorMsg}</p>}
    </div>
  );
}

export default Login;
