import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { bannedWords } from "../../utils/bannedWords";
import logoBlack from "../login/components/koala-removebg-preview.png";

export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    try {
      const isValidUsername = /^[a-zA-Z0-9_]+$/.test(username);

      // check if username contains only alphanumeric characters and underscores
      if (!isValidUsername) {
        setErrorMessage(
          "Username can only contain letters, numbers, and underscores."
        );
        return;
      }

      // Check if username is appropriate
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
        setErrorMessage("Password must be at least 8 characters long");
        return;
      }
      const hasNumber = /\d/.test(password); // check if password contains a number
      const hasLetter = /[a-zA-Z]/.test(password); // check if password contains a letter
      if (!hasNumber || !hasLetter) {
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
        setErrorMessage(`Registration failed: ${err.message}`);
      }
    } catch (error) {
      setErrorMessage("Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-teal-100 flex flex-col items-center justify-center px-4">
      <div className="text-center">
        <img 
          alt="Nurtura logo, a cute koala" 
          className="mx-auto h-48 w-auto"
          src={logoBlack} 
        />
        <h1 className="mt-2 text-4xl font-bold text-slate-800 font-poppins">Join Nurtura Today!</h1>
        <p className="mt-4 text-lg text-slate-600">Create your account and start caring.</p>
      </div>

      <div className="mt-5 bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-semibold text-center text-slate-700 mb-6">Register</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="sr-only" htmlFor="username">Username</label>
            <input
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 transition-colors"
              id="username"
              name="username"
              placeholder="Username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <div className="relative">
            <label className="sr-only" htmlFor="password">Password</label>
            <input
              className="w-full px-4 py-3 pr-12 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 transition-colors"
              id="password"
              name="password"
              placeholder="Password (min. 8 characters)"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-700"
              onClick={() => setShowPassword((prev) => !prev)}
              disabled={isLoading}
            >
              {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
            </button>
          </div>
          
          {errorMessage && (
            <div className="text-red-500 text-sm text-center bg-red-50 border border-red-200 rounded-lg p-3">
              {errorMessage}
            </div>
          )}

          <div className="text-xs text-slate-500 space-y-1">
            <p>Password requirements:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>At least 8 characters long</li>
              <li>Contains at least one letter</li>
              <li>Contains at least one number</li>
            </ul>
          </div>

          <button
            className={`w-full bg-gradient-to-r from-teal-400 to-cyan-500 text-white font-semibold py-3 rounded-lg hover:from-teal-500 hover:to-cyan-600 transition-all duration-300 ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? 'Creating account...' : 'Register'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link 
            to="/login" 
            className="font-medium text-teal-600 hover:text-teal-700 transition-colors"
          >
            Log in here
          </Link>
        </p>
      </div>

      {/* Benefits Section */}
      <div className="mt-12 text-center max-w-4xl mx-auto">
        <h3 className="text-2xl font-semibold text-slate-800 mb-6">What you get with Nurtura</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-3xl text-teal-500 mb-3">📱</div>
            <h4 className="text-lg font-semibold text-slate-700 mb-2">Easy Communication</h4>
            <p className="text-slate-600 text-sm">
              Stay connected with family and caregivers through our intuitive platform.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-3xl text-teal-500 mb-3">📊</div>
            <h4 className="text-lg font-semibold text-slate-700 mb-2">Health Tracking</h4>
            <p className="text-slate-600 text-sm">
              Monitor vital signs, medications, and health progress with detailed insights.
            </p>
          </div>
        </div>
      </div>

      <footer className="py-8 mt-12 w-full text-center">
        <p className="text-slate-600">© 2024 Nurtura. All rights reserved.</p>
      </footer>
    </div>
  );
}
