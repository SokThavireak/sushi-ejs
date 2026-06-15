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
}

interface StockLog {
  id: number;
  report_date: string;
  location_name: string;
}

const API_BASE = import.meta.env.VITE_API_URL || "";

export default function ManagerEditDailyLog() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [log, setLog] = useState<StockLog | null>(null);
  const [items, setItems] = useState<LogItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit item quantities map
  const [quantities, setQuantities] = useState<Record<number, string>>({});

  const fetchLogDetails = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/manager/daily-stock/edit/${id}`, { withCredentials: true });
      setLog(res.data.log);
      const logItems = res.data.items || [];
      setItems(logItems);

      const qtyMap: Record<number, string> = {};
      logItems.forEach((item: LogItem) => {
        qtyMap[item.id] = String(item.quantity);
      });
      setQuantities(qtyMap);
    } catch (err: any) {
      console.error(err);
      Swal.fire("Error", err.response?.data?.error || "Failed to load log details", "error");
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

  const showNotification = (message: string, type: "success" | "error" = "success") => {
    const isDark = document.documentElement.classList.contains("dark");
    Swal.fire({
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      icon: type,
      title: message,
      background: isDark ? "#1f2937" : "#ffffff",
      color: isDark ? "#ffffff" : "#1f2937",
    });
  };

  const handleQuantityChange = (itemId: number, val: string) => {
    setQuantities((prev) => ({
      ...prev,
      [itemId]: val,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isDark = document.documentElement.classList.contains("dark");

    const result = await Swal.fire({
      title: "Update Stock Report?",
      text: "Save changes to this report?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#10b981",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, update report",
      background: isDark ? "#1f2937" : "#fff",
      color: isDark ? "#fff" : "#000",
      customClass: { popup: "rounded-2xl shadow-xl font-sans" },
    });

    if (!result.isConfirmed) return;

    try {
      const itemsToSubmit = items.map((item) => ({
        id: item.id,
        quantity: quantities[item.id] || "0",
      }));

      await axios.post(
        `${API_BASE}/api/manager/daily-stock/update/${id}`,
        { items: itemsToSubmit },
        { withCredentials: true }
      );

      showNotification("Report Updated Successfully!", "success");
      setTimeout(() => navigate("/manager/daily-stock/history"), 1000);
    } catch (err: any) {
      console.error(err);
      showNotification(err.response?.data?.error || "Error updating report", "error");
    }
  };

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 my-6 space-y-6">
      {/* Toast Notifications */}
      <div id="toast-container" className="fixed top-24 right-4 z-[9999] flex flex-col gap-3 pointer-events-none"></div>

      <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 mb-8 flex justify-between items-center transition-colors">
        <div>
          <h3 className="font-bold text-gray-808 dark:text-white text-2xl mb-1">Edit Stock Report #{log.id}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Location: <span className="font-bold text-indigo-600 dark:text-indigo-400">{log.location_name}</span> | Date:{" "}
            {new Date(log.report_date).toLocaleDateString()}
          </p>
        </div>
        <Link
          to="/manager/daily-stock/history"
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white font-bold text-sm"
        >
          Cancel
        </Link>
      </div>

      <form onSubmit={handleSubmit}>
        {categories.map((cat) => {
          const catItems = items.filter((item) => item.category === cat);
          if (catItems.length === 0) return null;

          return (
            <section key={cat} className="mb-12 stock-section">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2 border-b border-gray-250 dark:border-gray-850 pb-2">
                {cat}
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {catItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white dark:bg-gray-900 rounded-2xl p-3 shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition-all item-card"
                  >
                    <div className="text-center mb-2">
                      <h4 className="font-bold text-gray-800 dark:text-gray-200 text-sm leading-tight line-clamp-2 h-9 flex items-center justify-center">
                        {item.item_name}
                      </h4>
                      <span className="text-[10px] text-gray-400 uppercase font-bold">{item.unit}</span>
                    </div>

                    <div className="relative">
                      <input
                        type="number"
                        value={quantities[item.id] || ""}
                        onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                        min="0"
                        step="0.01"
                        className="w-full text-center bg-gray-50 dark:bg-gray-850 dark:text-white border border-gray-200 dark:border-gray-750 rounded-lg py-2.5 font-bold text-indigo-600 dark:text-indigo-400 focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        })}

        <div className="fixed bottom-6 right-6 z-40">
          <button
            type="submit"
            id="saveBtn"
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-full font-bold shadow-2xl transition-transform active:scale-95 flex items-center gap-3 text-lg border-2 border-white/20"
          >
            <i className="fa-solid fa-save"></i> Update Count
          </button>
        </div>
      </form>
    </div>
  );
}
