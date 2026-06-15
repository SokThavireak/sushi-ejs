import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { useAuth } from "../../context/AuthContext";

interface StockItem {
  id: number;
  name: string;
  category: string;
  unit: string;
}

interface Location {
  id: number;
  name: string;
}

interface RequestLine {
  id: string; // unique react key
  category: string;
  name: string;
  quantity: number | "";
  unit: string;
}

const API_BASE = import.meta.env.VITE_API_URL || "";

export default function AdminCreateStockRequest() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [locations, setLocations] = useState<Location[]>([]);
  const [masterStocks, setMasterStocks] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [locationName, setLocationName] = useState("");
  const [lines, setLines] = useState<RequestLine[]>([]);

  const fetchCreateData = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/admin/stock/create`, { withCredentials: true });
      setLocations(res.data.locations || []);
      setMasterStocks(res.data.stocks || []);

      // If store_manager, location is fixed
      if (user?.role?.trim().toLowerCase() === "store_manager" && user.assigned_location_id) {
        const found = (res.data.locations || []).find((l: Location) => l.id === user.assigned_location_id);
        if (found) setLocationName(found.name);
      } else if (res.data.locations && res.data.locations.length > 0) {
        setLocationName(res.data.locations[0].name);
      }
    } catch (err: any) {
      console.error(err);
      Swal.fire("Error", "Failed to load locations and inventory items", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCreateData();
  }, []);

  // Add initial row on mount when data is ready
  useEffect(() => {
    if (!loading && lines.length === 0) {
      handleAddLine();
    }
  }, [loading]);

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

  const handleAddLine = () => {
    const newLine: RequestLine = {
      id: Math.random().toString(36).substr(2, 9),
      category: "",
      name: "",
      quantity: "",
      unit: "UNIT",
    };
    setLines((prev) => [...prev, newLine]);
  };

  const handleRemoveLine = (id: string) => {
    setLines((prev) => prev.filter((line) => line.id !== id));
  };

  const handleLineChange = (id: string, field: keyof RequestLine, value: any) => {
    setLines((prev) =>
      prev.map((line) => {
        if (line.id !== id) return line;

        const updated = { ...line, [field]: value };

        // If category changes, reset selected item name and unit
        if (field === "category") {
          updated.name = "";
          updated.unit = "UNIT";
        }

        // If name changes, lookup item to find its unit
        if (field === "name") {
          const item = masterStocks.find((s) => s.name === value);
          updated.unit = item ? item.unit.toUpperCase() : "UNIT";
        }

        return updated;
      })
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isDark = document.documentElement.classList.contains("dark");

    const validLines = lines.filter((l) => l.category && l.name && Number(l.quantity) > 0);

    if (validLines.length === 0) {
      showNotification("Please add at least one complete line item with quantity > 0", "error");
      return;
    }

    try {
      const btn = document.getElementById("submitRequestBtn") as HTMLButtonElement;
      if (btn) btn.disabled = true;

      await axios.post(
        `${API_BASE}/api/stock/create`,
        {
          location_name: locationName,
          items: validLines.map((l) => ({
            category: l.category,
            name: l.name,
            quantity: Number(l.quantity),
          })),
        },
        { withCredentials: true }
      );

      Swal.fire({
        title: "Success!",
        text: "Request Created Successfully!",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
        background: isDark ? "#111827" : "#fff",
        color: isDark ? "#fff" : "#000",
      }).then(() => {
        navigate("/admin/stock");
      });
    } catch (err: any) {
      console.error(err);
      showNotification(err.response?.data?.error || "Error creating request", "error");
      const btn = document.getElementById("submitRequestBtn") as HTMLButtonElement;
      if (btn) btn.disabled = false;
    }
  };

  const isStoreManager = user?.role?.trim().toLowerCase() === "store_manager";

  return (
    <div className="max-w-4xl mx-auto bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden my-10 transition-colors">
      <div className="p-6 flex justify-between items-center border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-950/50">
        <div>
          <h3 className="font-bold text-gray-805 dark:text-white text-lg">Create Stock Request</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">Select items from the master menu to restock</p>
        </div>
        <Link to="/admin/stock" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition">
          <i className="fa-solid fa-xmark text-xl"></i>
        </Link>
      </div>

      <div className="p-8">
        {loading ? (
          <div className="text-center py-6 text-gray-500">
            <i className="fa-solid fa-spinner fa-spin mr-2"></i> Loading stock request form...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">
                Requesting For Location
              </label>

              {isStoreManager ? (
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i className="fa-solid fa-store text-gray-400"></i>
                  </div>
                  <input
                    type="text"
                    value={locationName || "My Assigned Store"}
                    disabled
                    className="pl-10 w-full bg-gray-100 dark:bg-gray-800 border border-gray-250 dark:border-gray-700 rounded-lg p-3 text-gray-650 dark:text-gray-300 font-bold"
                  />
                </div>
              ) : (
                <div className="relative">
                  <select
                    value={locationName}
                    onChange={(e) => setLocationName(e.target.value)}
                    className="w-full bg-white dark:bg-gray-800 border border-gray-250 dark:border-gray-700 rounded-lg p-3 text-gray-800 dark:text-white font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    {locations.length > 0 ? (
                      locations.map((loc) => (
                        <option key={loc.id} value={loc.name}>
                          {loc.name}
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>
                        No locations available
                      </option>
                    )}
                  </select>
                </div>
              )}
            </div>

            <div className="border-t border-b border-gray-100 dark:border-gray-800 py-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-707 dark:text-gray-200 flex items-center gap-2">
                  <i className="fa-solid fa-list-check text-indigo-500"></i> Items Needed
                </h3>
                <button
                  type="button"
                  onClick={handleAddLine}
                  className="bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 px-4 py-2 rounded-lg text-xs font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition flex items-center gap-2 shadow-sm"
                >
                  <i className="fa-solid fa-plus"></i> Add Another Line
                </button>
              </div>

              <div className="grid grid-cols-12 gap-3 mb-2 px-1">
                <div className="col-span-3 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase">
                  Category
                </div>
                <div className="col-span-5 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase">
                  Item Name
                </div>
                <div className="col-span-3 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase">
                  Quantity
                </div>
                <div className="col-span-1"></div>
              </div>

              <div id="items-container" className="space-y-3">
                {lines.map((line) => {
                  const filteredStocks = masterStocks.filter((s) => s.category === line.category);

                  return (
                    <div
                      key={line.id}
                      className="grid grid-cols-12 gap-3 items-center item-row bg-gray-50 dark:bg-gray-850 p-2 rounded-lg border border-gray-100 dark:border-gray-800 animate-fade-in transition-colors"
                    >
                      <div className="col-span-3">
                        <select
                          value={line.category}
                          onChange={(e) => handleLineChange(line.id, "category", e.target.value)}
                          className="category-select w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2.5 text-sm font-medium text-gray-600 dark:text-gray-300 focus:border-indigo-500 focus:outline-none"
                        >
                          <option value="" disabled>
                            Select...
                          </option>
                          <option value="Cook">Cook</option>
                          <option value="Drink">Drink</option>
                          <option value="Supplies">Supplies</option>
                          <option value="Packaging">Packaging</option>
                        </select>
                      </div>

                      <div className="col-span-5 relative">
                        <select
                          value={line.name}
                          onChange={(e) => handleLineChange(line.id, "name", e.target.value)}
                          disabled={!line.category}
                          className={`item-select w-full border border-gray-250 dark:border-gray-700 rounded-lg p-2.5 text-sm font-bold focus:border-indigo-500 focus:outline-none ${
                            !line.category
                              ? "bg-gray-100 dark:bg-gray-950 opacity-60 cursor-not-allowed text-gray-450 dark:text-gray-600"
                              : "bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
                          }`}
                        >
                          <option value="" disabled>
                            {line.category ? "-- Select Item --" : "-- Choose Category First --"}
                          </option>
                          {filteredStocks.map((s) => (
                            <option key={s.id} value={s.name}>
                              {s.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="col-span-3 relative">
                        <input
                          type="number"
                          min="1"
                          placeholder="0"
                          value={line.quantity}
                          onChange={(e) =>
                            handleLineChange(line.id, "quantity", parseInt(e.target.value) || "")
                          }
                          className="qty-input w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2.5 text-sm font-bold text-gray-808 dark:text-white focus:border-indigo-500 focus:outline-none pl-3 pr-12"
                        />
                        <span className="unit-badge absolute right-3 top-2.5 text-[10px] font-bold text-gray-400 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">
                          {line.unit}
                        </span>
                      </div>

                      <div className="col-span-1 flex justify-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveLine(line.id)}
                          className="w-8 h-8 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-950/20 hover:border-red-105 hover:text-red-505 transition flex items-center justify-center shadow-sm"
                        >
                          <i className="fa-solid fa-trash text-xs"></i>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                id="submitRequestBtn"
                className="w-full md:w-auto px-8 py-3 bg-indigo-650 hover:bg-indigo-750 text-white rounded-xl font-bold shadow-lg transition flex items-center justify-center gap-2"
              >
                <span>Submit Request</span>
                <i className="fa-solid fa-paper-plane"></i>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
