import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../common/Sidebar';
import Navbar from '../common/Navbar';
import Footer from '../common/Footer';
import './AppLayout.css';

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-layout">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      <div className="app-body">
        <Navbar onToggleSidebar={() => setSidebarOpen(prev => !prev)} />
        
        <main className="app-main">
          <div className="container">
            <Outlet />
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}
