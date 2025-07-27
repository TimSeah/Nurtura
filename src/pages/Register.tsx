// src/pages/Register.tsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Register.css";

export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      // Check password length
      alert("Password must be at least 8 characters long");
      return;
    }
    const hasNumber = /\d/.test(password); // check if password contains a number
    const hasLetter = /[a-zA-Z]/.test(password); // check if password contains a letter
    if (!hasNumber || !hasLetter) {
      alert("Password must contain at least one letter and one number");
      return;
    }
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    if (res.ok) {
      alert("Registration successful! Please log in.");
      navigate("/login");
    } else {
      const err = await res.json();
      alert(`Registration failed: ${err.message}`);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h1>Register</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Register</button>
        </form>
        <p className="register-footer">
          Already have an account?{" "}
          <Link to="/login" className="login-link">
            Log in
          </Link>
        </p>

      </div>
    </div>
  );
}
