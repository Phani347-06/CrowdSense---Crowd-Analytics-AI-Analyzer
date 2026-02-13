import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wifi, Key, Mail, Lock } from 'lucide-react';

const Login = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('admin@campus.edu');
    const [password, setPassword] = useState('password123');

    const handleLogin = (e) => {
        e.preventDefault();
        navigate('/dashboard');
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
            <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl w-full max-w-md text-center border border-gray-100 dark:border-slate-700">
                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white mx-auto mb-4 shadow-lg shadow-blue-500/30">
                    <Wifi size={24} />
                </div>

                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">CrowdSense</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">Campus Crowd Monitoring System</p>

                <form onSubmit={handleLogin} className="space-y-6 text-left">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 ml-1">Email Address</label>
                        <div className="relative group">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 ml-1">Password</label>
                        <div className="relative group">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                            />
                        </div>
                    </div>

                    <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-600/30 hover:shadow-blue-600/40 transform hover:-translate-y-0.5 transition-all">
                        Access Dashboard
                    </button>
                </form>

                <p className="mt-8 text-xs text-center text-gray-400 dark:text-gray-500">
                    &copy; 2026 CrowdSense Analytics
                </p>
            </div>
        </div>
    );
};

export default Login;
