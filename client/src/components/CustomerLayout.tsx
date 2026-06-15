import React from "react";
import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";
import { CartDrawer } from "./CartDrawer";
import { Footer } from "./Footer";

export default function CustomerLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-55 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <Navbar />
      <CartDrawer />
      <main className="flex-1 w-full pt-16 lg:pt-20">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
