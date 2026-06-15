import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface SidebarLink {
  path: string;
  label: string;
  icon: string;
  roles?: string[];
}

export default function AdminLayout() {
  const { user, logout, hasRole } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [theme, setTheme] = useState<string>(localStorage.getItem("theme") || "light");
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const sidebarLinks: SidebarLink[] = [
    { path: "/staff/menu", label: "Menu Staff", icon: "fa-solid fa-utensils", roles: ["manager", "admin", "store_manager", "cashier"] },
    { path: "/admin/dashboard", label: "Dashboard", icon: "fa-solid fa-chart-pie", roles: ["manager", "admin", "store_manager", "cashier"] },
    { path: "/admin/inventory", label: "Inventory", icon: "fa-solid fa-box", roles: ["manager", "admin"] },
    { path: "/admin/category", label: "Category", icon: "fa-solid fa-tags", roles: ["manager", "admin"] },
    { path: "/admin/locations", label: "Locations", icon: "fa-solid fa-map-location-dot", roles: ["admin"] },
    { path: "/admin/users", label: "Users", icon: "fa-solid fa-users", roles: ["admin"] },
    { path: "/admin/orders", label: "Orders", icon: "fa-solid fa-cart-shopping" },
    { path: "/admin/reports", label: "Reports", icon: "fa-solid fa-file-invoice", roles: ["admin", "manager", "store_manager"] },
    { path: "/admin/stock", label: "Stock Requests", icon: "fa-solid fa-boxes-stacked", roles: ["admin", "manager", "store_manager"] },
    { path: "/admin/stock/menu", label: "Stock Menu", icon: "fa-solid fa-clipboard-list", roles: ["admin", "manager"] },
    { path: "/manager/daily-stock", label: "Daily Stock", icon: "fa-solid fa-clipboard-check", roles: ["store_manager", "admin", "manager"] },
    { path: "/manager/daily-stock/history", label: "Stock History", icon: "fa-solid fa-clock-rotate-left", roles: ["admin", "manager"] },
  ];

  // Filter links based on current user role and search query
  const filteredLinks = sidebarLinks.filter((link) => {
    // Check role access
    if (link.roles && !hasRole(link.roles)) {
      return false;
    }
    // Check search query
    return link.label.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const getPageTitle = () => {
    const activeLink = sidebarLinks.find((link) => location.pathname.startsWith(link.path));
    return activeLink ? activeLink.label : "Admin Panel";
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100 dark:bg-gray-950 text-gray-800 dark:text-gray-100 relative font-sans transition-colors duration-300">
      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300"
        />
      )}

      {/* Sidebar */}
      <aside
        id="sidebar"
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 flex flex-col flex-shrink-0 transform transition-transform duration-300 lg:static lg:translate-x-0 shadow-2xl lg:shadow-none ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-6 text-gray-950 dark:text-white font-bold text-xl flex items-center gap-3 justify-between lg:justify-start">
          <div className="flex items-center gap-3">
            <i className="fa-solid fa-layer-group text-orange-500"></i>
            <span>Murakami</span>
            <span className="text-orange-500">.</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white"
          >
            <i className="fa-solid fa-xmark text-2xl"></i>
          </button>
        </div>

        {/* Sidebar Search */}
        <div className="px-6 mb-6">
          <div className="relative">
            <i className="fa-solid fa-magnifying-glass absolute left-3 top-3 text-gray-500 text-sm"></i>
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-100 dark:bg-gray-800 text-sm text-gray-900 dark:text-white rounded-lg pl-9 pr-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-orange-500 placeholder-gray-500 dark:placeholder-gray-500 border border-transparent dark:border-transparent"
            />
          </div>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 space-y-2 pb-6 scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-700">
          <Link
            to="/"
            className="flex items-center gap-3 px-4 py-3 bg-orange-600 dark:bg-orange-700 text-white hover:bg-orange-700 dark:hover:bg-orange-800 rounded-xl transition-all duration-200 mb-6 shadow-lg shadow-orange-950/20 group"
          >
            <i className="fa-solid fa-globe w-5 text-center group-hover:rotate-12 transition-transform"></i>
            <span className="font-semibold">Website Home</span>
          </Link>

          {filteredLinks.map((link) => {
            const isActive = location.pathname.startsWith(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? "text-orange-500 bg-orange-50 dark:bg-gray-800 font-bold"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-orange-500 dark:hover:text-orange-400"
                }`}
              >
                <i className={`${link.icon} w-5 text-center transition-transform group-hover:scale-110 ${isActive ? "scale-110" : ""}`}></i>
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer / Logout */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 dark:hover:text-red-300 rounded-lg transition"
          >
            <i className="fa-solid fa-right-from-bracket w-5 text-center"></i>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden w-full bg-gray-50 dark:bg-gray-900 transition-colors">
        {/* Header */}
        <header className="h-16 lg:h-20 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 lg:px-8 transition-colors duration-300 shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-600 dark:text-gray-200 hover:text-orange-600 dark:hover:text-orange-400 focus:outline-none transition-transform active:scale-95"
            >
              <i className="fa-solid fa-bars text-2xl"></i>
            </button>
            <h2 className="text-xl lg:text-2xl font-bold text-gray-950 dark:text-white">
              {getPageTitle()}
            </h2>
          </div>

          <button
            onClick={toggleTheme}
            className="w-10 h-10 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors focus:outline-none"
          >
            <i id="theme-icon" className={`fa-solid ${theme === "dark" ? "fa-sun" : "fa-moon"} text-lg`}></i>
          </button>
        </header>

        {/* Content Wrapper */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
