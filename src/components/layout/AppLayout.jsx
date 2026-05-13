import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import MobileBottomNav from "./MobileBottomNav";

export default function AppLayout() {
  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Navbar />
      <main className="flex-1 md:pb-0 pb-16">
        <Outlet />
      </main>
      <Footer className="hidden md:block" />
      <MobileBottomNav />
    </div>
  );
}