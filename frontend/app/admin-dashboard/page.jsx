"use client";
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const [adminName, setAdminName] = useState('');
  const [lots, setLots] = useState([]);
  const [liveReservations, setLiveReservations] = useState([]);
  const [payments, setPayments] = useState([]);
  const [transactions, setTransactions] = useState([]); // State for Master Log
  const [allUsers, setAllUsers] = useState([]); // State for User Management
  const [formData, setFormData] = useState({
    prime_loc: '',
    address: '',
    pincode: '',
    price_per_hr: '',
    max_spots: '',
    is_shaded: false
  });
  const router = useRouter();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');

    if (!token || !storedUser?.is_admin) {
      router.push('/login');
    } else {
      setAdminName(storedUser.name);
      fetchAllAdminData();
    }
  }, []);

  const fetchAllAdminData = () => {
    fetchLots();
    fetchAdminStats();
  };

  const fetchLots = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/user/lots');
      setLots(response.data);
    } catch (err) {
      console.error("Failed to fetch lots");
    }
  };

  const fetchAdminStats = async () => {
    const token = localStorage.getItem('token');
    try {
      const headers = { headers: { token: token } };
      
      const liveRes = await axios.get('http://localhost:3001/api/admin/live-status', headers);
      const payRes = await axios.get('http://localhost:3001/api/admin/revenue', headers);
      const transRes = await axios.get('http://localhost:3001/api/admin/all-transactions', headers);
      const userRes = await axios.get('http://localhost:3001/api/admin/users', headers);
      
      setLiveReservations(liveRes.data);
      setPayments(payRes.data);
      setTransactions(transRes.data);
      setAllUsers(userRes.data);
    } catch (err) {
      console.error("Stats fetch failed. Ensure backend routes exist.");
    }
  };

  const handleAddLot = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      await axios.post('http://localhost:3001/api/admin/lots', formData, {
        headers: { token: token }
      });
      alert("Parking Lot and Spots created successfully!");
      setFormData({ prime_loc: '', address: '', pincode: '', price_per_hr: '', max_spots: '', is_shaded: false });
      fetchAllAdminData();
    } catch (err) {
      alert("Error adding lot. Make sure you are authorized.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 pb-20">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Admin Dashboard</h1>
            <p className="text-gray-500">Welcome back, {adminName}</p>
          </div>
          <button 
            onClick={() => { localStorage.clear(); router.push('/login'); }}
            className="bg-red-500 text-white px-6 py-2 rounded-xl font-bold hover:bg-red-600 transition-colors shadow-lg shadow-red-100"
          >
            Logout
          </button>
        </header>

        {/* --- STATS CARDS --- */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-blue-600 text-white p-6 rounded-2xl shadow-xl shadow-blue-100">
            <p className="text-blue-100 text-sm font-bold uppercase tracking-wider">Total Revenue</p>
            <h3 className="text-4xl font-black mt-1">
              ₹{payments.reduce((acc, curr) => acc + Number(curr.total_amt), 0)}
            </h3>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border-l-8 border-green-500">
            <p className="text-gray-400 text-sm font-bold uppercase tracking-wider">Active Cars</p>
            <h3 className="text-4xl font-black text-gray-800 mt-1">{liveReservations.length}</h3>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border-l-8 border-purple-500">
            <p className="text-gray-400 text-sm font-bold uppercase tracking-wider">Total Transactions</p>
            <h3 className="text-4xl font-black text-gray-800 mt-1">{transactions.length}</h3>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border-l-8 border-orange-500">
            <p className="text-gray-400 text-sm font-bold uppercase tracking-wider">Registered Users</p>
            <h3 className="text-4xl font-black text-gray-800 mt-1">{allUsers.length}</h3>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form to Add Lot */}
          <div className="bg-white p-8 rounded-2xl shadow-sm h-fit border border-gray-100">
            <h2 className="text-xl font-bold mb-6 text-gray-800">Add New Parking Lot</h2>
            <form onSubmit={handleAddLot} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase">Location Name</label>
                <input type="text" placeholder="e.g. MG Road Terminal" className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" required
                  value={formData.prime_loc} onChange={(e) => setFormData({...formData, prime_loc: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase">Address</label>
                <textarea placeholder="Full street address" className="w-full p-3 border border-gray-200 rounded-xl outline-none" required
                  value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} />
              </div>
              <div className="flex gap-4">
                <div className="w-1/2 space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase">Pincode</label>
                  <input type="text" placeholder="411001" className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500" required
                    value={formData.pincode} onChange={(e) => setFormData({...formData, pincode: e.target.value})} />
                </div>
                <div className="w-1/2 space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase">Price/Hr</label>
                  <input type="number" placeholder="60" className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500" required
                    value={formData.price_per_hr} onChange={(e) => setFormData({...formData, price_per_hr: e.target.value})} />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase">Total Spots</label>
                <input type="number" placeholder="20" className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500" required
                  value={formData.max_spots} onChange={(e) => setFormData({...formData, max_spots: e.target.value})} />
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <input type="checkbox" className="w-5 h-5 rounded border-gray-300 text-blue-600 cursor-pointer" checked={formData.is_shaded} 
                  onChange={(e) => setFormData({...formData, is_shaded: e.target.checked})} id="shaded" />
                <label htmlFor="shaded" className="text-sm font-medium text-gray-700 cursor-pointer">Shaded/Indoor Lot</label>
              </div>
              <button type="submit" className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold hover:bg-blue-600 transition-all shadow-lg active:scale-95 mt-2">
                Create Parking Lot
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 space-y-8">
            {/* Operational Lots Table */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold mb-6 text-gray-800">Operational Lots</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-100 text-gray-400 text-xs uppercase tracking-widest">
                      <th className="py-4">Location</th>
                      <th className="py-4 text-center">Spots</th>
                      <th className="py-4">Price</th>
                      <th className="py-4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lots.map(lot => (
                      <tr key={lot.lot_id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="py-4">
                          <p className="font-bold text-gray-800">{lot.prime_loc}</p>
                          <p className="text-xs text-gray-400">{lot.pincode}</p>
                        </td>
                        <td className="py-4 text-center font-mono text-gray-600">{lot.max_spots}</td>
                        <td className="py-4 font-bold text-blue-600">₹{lot.price_per_hr}</td>
                        <td className="py-4">
                          <span className={`text-[10px] font-black px-2 py-1 rounded-md ${lot.is_shaded ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                            {lot.is_shaded ? 'SHADED' : 'OPEN'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Master Transaction Log */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold mb-6 text-gray-800">Master Transaction Log</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 text-gray-400 text-xs uppercase tracking-widest">
                      <th className="py-4">User & Vehicle</th>
                      <th className="py-4">Location</th>
                      <th className="py-4">Time Logs (In/Out)</th>
                      <th className="py-4 text-center">Status</th>
                      <th className="py-4 text-right">Fare</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map(t => (
                      <tr key={t.reserve_id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="py-4">
                          <p className="font-bold text-gray-800">{t.user_name}</p>
                          <p className="text-[10px] font-mono text-gray-400">{t.vehicle_num}</p>
                        </td>
                        <td className="py-4 text-gray-600">
                          {t.prime_loc} <span className="text-xs opacity-50">(#S{t.spot_id})</span>
                        </td>
                        <td className="py-4">
                          <p className="text-[10px] text-gray-500">In: {new Date(t.start_time).toLocaleString('en-IN')}</p>
                          <p className="text-[10px] text-gray-400">Out: {t.end_time ? new Date(t.end_time).toLocaleString('en-IN') : '---'}</p>
                        </td>
                        <td className="py-4 text-center">
                          <span className={`px-2 py-1 rounded-full text-[9px] font-black ${t.is_ongoing ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                            {t.is_ongoing ? 'ONGOING' : 'COMPLETED'}
                          </span>
                        </td>
                        <td className="py-4 text-right font-bold text-gray-800">
                          {t.fare ? `₹${t.fare}` : '---'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* User Management Section */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold mb-6 text-gray-800">User Management</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 text-gray-400 text-xs uppercase tracking-widest">
                      <th className="py-4">Name</th>
                      <th className="py-4">Email</th>
                      <th className="py-4">Role</th>
                      <th className="py-4 text-right">Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allUsers.map(user => (
                      <tr key={user.user_id} className="border-b border-gray-50">
                        <td className="py-4 font-bold text-gray-800">{user.name}</td>
                        <td className="py-4 text-gray-600">{user.email}</td>
                        <td className="py-4">
                          <span className={`px-2 py-1 rounded text-[10px] font-black ${user.is_admin ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                            {user.is_admin ? 'ADMIN' : 'USER'}
                          </span>
                        </td>
                        <td className="py-4 text-right text-gray-400 font-mono text-xs">
                          {new Date(user.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}