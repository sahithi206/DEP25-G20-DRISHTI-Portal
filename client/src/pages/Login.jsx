import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from './Context/Authcontext.jsx';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);

  useEffect(() => {
    window.history.pushState(null, null, window.location.href);
    window.onpopstate = function () {
      window.history.go(1);
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('All fields are required');
      return;
    }
    login(email, password);
    setError('');
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-b from-blue-50 to-slate-100 p-4">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md border border-gray-100">
        <div className="mb-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="h-12 w-12 bg-blue-600 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-semibold text-gray-800">ResearchX Portal</h2>
          <p className="text-gray-500 mt-1">Sign in to access your research dashboard</p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              id="email"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
              <a href="/forgot-password" className="text-xs text-blue-600 hover:text-blue-800 hover:underline">Forgot password?</a>
            </div>
            <input
              type="password"
              id="password"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          <div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition font-medium"
            >
              Sign In
            </button>
          </div>

          <div className="flex items-center justify-center space-x-4 text-sm text-gray-600 pt-2">
            <a href="/signup" className="hover:text-blue-600 hover:underline transition">Create account</a>
            <span className="text-gray-300">|</span>
            <a href="/adminLogin" className="hover:text-blue-600 hover:underline transition">Admin access</a>
            <span className="text-gray-300">|</span>
            <a href="/institute-login" className="hover:text-blue-600 hover:underline transition">Institute access</a>
          </div>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs text-center text-gray-500">
            By signing in, you agree to ResearchX's <a href="/terms" className="text-blue-600 hover:underline">Terms of Service</a> and <a href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;