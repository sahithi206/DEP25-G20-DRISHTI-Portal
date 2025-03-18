import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../Context/Authcontext.jsx';
import { useNavigate } from "react-router-dom";

const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { adminLogin } = useContext(AuthContext);
    const navigate = useNavigate();

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
        adminLogin(email, password, navigate);
        console.log('Logging in with:', email, password);
        setError('');
    };

    return (
        <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-blue-50 to-purple-50 p-4">
            <div className="bg-white shadow-xl rounded-xl p-8 w-full max-w-xl">

                <div className="mb-8 text-center">
                    <h2 className="text-3xl font-bold text-gray-800">Login</h2>
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

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Username</label>
                        <input
                            type="text"
                            id="email"
                            className="w-full mt-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-600 focus:outline-none"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                        <input
                            type="password"
                            id="password"
                            className="w-full mt-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-600 focus:outline-none"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="w-full bg-blue-700 text-white py-2 rounded hover:bg-blue-800 transition">
                        Login
                    </button>

                    <div className="flex justify-between text-sm text-blue-600 mt-3">
                        <a href="/forgot-password" className="hover:underline">Forgot Password?</a>
                        <a href="/adminSignup" className="hover:underline">New User?</a>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;
