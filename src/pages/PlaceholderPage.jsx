import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';

const PlaceholderPage = ({ title, icon: Icon }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <main className="flex-1 overflow-auto">
        <div className="bg-white shadow sticky top-0 z-10">
          <div className="px-6 py-4 md:pl-80">
            <h1 className="text-3xl font-bold text-gray-800">{title}</h1>
          </div>
        </div>
        <div className="p-6 md:pl-80">
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <Icon size={64} className="mx-auto text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{title}</h2>
            <p className="text-gray-600">Cette page est en cours de développement</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PlaceholderPage;
