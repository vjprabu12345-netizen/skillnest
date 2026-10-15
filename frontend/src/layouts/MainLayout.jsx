import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function MainLayout() {
  return (
    <div className="relative min-h-screen bg-navy-950 flex flex-col justify-between selection:bg-brand-violet selection:text-white">
      {/* Background Ambient Glows */}
      <div className="glow-orb-purple -top-40 -left-40 opacity-40 fixed pointer-events-none" />
      <div className="glow-orb-blue top-1/3 -right-40 opacity-30 fixed pointer-events-none" />

      <Navbar />

      <main className="flex-1 relative z-10">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}
