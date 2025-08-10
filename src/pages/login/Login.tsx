import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { AuthContext } from "../../contexts/AuthContext";
import logoBlack from "./components/koala-removebg-preview.png";

export default function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Add CSS to hide all browser password toggles
  React.useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      input[type="password"]::-ms-reveal,
      input[type="password"]::-ms-clear,
      input[type="password"]::-webkit-credentials-auto-fill-button,
      input[type="password"]::-webkit-strong-password-auto-fill-button {
        display: none !important;
        visibility: hidden !important;
        pointer-events: none !important;
      }
      input[type="password"] {
        -webkit-text-security: disc !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (await login(username, password)) {
        navigate("/");
      } else {
        alert("Invalid credentials");
      }
    } catch (error) {
      alert("Login failed. Please try again.");
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
        <h1 className="mt-0 text-4xl font-bold text-slate-800 font-poppins">
          Welcome to Nurtura!
        </h1>
        <p className="mt-4 text-lg text-slate-600">
          Your trusted partner in caregiving.
        </p>
      </div>

      <div className="mt-5 bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-semibold text-center text-slate-700 mb-6">
          Log In
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="sr-only" htmlFor="username">
              Username
            </label>
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
            <label className="sr-only" htmlFor="password">
              Password
            </label>
            <input
              className="w-full px-4 py-3 pr-12 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 transition-colors"
              id="password"
              name="password"
              placeholder="••••••••"
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
          <button
            className={`w-full bg-gradient-to-r from-teal-400 to-cyan-500 text-white font-semibold py-3 rounded-lg hover:from-teal-500 hover:to-cyan-600 transition-all duration-300 ${
              isLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Log In"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-500">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="font-medium text-teal-600 hover:text-teal-700 transition-colors"
          >
            Register here
          </Link>
        </p>
      </div>

      {/* Why Choose Nurtura Section */}
      <div className="mt-12 text-center max-w-6xl mx-auto">
        <h3 className="text-3xl font-semibold text-slate-800 mb-8">
          Why Choose Nurtura?
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-4xl text-teal-500 mb-4">👨‍👩‍👧‍👦</div>
            <h4 className="text-xl font-semibold text-slate-700 mb-2">
              Compassionate Care
            </h4>
            <p className="text-slate-600">
              Our caregivers are trained to provide the most compassionate and
              professional care.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-4xl text-teal-500 mb-4">⏰</div>
            <h4 className="text-xl font-semibold text-slate-700 mb-2">
              Flexible Scheduling
            </h4>
            <p className="text-slate-600">
              We offer flexible scheduling to fit the unique needs of your
              family.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-4xl text-teal-500 mb-4">✅</div>
            <h4 className="text-xl font-semibold text-slate-700 mb-2">
              Trusted & Vetted
            </h4>
            <p className="text-slate-600">
              All our caregivers undergo rigorous background checks and vetting
              processes.
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
