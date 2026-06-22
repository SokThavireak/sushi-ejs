import { Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <div className="min-h-screen bg-[#f9fafb] text-gray-900 font-sans">
      <Outlet />
    </div>
  );
}
