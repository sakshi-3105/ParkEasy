"use client";
import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:3001/api/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      
      if (res.data.user.is_admin) router.push('/admin-dashboard');
      else router.push('/dashboard');
    } catch (err) { alert("Login Failed"); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] dark:from-slate-900 dark:via-[#0f172a] dark:to-black relative overflow-hidden transition-colors duration-300 px-4">
      {/* Background decoration - only really visible in dark mode or as subtle tint in light */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] sm:w-[40%] h-[40%] bg-blue-600/10 dark:bg-blue-600/20 blur-[100px] sm:blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] sm:w-[40%] h-[40%] bg-purple-600/10 dark:bg-purple-600/20 blur-[100px] sm:blur-[120px] rounded-full"></div>
      
      <form onSubmit={handleLogin} className="relative z-10 bg-white dark:bg-white/[0.03] dark:backdrop-blur-2xl border border-gray-200 dark:border-white/10 p-6 sm:p-10 rounded-3xl shadow-xl dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] w-full max-w-[420px] transition-all duration-300 hover:shadow-2xl dark:hover:shadow-[0_8px_32px_0_rgba(0,0,0,0.5)]">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-purple-700 dark:from-blue-400 dark:to-purple-400 tracking-tight mb-3">ParkEasy</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Welcome back! Sign in to your account.</p>
        </div>
        
        <div className="space-y-5">
          <div className="group relative">
            <input type="email" placeholder="Email Address" className="w-full p-4 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-blue-500/50 focus:border-blue-500/50 transition-all font-medium" onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="group relative">
            <input type="password" placeholder="Password" className="w-full p-4 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-blue-500/50 focus:border-blue-500/50 transition-all font-medium" onChange={(e) => setPassword(e.target.value)} required />
          </div>
        </div>
        
        <button className="w-full mt-8 bg-gradient-to-r from-blue-700 to-purple-700 hover:from-blue-600 hover:to-purple-600 dark:from-blue-600 dark:to-purple-600 dark:hover:from-blue-500 dark:hover:to-purple-500 text-white p-4 rounded-xl font-bold text-lg shadow-lg shadow-blue-500/25 transform active:scale-[0.98] hover:-translate-y-0.5 transition-all duration-200">
          Sign In
        </button>
        
        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-white/10 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Don't have an account?{' '}
            <a href="/signup" className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 font-semibold hover:underline transition-colors w-full inline-block mt-2 sm:mt-0 sm:w-auto">
              Create one now
            </a>
          </p>
        </div>
      </form>
    </div>
  );
}