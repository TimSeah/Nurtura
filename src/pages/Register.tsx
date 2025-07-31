// src/pages/Register.tsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { bannedWords } from "../utils/bannedWords";
import "./Register.css";
import { set } from "date-fns";

export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // for toggling password visibility
  const [errorMessage, setErrorMessage] = useState(""); // for handling form errors, e.g. invalid password
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const isValidUsername = /^[a-zA-Z0-9_]+$/.test(username);

    // check if username contains only alphanumeric characters and underscores
    if (!isValidUsername) {
      setErrorMessage(
        "Username can only contain letters, numbers, and underscores."
      );
      return;
    }

    // Check if username is appropriate

    // Normalize the username
    const normalizedUsername = username
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]/g, ""); // removes special characters and spaces

    // Build regex and test possible inappropriate patterns
    const pattern = new RegExp(`(${bannedWords.join("|")})`, "i");
    const containsOffensiveWord = pattern.test(normalizedUsername);

    if (containsOffensiveWord) {
      setErrorMessage("Username is inappropriate.");
      return;
    }

    if (password.length < 8) {
      // Check password length
      //alert("Password must be at least 8 characters long");
      setErrorMessage("Password must be at least 8 characters long");
      return;
    }
    const hasNumber = /\d/.test(password); // check if password contains a number
    const hasLetter = /[a-zA-Z]/.test(password); // check if password contains a letter
    if (!hasNumber || !hasLetter) {
      //alert("Password must contain at least one letter and one number");
      setErrorMessage(
        "Password must contain at least one letter and one number"
      );
      return;
    }
    // submit registration
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
      //alert(`Registration failed: ${err.message}`);
      setErrorMessage(`Registration failed: ${err.message}`);
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
          <div className="input-wrapper password-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span
              className="password-toggle"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </span>
          </div>
          {errorMessage && (
            <span className="error-message">{errorMessage}</span>
          )}
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
