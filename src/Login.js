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
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Autentificare</h2>

        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-1">
            Utilizator
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-1">Parolă</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {errorMsg && <p className="text-red-500 text-sm mb-4">{errorMsg}</p>}

        <button
          onClick={handleLogin}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition duration-200"
        >
          Login
        </button>
      </div>
    </div>
  );
}

export default Login;
