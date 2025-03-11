import React, { useState, useContext } from 'react';
import backgroundImage from '../assets/background.jpg';
import { AuthContext } from './Context/Authcontext.jsx';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password || !role) {
      setError('All fields are required');
      return;
    }
    login(email, password);
    console.log('Logging in with:', email, password, role);
    setError('');
  };

  return (
    <div
      className="h-screen w-full bg-cover bg-center flex items-center justify-center"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-semibold text-center mb-4">Login to Your Account</h2>
        {error && <div className="bg-red-500 text-white p-2 rounded mb-3">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="role" className="block text-sm font-medium">Select User Role</label>
            <select
              className="w-full mt-1 p-2 border rounded"
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
            >
              <option value="">Select Role</option>
              <option value="admin">Admin</option>
              <option value="pi">PI</option>
            </select>
          </div>

          <div>
            <label htmlFor="username" className="block text-sm font-medium">Please Enter User Name</label>
            <input
              type="text"
              id="username"
              className="w-full mt-1 p-2 border rounded"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium">Please Enter Password</label>
            <input
              type="password"
              id="password"
              className="w-full mt-1 p-2 border rounded"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded mt-4">
            Login
          </button>

          <div className="flex justify-between mt-3 text-sm">
            <a href="/forgot-password" className="text-blue-500 hover:underline">Forgot Password</a>
            <a href="/signup" className="text-blue-500 hover:underline">New User</a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;