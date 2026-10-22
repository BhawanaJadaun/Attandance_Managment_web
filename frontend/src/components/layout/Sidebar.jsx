import React from "react";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  ClipboardCheck,
  BarChart3,
  User,
  Settings,
  LogOut,
  X,
  CalendarDays,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const navigate = useNavigate();

  const menuItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Students",
      path: "/students",
      icon: Users,
    },
    {
      name: "Professors",
      path: "/professors",
      icon: GraduationCap,
    },
    {
      name: "Subjects",
      path: "/subjects",
      icon: BookOpen,
    },
    {
      name: "Attendance",
      path: "/attendance",
      icon: ClipboardCheck,
    },
    {
      name: "Reports",
      path: "/reports",
      icon: BarChart3,
    },
    {
      name: "Profile",
      path: "/profile",
      icon: User,
    },
    {
      name: "Settings",
      path: "/settings",
      icon: Settings,
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    setSidebarOpen(false);
    navigate("/login");
  };

  return (
    <aside
      className={`
        fixed inset-y-0 left-0 z-50
        flex w-[250px] flex-col
        border-r border-slate-200
        bg-white
        transition-transform duration-300
        md:translate-x-0
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}
    >
      {/* Logo */}
      <div className="flex h-[76px] items-center gap-3 border-b border-slate-100 px-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white">
          <CalendarDays size={21} />
        </div>

        <div className="flex flex-col leading-tight">
          <strong className="text-[15px] font-bold text-slate-900">
            Attendance
          </strong>

          <span className="mt-1 text-[11px] text-slate-500">
            Management System
          </span>
        </div>

        {/* Mobile Close */}
        <button
          type="button"
          onClick={() => setSidebarOpen(false)}
          className="ml-auto flex text-slate-500 hover:text-slate-900 md:hidden"
        >
          <X size={21} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-6">
        <p className="mb-3 ml-3 text-[10px] font-bold tracking-wider text-slate-400">
          MAIN MENU
        </p>

        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) => `
                  flex h-11 items-center gap-3 rounded-lg px-3
                  text-sm transition
                  ${
                    isActive
                      ? "bg-indigo-50 font-semibold text-indigo-600"
                      : "font-medium text-slate-500 hover:bg-slate-50 hover:text-indigo-600"
                  }
                `}
              >
                <Icon size={19} />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* Logout */}
      <div className="border-t border-slate-100 p-3">
        <button
          type="button"
          onClick={handleLogout}
          className="
            flex h-11 w-full items-center gap-3
            rounded-lg px-3
            text-sm font-medium text-slate-500
            transition
            hover:bg-red-50 hover:text-red-600
          "
        >
          <LogOut size={19} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;