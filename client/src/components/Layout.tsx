import { Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans">
      <Outlet />
    </div>
  );
}
