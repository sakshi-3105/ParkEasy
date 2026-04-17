"use client";
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="flex justify-between items-center px-8 py-6 max-w-7xl mx-auto">
        <h1 className="text-2xl font-black text-blue-600 tracking-tighter">PARKEASY</h1>
        <div className="space-x-4">
          <Link href="/login" className="text-gray-600 font-medium hover:text-blue-600 transition-colors">
            Login
          </Link>
          <Link href="/signup" className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-8 py-20 flex flex-col items-center text-center">
        <div className="inline-block px-4 py-1.5 mb-6 text-sm font-bold tracking-widest text-blue-600 uppercase bg-blue-50 rounded-full">
          Parking Simplified for Pune
        </div>
        <h2 className="text-5xl md:text-7xl font-black text-gray-900 mb-8 leading-tight">
          Find your perfect spot <br /> 
          <span className="text-blue-600">before you arrive.</span>
        </h2>
        <p className="max-w-2xl text-xl text-gray-500 mb-10 leading-relaxed">
          Real-time availability, secure booking, and instant checkouts. 
          Stop circling the block and start parking with ParkEasy.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/signup" className="bg-gray-900 text-white px-10 py-4 rounded-2xl font-bold text-lg hover:scale-105 transition-transform shadow-xl">
            Register Now
          </Link>
          <Link href="/login" className="bg-white text-gray-900 border-2 border-gray-100 px-10 py-4 rounded-2xl font-bold text-lg hover:bg-gray-50 transition-colors">
            Member Login
          </Link>
        </div>

        {/* Features Preview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-32 w-full">
          <div className="p-8 rounded-3xl bg-gray-50 border border-gray-100 text-left">
            <div className="text-3xl mb-4">📍</div>
            <h4 className="text-xl font-bold mb-2">Prime Locations</h4>
            <p className="text-gray-500">Access thousands of spots across MG Road, Kothrud, Baner, and more.</p>
          </div>
          <div className="p-8 rounded-3xl bg-gray-50 border border-gray-100 text-left">
            <div className="text-3xl mb-4">⚡</div>
            <h4 className="text-xl font-bold mb-2">Instant Booking</h4>
            <p className="text-gray-500">Choose your specific spot from our visual map and book in seconds.</p>
          </div>
          <div className="p-8 rounded-3xl bg-gray-50 border border-gray-100 text-left">
            <div className="text-3xl mb-4">💰</div>
            <h4 className="text-xl font-bold mb-2">Transparent Pricing</h4>
            <p className="text-gray-500">Pay-as-you-go rates with detailed checkout receipts and history.</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-10 text-center text-gray-400 text-sm">
        © 2026 ParkEasy Pune. All rights reserved.
      </footer>
    </div>
  );
}