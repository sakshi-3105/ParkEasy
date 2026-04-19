"use client";
import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function Signup() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', is_admin: false });
  const router = useRouter();

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3001/api/auth/register', formData);
      alert("Account created! Please login.");
      router.push('/login');
    } catch (err) { alert("Signup Failed"); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] dark:from-slate-900 dark:via-[#0f172a] dark:to-black relative overflow-hidden transition-colors duration-300 px-4 py-8">
      {/* Background decoration */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] sm:w-[40%] h-[40%] bg-blue-600/10 dark:bg-blue-600/20 blur-[100px] sm:blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] sm:w-[40%] h-[40%] bg-purple-600/10 dark:bg-purple-600/20 blur-[100px] sm:blur-[120px] rounded-full"></div>
      
      <form onSubmit={handleSignup} className="relative z-10 bg-white dark:bg-white/[0.03] dark:backdrop-blur-2xl border border-gray-200 dark:border-white/10 p-6 sm:p-10 rounded-3xl shadow-xl dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] w-full max-w-[420px] transition-all duration-300 hover:shadow-2xl dark:hover:shadow-[0_8px_32px_0_rgba(0,0,0,0.5)]">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-purple-700 dark:from-blue-400 dark:to-purple-400 tracking-tight mb-2">Create Account</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Join ParkEasy and find spots effortlessly.</p>
        </div>
        
        <div className="space-y-4">
          <input type="text" placeholder="Full Name" className="w-full p-4 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all font-medium" onChange={(e) => setFormData({...formData, name: e.target.value})} required />
          <input type="email" placeholder="Email Address" className="w-full p-4 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all font-medium" onChange={(e) => setFormData({...formData, email: e.target.value})} required />
          <input type="password" placeholder="Password" className="w-full p-4 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all font-medium" onChange={(e) => setFormData({...formData, password: e.target.value})} required />
          
          <label className="flex items-center gap-3 mt-4 mb-2 p-3 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/5 cursor-pointer hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
            <input type="checkbox" className="w-5 h-5 rounded border-gray-300 dark:border-gray-500 bg-white dark:bg-black/50 text-blue-600 dark:text-blue-500 focus:ring-blue-500/50 focus:ring-offset-0 transition-all" onChange={(e) => setFormData({...formData, is_admin: e.target.checked})} />
            <span className="text-gray-700 dark:text-gray-300 text-sm font-bold">Register as System Admin</span>
          </label>
        </div>
        
        <button className="w-full mt-8 bg-gradient-to-r from-blue-700 to-purple-700 hover:from-blue-600 hover:to-purple-600 dark:from-blue-600 dark:to-purple-600 dark:hover:from-blue-500 dark:hover:to-purple-500 text-white p-4 rounded-xl font-bold text-lg shadow-lg shadow-blue-500/25 transform active:scale-[0.98] hover:-translate-y-0.5 transition-all duration-200">
          Create Account
        </button>
        
        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-white/10 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Already have an account?{' '}
            <a href="/login" className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 font-semibold hover:underline transition-colors w-full inline-block mt-2 sm:mt-0 sm:w-auto">
              Sign In
            </a>
          </p>
        </div>
      </form>
    </div>
  );
}