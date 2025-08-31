import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import React from 'react';
import { Outlet } from 'react-router-dom';

const MainLayout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar */}
      <Navbar />

      <div className="flex flex-1">
        {/* Sidebar */}
        <div className="w-60">
          <Sidebar />
        </div>

        {/* Main Content */}
        <div className="flex-1 bg-gray-50 dark:bg-[#121212] transition-colors duration-300">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
