import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

interface LogItem {
  id: number;
  log_id: number;
  item_name: string;
  category: string;
  quantity: number | string;
  unit: string;
  image_url: string | null;
}

interface StockLog {
  id: number;
  report_date: string;
  location_name: string;
  email: string | null;
}

const API_BASE = import.meta.env.VITE_API_URL || "";

export default function ManagerViewDailyLog() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [log, setLog] = useState<StockLog | null>(null);
  const [items, setItems] = useState<LogItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogDetails = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/manager/daily-stock/view/${id}`, { withCredentials: true });
      setLog(res.data.log);
      setItems(res.data.items || []);
    } catch (err: any) {
      console.error(err);
      Swal.fire("Error", err.response?.data?.error || "Failed to load report details", "error");
      navigate("/manager/daily-stock/history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchLogDetails();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500 dark:text-gray-400 flex items-center gap-2">
          <i className="fa-solid fa-spinner fa-spin text-2xl"></i> Loading daily log details...
        </div>
      </div>
    );
  }

  if (!log) {
    return (
      <div className="text-center p-8 text-red-500">
        <p>Report not found</p>
        <Link to="/manager/daily-stock/history" className="text-indigo-650 dark:text-indigo-400 hover:underline">
          Back to History
        </Link>
      </div>
    );
  }

  const categories = ["Cook", "Drink", "Supplies", "Packaging"];
  const hasItems = items.length > 0;

  return (
    <div className="max-w-6xl mx-auto space-y-6 my-6">
      <Link
        to="/manager/daily-stock/history"
        className="inline-flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white font-bold text-sm transition"
      >
        <i className="fa-solid fa-arrow-left"></i> Back to History
      </Link>

      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-105 dark:border-gray-800 overflow-hidden transition-colors">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-950/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-808 dark:text-white mb-1">Daily Stock Report</h1>
            <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400 mt-2">
              <p className="flex items-center gap-2">
                <i className="fa-regular fa-calendar"></i>
                <span className="font-bold text-gray-700 dark:text-gray-200">
                  {new Date(log.report_date).toLocaleDateString()}
                </span>
              </p>
              <p className="flex items-center gap-2">
                <i className="fa-regular fa-user"></i>
                <span className="font-bold text-gray-700 dark:text-gray-200">
                  {log.email || "Unknown"}
                </span>
              </p>
            </div>
          </div>
          <div className="text-right flex flex-col items-end">
            <span className="bg-indigo-600 text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-sm flex items-center gap-2">
              <i className="fa-solid fa-location-dot text-xs"></i>
              {log.location_name}
            </span>
            <p className="text-xs text-gray-450 mt-2 font-mono">Log ID: #{log.id}</p>
          </div>
        </div>

        <div className="p-8 bg-gray-50/50 dark:bg-gray-950/50">
          {hasItems ? (
            categories.map((cat) => {
              const catItems = items.filter((item) => item.category === cat);
              if (catItems.length === 0) return null;

              return (
                <div key={cat} className="mb-10 last:mb-0">
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                    {cat === "Cook" && <i className="fa-solid fa-utensils text-orange-500"></i>}
                    {cat === "Drink" && <i className="fa-solid fa-glass-water text-blue-500"></i>}
                    {cat === "Supplies" && <i className="fa-solid fa-boxes-stacked text-purple-500"></i>}
                    {cat === "Packaging" && <i className="fa-solid fa-box-open text-amber-600"></i>}
                    <span>{cat}</span>
                    <span className="ml-2 text-xs font-normal bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full">
                      {catItems.length}
                    </span>
                  </h3>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {catItems.map((item) => (
                      <div
                        key={item.id}
                        className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col relative group hover:shadow-md transition-all"
                      >
                        <div className="h-28 w-full rounded-lg bg-gray-50 dark:bg-gray-750 mb-3 overflow-hidden flex items-center justify-center relative">
                          <img
                            src={item.image_url || "https://via.placeholder.com/150?text=No+Img"}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            alt={item.item_name}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "https://via.placeholder.com/150?text=No+Img";
                            }}
                          />
                          <div className="absolute top-2 right-2">
                            <span className="text-[10px] font-bold bg-white/90 dark:bg-black/80 text-gray-600 dark:text-gray-300 px-1.5 py-0.5 rounded shadow-sm uppercase">
                              {item.unit}
                            </span>
                          </div>
                        </div>

                        <h4 className="font-bold text-gray-800 dark:text-white text-sm leading-tight mb-2 line-clamp-2 min-h-[2.5em]">
                          {item.item_name}
                        </h4>

                        <div className="mt-auto pt-2 border-t border-gray-50 dark:border-gray-700 flex justify-between items-center">
                          <span className="text-xs text-gray-400 font-medium uppercase">Counted</span>
                          <span className="text-lg font-bold text-indigo-650 dark:text-indigo-400">
                            {item.quantity}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-16 text-gray-400">
              <i className="fa-regular fa-clipboard text-4xl mb-3 opacity-50"></i>
              <p>No items were recorded in this log.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
