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
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded-2xl shadow-lg w-96">
        <h1 className="text-2xl font-bold mb-6 text-blue-600">ParkEasy Login</h1>
        <input type="email" placeholder="Email" className="w-full p-3 mb-4 border rounded" onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" className="w-full p-3 mb-6 border rounded" onChange={(e) => setPassword(e.target.value)} required />
        <button className="w-full bg-blue-600 text-white p-3 rounded-xl font-bold">Login</button>
        <p className="mt-4 text-sm text-center">No account? <a href="/signup" className="text-blue-500">Signup</a></p>
      </form>
    </div>
  );
}