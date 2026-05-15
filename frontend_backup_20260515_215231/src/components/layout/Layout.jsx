import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../../features/home/components/Header/Header';
import Footer from '../../features/home/components/Footer/Footer';

const Layout = () => {
  return (
    <div className="app-layout">
      <Header />
      <main className="main-content">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
