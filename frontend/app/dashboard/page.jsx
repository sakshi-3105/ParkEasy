"use client";
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function UserDashboard() {
  const [lots, setLots] = useState([]);
  const [bookings, setBookings] = useState([]); 
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showShadedOnly, setShowShadedOnly] = useState(false);

  // Path 2 States: Spot Selection Modal
  const [selectedLot, setSelectedLot] = useState(null); // The lot user clicked on
  const [lotSpots, setLotSpots] = useState([]); // The spots inside that lot
  const [isModalOpen, setIsModalOpen] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    } else {
      setUserName(storedUser.name);
      fetchLots();
      fetchUserBookings(storedUser.user_id);
    }
  }, []);

  const fetchLots = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/user/lots');
      setLots(response.data);
    } catch (err) { console.error("Error fetching lots"); }
    finally { setLoading(false); }
  };

  const fetchUserBookings = async (userId) => {
    try {
      const response = await axios.get(`http://localhost:3001/api/user/my-bookings/${userId}`);
      setBookings(response.data);
    } catch (err) { console.error("Error fetching bookings"); }
  };

  // NEW: Open Modal and fetch specific spots
  const openBookingModal = async (lot) => {
    setSelectedLot(lot);
    setIsModalOpen(true);
    try {
      const response = await axios.get(`http://localhost:3001/api/user/lots/${lot.lot_id}/spots`);
      setLotSpots(response.data);
    } catch (err) {
      alert("Could not load spots for this lot.");
    }
  };

  const handleFinalBooking = async (spotId) => {
    const vehicleNum = prompt("Confirm Vehicle Number:");
    if (!vehicleNum) return;
  
    const user = JSON.parse(localStorage.getItem('user'));
  
    try {
      await axios.post('http://localhost:3001/api/user/book', {
        user_id: user.user_id,
        lot_id: selectedLot.lot_id,
        vehicle_num: vehicleNum,
        spot_id: spotId // Sending the specific spot chosen
      });
      
      alert("Booking confirmed!");
      setIsModalOpen(false);
      fetchLots();
      fetchUserBookings(user.user_id);
    } catch (err) {
      alert(err.response?.data?.error || "Booking failed");
    }
  };

  const handleCheckout = async (reserveId) => {
    try {
      const response = await axios.put(`http://localhost:3001/api/user/checkout/${reserveId}`);
      alert(`Checkout Success! Total: ${response.data.total_bill}`);
      fetchLots();
      fetchUserBookings(JSON.parse(localStorage.getItem('user')).user_id);
    } catch (err) { alert("Checkout failed"); }
  };

  const filteredLots = lots.filter(lot => {
    const matchesSearch = lot.prime_loc.toLowerCase().includes(searchTerm.toLowerCase()) || lot.pincode.includes(searchTerm);
    return matchesSearch && (showShadedOnly ? lot.is_shaded : true);
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-20 relative">
      <nav className="bg-white shadow-sm px-8 py-4 flex justify-between items-center sticky top-0 z-10">
        <h1 className="text-2xl font-bold text-blue-600 font-mono tracking-tighter">PARKEASY</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-600 font-medium">Welcome, {userName}</span>
          <button onClick={() => { localStorage.clear(); router.push('/login'); }} className="text-sm font-semibold text-red-500 hover:bg-red-50 px-3 py-1 rounded-md">Logout</button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-8">
        {/* Active Bookings Section */}
        {bookings.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">My Active Bookings</h2>
            {bookings.map((booking) => (
              <div key={booking.reserve_id} className="bg-blue-600 text-white rounded-2xl p-6 flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-2xl font-bold">Spot #{booking.spot_id}</h3>
                  <p className="opacity-90">Vehicle: {booking.vehicle_num}</p>
                </div>
                <button onClick={() => handleCheckout(booking.reserve_id)} className="bg-white text-blue-600 px-8 py-3 rounded-xl font-bold">Checkout</button>
              </div>
            ))}
          </section>
        )}

        {/* Search Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-8 bg-white p-4 rounded-2xl shadow-sm">
          <input type="text" placeholder="Search location..." className="flex-grow p-3 border rounded-xl outline-none" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          <div className="flex items-center gap-2"><input type="checkbox" checked={showShadedOnly} onChange={(e) => setShowShadedOnly(e.target.checked)} /><label className="text-sm font-bold">Shaded Only</label></div>
        </div>

        {/* Lots Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLots.map((lot) => (
            <div key={lot.lot_id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex justify-between mb-4">
                <h3 className="text-xl font-bold">{lot.prime_loc}</h3>
                <span className="text-[10px] bg-gray-100 p-1 rounded font-black">{lot.is_shaded ? 'SHADED' : 'OPEN'}</span>
              </div>
              <p className="text-gray-500 text-sm mb-6">{lot.address}</p>
              <div className="flex justify-between items-center">
                <p className="font-bold">₹{lot.price_per_hr}/hr</p>
                <button onClick={() => openBookingModal(lot)} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold">Select Spot</button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* --- SPOT SELECTION MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Select a Spot at {selectedLot?.prime_loc}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-2xl text-gray-400">&times;</button>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-5 gap-4">
              {lotSpots.map((spot) => (
                <button
                  key={spot.spot_id}
                  disabled={spot.status === 'o'}
                  onClick={() => handleFinalBooking(spot.spot_id)}
                  className={`aspect-square rounded-xl flex flex-col items-center justify-center border-2 transition-all ${
                    spot.status === 'a' 
                    ? 'border-green-500 bg-green-50 hover:bg-green-500 hover:text-white cursor-pointer' 
                    : 'border-red-200 bg-red-50 text-red-300 cursor-not-allowed'
                  }`}
                >
                  <span className="text-xs font-bold">P-{spot.spot_id}</span>
                  <span className="text-[8px] uppercase">{spot.status === 'a' ? 'Free' : 'Occupied'}</span>
                </button>
              ))}
            </div>

            <div className="mt-8 flex justify-center gap-6 text-sm">
              <div className="flex items-center gap-2"><div className="w-4 h-4 bg-green-500 rounded"></div> Available</div>
              <div className="flex items-center gap-2"><div className="w-4 h-4 bg-red-100 rounded"></div> Occupied</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}