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
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSignup} className="bg-white p-8 rounded-2xl shadow-lg w-96">
        <h1 className="text-2xl font-bold mb-6 text-blue-600">Create Account</h1>
        <input type="text" placeholder="Full Name" className="w-full p-3 mb-4 border rounded" onChange={(e) => setFormData({...formData, name: e.target.value})} />
        <input type="email" placeholder="Email" className="w-full p-3 mb-4 border rounded" onChange={(e) => setFormData({...formData, email: e.target.value})} />
        <input type="password" placeholder="Password" className="w-full p-3 mb-4 border rounded" onChange={(e) => setFormData({...formData, password: e.target.value})} />
        <label className="flex items-center gap-2 mb-6"><input type="checkbox" onChange={(e) => setFormData({...formData, is_admin: e.target.checked})} /> Admin Account</label>
        <button className="w-full bg-blue-600 text-white p-3 rounded-xl font-bold">Register</button>
      </form>
    </div>
  );
}