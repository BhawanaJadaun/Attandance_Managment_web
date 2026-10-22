import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div
      className="
        min-h-screen overflow-hidden
        bg-slate-50 text-slate-800
        transition-colors duration-200
        dark:bg-slate-950 dark:text-slate-100
      "
    >
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="
            fixed inset-0 z-40
            bg-slate-900/40
            md:hidden
          "
        />
      )}

      {/* Sidebar */}
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* Main Area */}
      <div
        className="
          ml-0 flex min-h-screen flex-col
          bg-slate-50
          transition-colors duration-200
          md:ml-[250px]
          dark:bg-slate-950
        "
      >
        {/* Navbar */}
        <Navbar setSidebarOpen={setSidebarOpen} />

        {/* Page Content */}
        <main
          className="
            flex-1 overflow-y-auto
            bg-slate-50
            p-4 sm:p-5 lg:p-7
            transition-colors duration-200
            dark:bg-slate-950
          "
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;