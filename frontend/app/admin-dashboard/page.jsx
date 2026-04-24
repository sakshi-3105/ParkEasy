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
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
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

  const lotHeatData = lots
    .map((lot) => {
      const totalSpots = Number(lot.max_spots) || 0;
      const occupiedSpots = Number(lot.occupied_spots) || 0;
      const occupancyPercent = totalSpots > 0 ? Math.min(100, Math.round((occupiedSpots / totalSpots) * 100)) : 0;
      return { ...lot, totalSpots, occupiedSpots, occupancyPercent };
    })
    .sort((a, b) => b.occupancyPercent - a.occupancyPercent);

  const getHeatTone = (occupancyPercent) => {
    if (occupancyPercent >= 85) {
      return {
        card: 'bg-rose-50 border-rose-200',
        pill: 'bg-rose-600 text-white',
        progress: 'from-rose-500 to-red-600'
      };
    }
    if (occupancyPercent >= 60) {
      return {
        card: 'bg-orange-50 border-orange-200',
        pill: 'bg-orange-500 text-white',
        progress: 'from-orange-400 to-amber-500'
      };
    }
    if (occupancyPercent >= 35) {
      return {
        card: 'bg-amber-50 border-amber-200',
        pill: 'bg-amber-500 text-white',
        progress: 'from-amber-400 to-yellow-500'
      };
    }
    return {
      card: 'bg-blue-50 border-blue-200',
      pill: 'bg-blue-500 text-white',
      progress: 'from-blue-400 to-cyan-500'
    };
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-gray-900 pb-20 font-sans relative selection:bg-blue-600 selection:text-white transition-colors duration-300">
      {/* Decorative top background */}
      <div className="absolute top-[-20%] left-[20%] w-[60%] h-[40%] bg-blue-300/20 blur-[120px] rounded-full pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto p-4 sm:p-8 relative z-10">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 sm:mb-10 mt-2 sm:mt-4 bg-white/80 backdrop-blur-md p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-gray-200 shadow-sm px-4 sm:px-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight mb-1 flex items-center gap-2 sm:gap-3">
              <span className="bg-blue-600 rounded-lg w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center shadow-[0_4px_14px_0_rgba(37,99,235,0.39)]">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
              </span>
              Admin Control
            </h1>
            <p className="text-gray-500 font-medium ml-9 sm:ml-11 text-sm sm:text-base">Manage parking logic & revenue</p>
          </div>
          <button 
            onClick={() => { localStorage.clear(); router.push('/login'); }}
            className="w-full sm:w-auto bg-white border border-red-200 hover:bg-red-50 hover:border-red-300 text-red-500 px-5 sm:px-6 py-2.5 rounded-xl font-bold transition-all active:scale-95 text-sm sm:text-base text-center shadow-sm"
          >
            Secure Logout
          </button>
        </header>

        <nav className="mb-6 sm:mb-8 bg-white/90 backdrop-blur-md border border-gray-200 rounded-2xl sm:rounded-3xl p-2.5 sm:p-3 shadow-sm sticky top-3 z-20">
          <div className="hidden md:flex items-center gap-3">
            {[
              { href: '#add-new-lot', label: 'Add New Lot' },
              { href: '#operational-networks', label: 'Operational Networks' },
              { href: '#live-occupancy-heatmap', label: 'Occupancy Heatmap' },
              { href: '#master-audit-log', label: 'Master Audit Log' }
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="inline-flex items-center px-4 py-2.5 rounded-xl text-sm font-bold text-gray-600 bg-gradient-to-b from-white to-gray-50 border border-gray-200 hover:from-blue-600 hover:to-blue-700 hover:text-white hover:border-blue-600 transition-all shadow-[0_2px_8px_rgba(15,23,42,0.05)]"
              >
                {item.label}
              </a>
            ))}
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setIsMobileNavOpen((prev) => !prev)}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-gradient-to-b from-white to-gray-50 border border-gray-200 text-gray-700 font-bold text-sm"
            >
              <span>Navigation</span>
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 text-blue-600">
                {isMobileNavOpen ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
                  </svg>
                )}
              </span>
            </button>

            {isMobileNavOpen && (
              <div className="mt-2 p-2 rounded-xl border border-gray-200 bg-white/95 shadow-lg space-y-2">
                {[
                  { href: '#add-new-lot', label: 'Add New Lot' },
                  { href: '#operational-networks', label: 'Operational Networks' },
                  { href: '#live-occupancy-heatmap', label: 'Occupancy Heatmap' },
                  { href: '#master-audit-log', label: 'Master Audit Log' }
                ].map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileNavOpen(false)}
                    className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-bold text-gray-700 bg-gray-50 border border-gray-200 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all"
                  >
                    <span>{item.label}</span>
                    <span aria-hidden="true">→</span>
                  </a>
                ))}
              </div>
            )}
          </div>
        </nav>

        {/* --- STATS CARDS --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-10">
          <div className="bg-gradient-to-tr from-green-500 to-emerald-400 border border-green-400 text-white p-5 sm:p-6 rounded-2xl sm:rounded-3xl shadow-[0_10px_25px_-5px_rgba(16,185,129,0.3)] relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-white/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3 group-hover:scale-150 transition-transform duration-700"></div>
            <p className="text-green-50 text-xs font-bold uppercase tracking-wider mb-2 relative z-10">Total Revenue</p>
            <h3 className="text-3xl sm:text-4xl font-black relative z-10 flex items-baseline gap-1">
              <span className="text-xl sm:text-2xl opacity-80">₹</span>
              {payments.reduce((acc, curr) => acc + Number(curr.total_amt), 0).toLocaleString('en-IN')}
            </h3>
          </div>
          
          <div className="bg-white p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-gray-200 hover:shadow-lg hover:shadow-gray-200/50 transition-all relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Active Vehicles</p>
            <h3 className="text-3xl sm:text-4xl font-black text-gray-900">{liveReservations.length}</h3>
          </div>
          
          <div className="bg-white p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-gray-200 hover:shadow-lg hover:shadow-gray-200/50 transition-all relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-purple-500"></div>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Total Transactions</p>
            <h3 className="text-3xl sm:text-4xl font-black text-gray-900">{transactions.length}</h3>
          </div>
          
          <div className="bg-white p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-gray-200 hover:shadow-lg hover:shadow-gray-200/50 transition-all relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-orange-500"></div>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Registered Users</p>
            <h3 className="text-3xl sm:text-4xl font-black text-gray-900">{allUsers.length}</h3>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 mb-8 sm:mb-10">
          {/* Form to Add Lot */}
          <div id="add-new-lot" className="bg-white p-5 sm:p-8 rounded-2xl sm:rounded-[2rem] border border-gray-200 h-fit lg:sticky lg:top-[30px] shadow-sm scroll-mt-28">
            <h2 className="text-lg sm:text-xl font-extrabold mb-5 sm:mb-6 text-gray-900 border-b border-gray-100 pb-4">Add Parking Lot</h2>
            <form onSubmit={handleAddLot} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">Location Name</label>
                <input type="text" placeholder="e.g. MG Road Terminal" className="w-full p-3 sm:p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-gray-900 placeholder-gray-400 font-medium text-sm sm:text-base" required
                  value={formData.prime_loc} onChange={(e) => setFormData({...formData, prime_loc: e.target.value})} />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">Address</label>
                <textarea placeholder="Full street address" className="w-full p-3 sm:p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-gray-900 placeholder-gray-400 font-medium resize-none h-20 sm:h-24 text-sm sm:text-base" required
                  value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} />
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="w-full sm:w-1/2 space-y-1.5">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">Pincode</label>
                  <input type="text" placeholder="411001" className="w-full p-3 sm:p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-gray-900 placeholder-gray-400 font-medium text-sm sm:text-base" required
                    value={formData.pincode} onChange={(e) => setFormData({...formData, pincode: e.target.value})} />
                </div>
                <div className="w-full sm:w-1/2 space-y-1.5">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">Rate (₹/Hr)</label>
                  <input type="number" placeholder="60" className="w-full p-3 sm:p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-gray-900 placeholder-gray-400 font-medium text-sm sm:text-base" required
                    value={formData.price_per_hr} onChange={(e) => setFormData({...formData, price_per_hr: e.target.value})} />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">Total Spots</label>
                <input type="number" placeholder="20" className="w-full p-3 sm:p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-gray-900 placeholder-gray-400 font-medium text-sm sm:text-base" required
                  value={formData.max_spots} onChange={(e) => setFormData({...formData, max_spots: e.target.value})} />
              </div>
              <div className="flex items-center gap-3 p-3 sm:p-4 bg-gray-50 rounded-xl border border-gray-200 hover:bg-gray-100 transition-colors mt-2 text-gray-900">
                <input type="checkbox" className="w-5 h-5 rounded border-gray-300 bg-white text-blue-600 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer" checked={formData.is_shaded} 
                  onChange={(e) => setFormData({...formData, is_shaded: e.target.checked})} id="shaded" />
                <label htmlFor="shaded" className="text-xs sm:text-sm font-bold text-gray-700 cursor-pointer w-full">Premium Shaded Facility</label>
              </div>
              <button type="submit" className="w-full bg-gray-900 text-white py-3.5 sm:py-4 rounded-xl font-bold hover:bg-blue-600 transition-all shadow-[0_4px_14px_0_rgba(17,24,39,0.39)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.23)] active:scale-95 mt-4 text-sm sm:text-base border border-transparent">
                Launch Parking Location
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            {/* Operational Lots Table */}
            <div id="operational-networks" className="bg-white p-1 rounded-2xl sm:rounded-[2rem] border border-gray-200 overflow-hidden shadow-sm scroll-mt-28">
              <div className="p-4 sm:p-7 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 rounded-t-2xl sm:rounded-t-[2rem]">
                <h2 className="text-lg sm:text-xl font-extrabold text-gray-900">Operational Networks</h2>
                <span className="bg-blue-50 border border-blue-100 text-blue-600 text-[10px] sm:text-xs font-black px-2 sm:px-3 py-1 rounded-full">{lots.length} active</span>
              </div>
              <div className="overflow-x-auto p-2">
                <table className="w-full text-left border-separate border-spacing-y-2 min-w-[500px]">
                  <thead>
                    <tr className="text-gray-400 text-[10px] font-black uppercase tracking-widest">
                      <th className="py-2 sm:py-3 px-3 sm:px-4">Location & PIN</th>
                      <th className="py-2 sm:py-3 px-3 sm:px-4 text-center">Capacity</th>
                      <th className="py-2 sm:py-3 px-3 sm:px-4 text-center text-orange-500">In Use</th>
                      <th className="py-2 sm:py-3 px-3 sm:px-4 text-right">Tariff</th>
                      <th className="py-2 sm:py-3 px-3 sm:px-4 text-center">Type</th>
                      <th className="py-2 sm:py-3 px-3 sm:px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lots.map(lot => (
                      <tr key={lot.lot_id} className="bg-white hover:bg-slate-50 transition-colors rounded-xl sm:rounded-2xl group border border-gray-100">
                        <td className="py-3 sm:py-4 px-3 sm:px-4 rounded-l-xl sm:rounded-l-2xl border-t border-b border-l border-gray-100 group-hover:border-gray-200">
                          <p className="font-extrabold text-gray-900 text-sm sm:text-base">{lot.prime_loc}</p>
                          <p className="text-[10px] sm:text-xs font-medium text-gray-500 mt-0.5"><span className="text-gray-400">PIN:</span> {lot.pincode}</p>
                        </td>
                        <td className="py-3 sm:py-4 px-3 sm:px-4 text-center font-mono font-bold text-gray-500 border-t border-b border-gray-100 group-hover:border-gray-200 text-sm">{lot.max_spots}</td>
                        <td className="py-3 sm:py-4 px-3 sm:px-4 text-center border-t border-b border-gray-100 group-hover:border-gray-200">
                          <span className={`inline-flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full font-black text-xs sm:text-sm ${(lot.occupied_spots > 0) ? 'bg-orange-50 text-orange-600 border border-orange-100' : 'bg-gray-50 text-gray-400 border border-gray-100'}`}>
                            {lot.occupied_spots || 0}
                          </span>
                        </td>
                        <td className="py-3 sm:py-4 px-3 sm:px-4 text-right font-black text-blue-600 border-t border-b border-gray-100 group-hover:border-gray-200 text-sm">₹{lot.price_per_hr}</td>
                        <td className="py-3 sm:py-4 px-3 sm:px-4 text-center border-t border-b border-gray-100 group-hover:border-gray-200">
                          <span className={`text-[8px] sm:text-[10px] font-black px-2 sm:px-2.5 py-1 rounded-md border ${lot.is_shaded ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                            {lot.is_shaded ? 'SHADED' : 'OPEN'}
                          </span>
                        </td>
                        <td className="py-3 sm:py-4 px-3 sm:px-4 text-right rounded-r-xl sm:rounded-r-2xl border-t border-b border-r border-gray-100 group-hover:border-gray-200">
                          <button 
                            onClick={() => handleDeleteLot(lot.lot_id)}
                            className="text-red-500 hover:text-white text-[10px] sm:text-xs font-bold px-2.5 py-1.5 sm:px-3 sm:py-2 bg-red-50 hover:bg-red-500 rounded-lg transition-all active:scale-95 border border-red-100 hover:border-red-500"
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

        {/* Occupancy Heatmap */}
        <div id="live-occupancy-heatmap" className="bg-white p-5 sm:p-7 rounded-2xl sm:rounded-[2rem] border border-gray-200 mb-8 sm:mb-10 shadow-sm scroll-mt-28">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5 sm:mb-6">
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-gray-900">Live Occupancy Heatmap</h2>
              <p className="text-xs sm:text-sm text-gray-500 font-medium mt-1">Heat is based on occupied spots vs total spots per lot.</p>
            </div>
            <div className="flex items-center gap-2 text-[10px] sm:text-xs font-black uppercase tracking-wider">
              <span className="px-2 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-200">Low</span>
              <span className="px-2 py-1 rounded-full bg-amber-50 text-amber-600 border border-amber-200">Medium</span>
              <span className="px-2 py-1 rounded-full bg-orange-50 text-orange-600 border border-orange-200">High</span>
              <span className="px-2 py-1 rounded-full bg-rose-50 text-rose-600 border border-rose-200">Critical</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
            {lotHeatData.map((lot) => {
              const heatTone = getHeatTone(lot.occupancyPercent);
              return (
                <div key={lot.lot_id} className={`rounded-2xl border p-4 sm:p-5 ${heatTone.card}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm sm:text-base font-extrabold text-gray-900">{lot.prime_loc}</p>
                      <p className="text-[10px] sm:text-xs font-semibold text-gray-500 mt-1">PIN {lot.pincode}</p>
                    </div>
                    <span className={`text-[10px] sm:text-xs font-black px-2.5 py-1 rounded-full ${heatTone.pill}`}>
                      {lot.occupancyPercent}%
                    </span>
                  </div>

                  <div className="mt-4">
                    <div className="w-full h-2.5 rounded-full bg-white/80 border border-white/90 overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${heatTone.progress} transition-all duration-500`}
                        style={{ width: `${lot.occupancyPercent}%` }}
                      ></div>
                    </div>
                    <p className="mt-2 text-[11px] sm:text-xs font-bold text-gray-600">
                      {lot.occupiedSpots} occupied / {lot.totalSpots} total spots
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Master Transaction Log */}
        <div id="master-audit-log" className="bg-white p-1 rounded-2xl sm:rounded-[2rem] border border-gray-200 overflow-hidden mb-10 shadow-sm scroll-mt-28">
          <div className="p-4 sm:p-7 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 rounded-t-2xl sm:rounded-t-[2rem]">
            <h2 className="text-lg sm:text-xl font-extrabold text-gray-900">Master Audit Log</h2>
            <span className="bg-purple-50 border border-purple-100 text-purple-600 text-[10px] sm:text-xs font-black px-2 sm:px-3 py-1 rounded-full">{transactions.length} records</span>
          </div>
          <div className="overflow-x-auto p-3 sm:p-4">
            <table className="w-full text-left text-xs sm:text-sm min-w-[600px]">
              <thead>
                <tr className="border-b border-gray-100 text-gray-400 text-[9px] sm:text-[10px] font-black uppercase tracking-widest">
                  <th className="py-3 sm:py-4 px-2">Customer</th>
                  <th className="py-3 sm:py-4 px-2">Vehicle ID</th>
                  <th className="py-3 sm:py-4 px-2">Facility Location</th>
                  <th className="py-3 sm:py-4 px-2">Operational Hours</th>
                  <th className="py-3 sm:py-4 px-2 text-center">Session State</th>
                  <th className="py-3 sm:py-4 px-2 text-right">Accrued Fare</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {transactions.map(t => (
                  <tr key={t.reserve_id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 sm:py-4 px-2 font-bold text-gray-900">{t.user_name}</td>
                    <td className="py-3 sm:py-4 px-2">
                       <span className="font-mono text-[10px] sm:text-xs font-bold bg-gray-50 px-1.5 sm:px-2 py-1 rounded text-gray-600 border border-gray-200">{t.vehicle_num}</span>
                    </td>
                    <td className="py-3 sm:py-4 px-2">
                      <p className="font-bold text-gray-800">{t.prime_loc}</p>
                      <p className="text-[9px] sm:text-[10px] text-gray-500 font-bold mt-0.5">SPOT #S{t.spot_id}</p>
                    </td>
                    <td className="py-3 sm:py-4 px-2">
                      <div className="flex flex-col gap-1">
                         <div className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-green-500"></span><span className="text-[10px] sm:text-[11px] font-medium text-gray-500">{new Date(t.start_time).toLocaleString('en-IN')}</span></div>
                         <div className="flex items-center gap-1.5"><span className={`w-1.5 h-1.5 rounded-full ${t.end_time ? 'bg-red-500' : 'bg-gray-300'}`}></span><span className={`text-[10px] sm:text-[11px] font-medium ${t.end_time ? 'text-gray-500' : 'text-gray-400 italic'}`}>{t.end_time ? new Date(t.end_time).toLocaleString('en-IN') : 'Ongoing session...'}</span></div>
                      </div>
                    </td>
                    <td className="py-3 sm:py-4 px-2 text-center">
                      <span className={`inline-flex items-center justify-center px-2 sm:px-3 py-1 rounded-full text-[9px] sm:text-[10px] font-black tracking-wider border ${t.is_ongoing ? 'bg-blue-50 text-blue-600 border-blue-200 animate-pulse' : 'bg-green-50 text-green-700 border-green-200'}`}>
                        {t.is_ongoing ? 'ACTIVE' : 'CLOSED'}
                      </span>
                    </td>
                    <td className="py-3 sm:py-4 px-2 text-right">
                       <span className={`font-black text-sm sm:text-lg ${t.fare ? 'text-gray-900' : 'text-gray-400'}`}>
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