import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { Link } from "react-router-dom";

export default function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [username, setUsername]       = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await login(username, password);
    if (ok) {
      navigate('/');
    } else {
      alert('Invalid credentials');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white shadow rounded">
      <h1 className="text-2xl mb-4">Log In</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
          className="w-full px-3 py-2 border rounded"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          className="w-full px-3 py-2 border rounded"
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded"
        >
          Log In
        </button>
      </form>
       <p className="mt-4 text-sm text-center">
        Don’t have an account?{" "}
        <Link to="/register" className="text-blue-600 hover:underline">
          Register here
        </Link>
      </p>
    </div>
  );
}