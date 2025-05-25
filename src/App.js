import React, { useState, useEffect } from "react";
import Login from "./Login";
import MainPage from "./MainPage";

function App() {
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    const auth = localStorage.getItem("auth");
    setIsAuth(auth === "true");
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("auth");
    setIsAuth(false);
  };

  return isAuth ? (
    <MainPage onLogout={handleLogout} />
  ) : (
    <Login onLogin={() => setIsAuth(true)} />
  );
}

export default App;
