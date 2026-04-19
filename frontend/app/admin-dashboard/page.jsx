"use client";
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const [adminName, setAdminName] = useState('');
  const [lots, setLots] = useState([]);
  const [liveReservations, setLiveReservations] = useState([]);
  const [payments, setPayments] = useState([]);
  const [transactions, setTransactions] = useState([]); 
  const [allUsers, setAllUsers] = useState([]); 
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
      console.error("Stats fetch failed.");
    }
  };

  const handleAddLot = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      await axios.post('http://localhost:3001/api/admin/lots', formData, {
        headers: { token: token }
      });
      alert("Parking Lot created successfully!");
      setFormData({ prime_loc: '', address: '', pincode: '', price_per_hr: '', max_spots: '', is_shaded: false });
      fetchAllAdminData();
    } catch (err) {
      alert("Error adding lot.");
    }
  };

  // NEW: Delete functionality
  const handleDeleteLot = async (lotId) => {
    if (!confirm("Are you sure? This will delete the lot and all its spots forever.")) return;
    
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`http://localhost:3001/api/admin/lots/${lotId}`, {
        headers: { token: token }
      });
      alert("Lot deleted.");
      fetchAllAdminData();
    } catch (err) {
      alert("Delete failed. This lot might have active reservations.");
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f7fe] dark:bg-[#0b1120] pb-20 font-sans relative transition-colors duration-300">
      {/* Decorative top background */}
      <div className="w-full h-80 sm:h-72 bg-gradient-to-r from-blue-900 via-indigo-900 to-indigo-950 dark:from-blue-950 dark:via-gray-900 dark:to-black absolute top-0 left-0 rounded-b-[2rem] sm:rounded-b-[3rem] shadow-xl"></div>
      
      <div className="max-w-7xl mx-auto p-4 sm:p-8 relative z-10">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 sm:mb-10 mt-2 sm:mt-4 bg-white/10 dark:bg-[#1e293b]/30 backdrop-blur-md p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-white/20 dark:border-white/10 shadow-lg px-4 sm:px-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-1 flex items-center gap-2 sm:gap-3">
              <span className="bg-blue-500 rounded-lg w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center shadow-lg shadow-blue-500/50">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
              </span>
              Admin Control
            </h1>
            <p className="text-blue-100/80 font-medium ml-9 sm:ml-11 text-sm sm:text-base">Manage parking logic & revenue</p>
          </div>
          <button 
            onClick={() => { localStorage.clear(); router.push('/login'); }}
            className="w-full sm:w-auto bg-red-500/90 hover:bg-red-500 text-white px-5 sm:px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-red-500/30 border border-red-400/50 hover:shadow-red-500/50 active:scale-95 text-sm sm:text-base text-center"
          >
            Secure Logout
          </button>
        </header>

        {/* --- STATS CARDS --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-10">
          <div className="bg-gradient-to-tr from-green-500 to-emerald-400 dark:from-green-600 dark:to-emerald-500 text-white p-5 sm:p-6 rounded-2xl sm:rounded-3xl shadow-xl shadow-green-500/30 dark:shadow-none relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-white/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3 group-hover:scale-150 transition-transform duration-700"></div>
            <p className="text-green-50 text-xs font-bold uppercase tracking-wider mb-2 relative z-10">Total Revenue</p>
            <h3 className="text-3xl sm:text-4xl font-black relative z-10 flex items-baseline gap-1">
              <span className="text-xl sm:text-2xl opacity-80">₹</span>
              {payments.reduce((acc, curr) => acc + Number(curr.total_amt), 0).toLocaleString('en-IN')}
            </h3>
          </div>
          
          <div className="bg-white dark:bg-[#1e293b] p-5 sm:p-6 rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition-shadow relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-full bg-blue-500"></div>
            <p className="text-gray-400 dark:text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Active Vehicles</p>
            <h3 className="text-3xl sm:text-4xl font-black text-gray-800 dark:text-white">{liveReservations.length}</h3>
          </div>
          
          <div className="bg-white dark:bg-[#1e293b] p-5 sm:p-6 rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition-shadow relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-full bg-purple-500"></div>
            <p className="text-gray-400 dark:text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Total Transactions</p>
            <h3 className="text-3xl sm:text-4xl font-black text-gray-800 dark:text-white">{transactions.length}</h3>
          </div>
          
          <div className="bg-white dark:bg-[#1e293b] p-5 sm:p-6 rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition-shadow relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-full bg-orange-500"></div>
            <p className="text-gray-400 dark:text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Registered Users</p>
            <h3 className="text-3xl sm:text-4xl font-black text-gray-800 dark:text-white">{allUsers.length}</h3>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 mb-8 sm:mb-10">
          {/* Form to Add Lot */}
          <div className="bg-white dark:bg-[#1e293b] p-5 sm:p-8 rounded-2xl sm:rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-800 h-fit lg:sticky lg:top-[100px]">
            <h2 className="text-lg sm:text-xl font-extrabold mb-5 sm:mb-6 text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-4">Add Parking Lot</h2>
            <form onSubmit={handleAddLot} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest pl-1">Location Name</label>
                <input type="text" placeholder="e.g. MG Road Terminal" className="w-full p-3 sm:p-3.5 bg-gray-50 dark:bg-[#0f172a] border border-gray-200 dark:border-gray-700 rounded-xl focus:bg-white dark:focus:bg-[#0f172a] focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all text-gray-800 dark:text-gray-200 font-medium text-sm sm:text-base" required
                  value={formData.prime_loc} onChange={(e) => setFormData({...formData, prime_loc: e.target.value})} />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest pl-1">Address</label>
                <textarea placeholder="Full street address" className="w-full p-3 sm:p-3.5 bg-gray-50 dark:bg-[#0f172a] border border-gray-200 dark:border-gray-700 rounded-xl focus:bg-white dark:focus:bg-[#0f172a] focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all text-gray-800 dark:text-gray-200 font-medium resize-none h-20 sm:h-24 text-sm sm:text-base" required
                  value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} />
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="w-full sm:w-1/2 space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest pl-1">Pincode</label>
                  <input type="text" placeholder="411001" className="w-full p-3 sm:p-3.5 bg-gray-50 dark:bg-[#0f172a] border border-gray-200 dark:border-gray-700 rounded-xl focus:bg-white dark:focus:bg-[#0f172a] focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all text-gray-800 dark:text-gray-200 font-medium text-sm sm:text-base" required
                    value={formData.pincode} onChange={(e) => setFormData({...formData, pincode: e.target.value})} />
                </div>
                <div className="w-full sm:w-1/2 space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest pl-1">Rate (₹/Hr)</label>
                  <input type="number" placeholder="60" className="w-full p-3 sm:p-3.5 bg-gray-50 dark:bg-[#0f172a] border border-gray-200 dark:border-gray-700 rounded-xl focus:bg-white dark:focus:bg-[#0f172a] focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all text-gray-800 dark:text-gray-200 font-medium text-sm sm:text-base" required
                    value={formData.price_per_hr} onChange={(e) => setFormData({...formData, price_per_hr: e.target.value})} />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest pl-1">Total Spots</label>
                <input type="number" placeholder="20" className="w-full p-3 sm:p-3.5 bg-gray-50 dark:bg-[#0f172a] border border-gray-200 dark:border-gray-700 rounded-xl focus:bg-white dark:focus:bg-[#0f172a] focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all text-gray-800 dark:text-gray-200 font-medium text-sm sm:text-base" required
                  value={formData.max_spots} onChange={(e) => setFormData({...formData, max_spots: e.target.value})} />
              </div>
              <div className="flex items-center gap-3 p-3 sm:p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-700 transition-colors mt-2">
                <input type="checkbox" className="w-5 h-5 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer dark:bg-gray-900" checked={formData.is_shaded} 
                  onChange={(e) => setFormData({...formData, is_shaded: e.target.checked})} id="shaded" />
                <label htmlFor="shaded" className="text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300 cursor-pointer w-full">Premium Shaded Facility</label>
              </div>
              <button type="submit" className="w-full bg-gradient-to-r from-gray-900 to-gray-800 dark:from-white dark:to-gray-200 text-white dark:text-gray-900 py-3.5 sm:py-4 rounded-xl font-bold hover:from-blue-600 hover:to-indigo-600 dark:hover:from-blue-500 dark:hover:to-indigo-500 hover:text-white transition-all shadow-xl hover:shadow-blue-500/30 dark:hover:shadow-blue-500/20 active:scale-95 mt-4 text-sm sm:text-base">
                Launch Parking Location
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            {/* Operational Lots Table */}
            <div className="bg-white dark:bg-[#1e293b] p-1 rounded-2xl sm:rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
              <div className="p-4 sm:p-7 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/20 rounded-t-2xl sm:rounded-t-[2rem]">
                <h2 className="text-lg sm:text-xl font-extrabold text-gray-900 dark:text-white">Operational Networks</h2>
                <span className="bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-[10px] sm:text-xs font-black px-2 sm:px-3 py-1 rounded-full">{lots.length} active</span>
              </div>
              <div className="overflow-x-auto p-2">
                <table className="w-full text-left border-separate border-spacing-y-2 min-w-[500px]">
                  <thead>
                    <tr className="text-gray-400 dark:text-gray-500 text-[10px] font-black uppercase tracking-widest bg-white dark:bg-[#1e293b]">
                      <th className="py-2 sm:py-3 px-3 sm:px-4">Location & PIN</th>
                      <th className="py-2 sm:py-3 px-3 sm:px-4 text-center">Capacity</th>
                      <th className="py-2 sm:py-3 px-3 sm:px-4 text-center text-orange-500 dark:text-orange-400">In Use</th>
                      <th className="py-2 sm:py-3 px-3 sm:px-4 text-right">Tariff</th>
                      <th className="py-2 sm:py-3 px-3 sm:px-4 text-center">Type</th>
                      <th className="py-2 sm:py-3 px-3 sm:px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lots.map(lot => (
                      <tr key={lot.lot_id} className="bg-white dark:bg-[#0f172a]/50 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-colors shadow-sm dark:shadow-none rounded-xl sm:rounded-2xl group border border-gray-50 dark:border-gray-800">
                        <td className="py-3 sm:py-4 px-3 sm:px-4 rounded-l-xl sm:rounded-l-2xl border-t border-b border-l border-transparent group-hover:border-blue-100 dark:group-hover:border-blue-800">
                          <p className="font-extrabold text-gray-900 dark:text-white text-sm sm:text-base">{lot.prime_loc}</p>
                          <p className="text-[10px] sm:text-xs font-medium text-gray-400 dark:text-gray-500 mt-0.5"><span className="text-gray-300 dark:text-gray-600">PIN:</span> {lot.pincode}</p>
                        </td>
                        <td className="py-3 sm:py-4 px-3 sm:px-4 text-center font-mono font-bold text-gray-500 dark:text-gray-400 border-t border-b border-transparent group-hover:border-blue-100 dark:group-hover:border-blue-800 text-sm">{lot.max_spots}</td>
                        <td className="py-3 sm:py-4 px-3 sm:px-4 text-center border-t border-b border-transparent group-hover:border-blue-100 dark:group-hover:border-blue-800">
                          <span className={`inline-flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full font-black text-xs sm:text-sm ${(lot.occupied_spots > 0) ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500'}`}>
                            {lot.occupied_spots || 0}
                          </span>
                        </td>
                        <td className="py-3 sm:py-4 px-3 sm:px-4 text-right font-black text-indigo-600 dark:text-indigo-400 border-t border-b border-transparent group-hover:border-blue-100 dark:group-hover:border-blue-800 text-sm">₹{lot.price_per_hr}</td>
                        <td className="py-3 sm:py-4 px-3 sm:px-4 text-center border-t border-b border-transparent group-hover:border-blue-100 dark:group-hover:border-blue-800">
                          <span className={`text-[8px] sm:text-[10px] font-black px-2 sm:px-2.5 py-1 rounded-md ${lot.is_shaded ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800/50' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700'}`}>
                            {lot.is_shaded ? 'SHADED' : 'OPEN'}
                          </span>
                        </td>
                        <td className="py-3 sm:py-4 px-3 sm:px-4 text-right rounded-r-xl sm:rounded-r-2xl border-t border-b border-r border-transparent group-hover:border-blue-100 dark:group-hover:border-blue-800">
                          <button 
                            onClick={() => handleDeleteLot(lot.lot_id)}
                            className="text-red-500 hover:text-white dark:text-red-400 dark:hover:text-white text-[10px] sm:text-xs font-bold px-2.5 py-1.5 sm:px-3 sm:py-2 bg-red-50 dark:bg-red-900/20 hover:bg-red-500 dark:hover:bg-red-600 rounded-lg transition-all active:scale-95"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Master Transaction Log */}
        <div className="bg-white dark:bg-[#1e293b] p-1 rounded-2xl sm:rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden mb-10">
          <div className="p-4 sm:p-7 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/20 rounded-t-2xl sm:rounded-t-[2rem]">
            <h2 className="text-lg sm:text-xl font-extrabold text-gray-900 dark:text-white">Master Audit Log</h2>
            <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-[10px] sm:text-xs font-black px-2 sm:px-3 py-1 rounded-full">{transactions.length} records</span>
          </div>
          <div className="overflow-x-auto p-3 sm:p-4">
            <table className="w-full text-left text-xs sm:text-sm min-w-[600px]">
              <thead>
                <tr className="border-b-2 border-gray-100 dark:border-gray-800 text-gray-400 dark:text-gray-500 text-[9px] sm:text-[10px] font-black uppercase tracking-widest">
                  <th className="py-3 sm:py-4 px-2">Customer</th>
                  <th className="py-3 sm:py-4 px-2">Vehicle ID</th>
                  <th className="py-3 sm:py-4 px-2">Facility Location</th>
                  <th className="py-3 sm:py-4 px-2">Operational Hours</th>
                  <th className="py-3 sm:py-4 px-2 text-center">Session State</th>
                  <th className="py-3 sm:py-4 px-2 text-right">Accrued Fare</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                {transactions.map(t => (
                  <tr key={t.reserve_id} className="hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors">
                    <td className="py-3 sm:py-4 px-2 font-bold text-gray-900 dark:text-gray-100">{t.user_name}</td>
                    <td className="py-3 sm:py-4 px-2">
                       <span className="font-mono text-[10px] sm:text-xs font-bold bg-gray-100 dark:bg-gray-800 px-1.5 sm:px-2 py-1 rounded text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700">{t.vehicle_num}</span>
                    </td>
                    <td className="py-3 sm:py-4 px-2">
                      <p className="font-bold text-gray-800 dark:text-gray-200">{t.prime_loc}</p>
                      <p className="text-[9px] sm:text-[10px] text-gray-400 dark:text-gray-500 font-bold mt-0.5">SPOT #S{t.spot_id}</p>
                    </td>
                    <td className="py-3 sm:py-4 px-2">
                      <div className="flex flex-col gap-1">
                         <div className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-green-500"></span><span className="text-[10px] sm:text-[11px] font-medium text-gray-600 dark:text-gray-400">{new Date(t.start_time).toLocaleString('en-IN')}</span></div>
                         <div className="flex items-center gap-1.5"><span className={`w-1.5 h-1.5 rounded-full ${t.end_time ? 'bg-red-500' : 'bg-gray-300 dark:bg-gray-600'}`}></span><span className={`text-[10px] sm:text-[11px] font-medium ${t.end_time ? 'text-gray-600 dark:text-gray-400' : 'text-gray-400 dark:text-gray-500 italic'}`}>{t.end_time ? new Date(t.end_time).toLocaleString('en-IN') : 'Ongoing session...'}</span></div>
                      </div>
                    </td>
                    <td className="py-3 sm:py-4 px-2 text-center">
                      <span className={`inline-flex items-center justify-center px-2 sm:px-3 py-1 rounded-full text-[9px] sm:text-[10px] font-black tracking-wider shadow-sm border ${t.is_ongoing ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800/50 animate-pulse' : 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800/50'}`}>
                        {t.is_ongoing ? 'ACTIVE' : 'CLOSED'}
                      </span>
                    </td>
                    <td className="py-3 sm:py-4 px-2 text-right">
                       <span className={`font-black text-sm sm:text-lg ${t.fare ? 'text-gray-900 dark:text-white' : 'text-gray-300 dark:text-gray-600'}`}>
                         {t.fare ? `₹${t.fare}` : '---'}
                       </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}