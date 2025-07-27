import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import logo from "./dashboard/components/pics/WhiteKoala.png"; // adjust path as needed
import "./Login.css";

export default function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (await login(username, password)) {
      navigate("/");
    } else {
      alert("Invalid credentials");
    }
  };

  return (
    <div className="login-container">
      {/* ← NEW HEADER */}
      <div className="login-header">
        <div className="login-title-with-icon">
          <img src={logo} alt="Nurtura Logo" className="login-logo-icon" />
          <h2 className="login-welcome">Welcome to Nurtura!</h2>
        </div>
      </div>

      <div className="login-card">
        <h1 className="login-title">Log In</h1>
        <form onSubmit={handleSubmit} className="login-form">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="login-input"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="login-input"
          />
          <button type="submit" className="login-button">
            Log In
          </button>
        </form>
        <p className="login-footer">
          Don’t have an account?{" "}
          <Link to="/register" className="login-register-link">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}
