import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

interface ChartItem {
  day: string;
  daily_sales: string;
}

interface StatusItem {
  status: string;
  count: string;
}

interface LocationItem {
  id: number;
  name: string;
}

export const AdminDashboard: React.FC = () => {
  const [data, setData] = useState<{
    productsCount: number;
    userCount: number;
    ordersCount: number;
    totalRevenue: string;
    chartData: ChartItem[];
    statusData: StatusItem[];
    locations: LocationItem[];
    currentFilter: string;
  } | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [filterLocation, setFilterLocation] = useState<string>("All");

  const API_BASE = import.meta.env.VITE_API_URL || "";

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${API_BASE}/api/admin/dashboard?location=${filterLocation}`
      );
      setData(res.data);
    } catch (err) {
      console.error("Error fetching dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [filterLocation]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 font-sans mt-24">
      {/* Title & Filter Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-950 dark:text-white flex items-center gap-2">
            <i className="fa-solid fa-chart-pie text-orange-500"></i> Store Dashboard
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">View real-time store metrics</p>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-sm font-bold text-gray-600 dark:text-gray-400 uppercase">
            Filter Location:
          </label>
          <select
            value={filterLocation}
            onChange={(e) => setFilterLocation(e.target.value)}
            className="p-2.5 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl text-sm font-bold text-gray-700 dark:text-white focus:outline-none"
          >
            <option value="All">All Locations</option>
            {data?.locations.map((loc) => (
              <option key={loc.id} value={loc.name}>
                {loc.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-500">Loading metrics...</div>
      ) : data ? (
        <>
          {/* Dashboard Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
            {/* Total Revenue */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4">
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-xl text-2xl">
                <i className="fa-solid fa-dollar-sign"></i>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wide">
                  Total Revenue
                </p>
                <p className="text-2xl font-black text-gray-900 dark:text-white">
                  {data.totalRevenue} $
                </p>
              </div>
            </div>

            {/* Total Orders */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4">
              <div className="p-4 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 rounded-xl text-2xl">
                <i className="fa-solid fa-cart-shopping"></i>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wide">
                  Orders Count
                </p>
                <p className="text-2xl font-black text-gray-900 dark:text-white">
                  {data.ordersCount}
                </p>
              </div>
            </div>

            {/* Products List */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4">
              <div className="p-4 bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 rounded-xl text-2xl">
                <i className="fa-solid fa-utensils"></i>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wide">
                  Master Menu
                </p>
                <p className="text-2xl font-black text-gray-900 dark:text-white">
                  {data.productsCount} Items
                </p>
              </div>
            </div>

            {/* Total Users */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4">
              <div className="p-4 bg-yellow-50 dark:bg-yellow-950/30 text-yellow-600 dark:text-yellow-400 rounded-xl text-2xl">
                <i className="fa-solid fa-users"></i>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wide">
                  User Accounts
                </p>
                <p className="text-2xl font-black text-gray-900 dark:text-white">
                  {data.userCount}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Sales Chart Info */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 lg:col-span-2">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-6">
                Recent Daily Sales (Last 7 Days)
              </h3>
              <div className="space-y-4">
                {data.chartData.length > 0 ? (
                  data.chartData.map((chart, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        {chart.day}
                      </span>
                      <div className="flex-1 mx-4 h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-orange-500 rounded-full"
                          style={{
                            width: `${Math.min(
                              (parseFloat(chart.daily_sales) /
                                Math.max(...data.chartData.map((d) => parseFloat(d.daily_sales) || 1))) *
                                100,
                              100
                            )}%`,
                          }}
                        />
                      </div>
                      <span className="font-bold text-gray-900 dark:text-white">
                        {parseFloat(chart.daily_sales).toFixed(2)} $
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 py-10 text-center">No sales completed recently</p>
                )}
              </div>
            </div>

            {/* Status counts */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 col-span-1">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-6">
                Orders Status Count
              </h3>
              <div className="space-y-4">
                {data.statusData.length > 0 ? (
                  data.statusData.map((status, i) => (
                    <div key={i} className="flex justify-between items-center text-sm border-b dark:border-gray-700 pb-2 last:border-0">
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        {status.status}
                      </span>
                      <span className="font-bold bg-orange-100 dark:bg-orange-950 text-orange-600 dark:text-orange-400 px-3 py-1 rounded-full text-xs">
                        {status.count} orders
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 py-10 text-center">No orders found</p>
                )}
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-25 text-gray-400">Error loading dashboard metrics.</div>
      )}
    </div>
  );
};
