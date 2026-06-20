import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useHeader } from "../../context/HeaderContext";

interface StockItem {
  id: number;
  name: string;
  category: string;
  unit: string;
  image_url: string | null;
  quantity: number;
}

const API_BASE = import.meta.env.VITE_API_URL || "";

export default function AdminStockMenu() {
  const { setHeaderContent } = useHeader();
  const [stocks, setStocks] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const observerTarget = useRef<HTMLDivElement>(null);
  const [visibleLimit, setVisibleLimit] = useState<number>(10);

  useEffect(() => {
    setVisibleLimit(10);
  }, [searchTerm]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleLimit((prev) => prev + 10);
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [stocks, searchTerm]);

  const filteredStocks = stocks.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const displayedStocks = filteredStocks.slice(0, visibleLimit);

  // Modals state
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  useEffect(() => {
    setHeaderContent(
      <div className="flex items-center gap-2">
        <div className="relative w-48">
          <i className="fa-solid fa-magnifying-glass absolute left-2.5 top-2.5 text-gray-400 text-xs"></i>
          <input
            type="text"
            placeholder="Search ingredients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-7 pr-3 py-1.5 border border-gray-200 dark:border-zinc-800 bg-white dark:bg-[#18181b] rounded-lg text-xs font-semibold text-gray-700 dark:text-white focus:outline-none shadow-sm transition-colors placeholder-gray-400"
          />
        </div>
        <button
          onClick={() => setAddModalOpen(true)}
          className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm transition flex items-center gap-1 shrink-0"
        >
          <i className="fa-solid fa-plus text-[10px]"></i> Add Item
        </button>
      </div>
    );
    return () => setHeaderContent(null);
  }, [searchTerm, setHeaderContent]);

  // Add Item form states
  const [addName, setAddName] = useState("");
  const [addCategory, setAddCategory] = useState("Cook");
  const [addUnit, setAddUnit] = useState("kg");
  const [addImageFile, setAddImageFile] = useState<File | null>(null);

  // Edit Item form states
  const [editId, setEditId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editCategory, setEditCategory] = useState("Cook");
  const [editUnit, setEditUnit] = useState("kg");
  const [editImageUrl, setEditImageUrl] = useState("");

  const fetchStockMenu = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/api/admin/stock/menu`, { withCredentials: true });
      setStocks(res.data.stocks || []);
    } catch (err: any) {
      console.error(err);
      showNotification(err.response?.data?.error || "Error loading stock menu", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStockMenu();
  }, []);

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

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", addName);
    formData.append("category", addCategory);
    formData.append("unit", addUnit);
    if (addImageFile) {
      formData.append("image", addImageFile);
    }

    try {
      await axios.post(`${API_BASE}/admin/stock/menu/add`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });
      showNotification("Item Added Successfully!", "success");
      setAddModalOpen(false);
      // Reset fields
      setAddName("");
      setAddCategory("Cook");
      setAddUnit("kg");
      setAddImageFile(null);
      fetchStockMenu();
    } catch (err: any) {
      console.error(err);
      showNotification(err.response?.data?.error || "Error adding item", "error");
    }
  };

  const handleOpenEdit = (item: StockItem) => {
    setEditId(item.id);
    setEditName(item.name);
    setEditCategory(item.category);
    setEditUnit(item.unit);
    setEditImageUrl(item.image_url || "");
    setEditModalOpen(true);
  };

  const handleEditSubmit = async () => {
    const isDark = document.documentElement.classList.contains("dark");
    const result = await Swal.fire({
      title: "Update Item?",
      text: "Save changes to this item?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#10b981",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, update item",
      background: isDark ? "#111827" : "#fff",
      color: isDark ? "#fff" : "#000",
      customClass: { popup: "rounded-2xl shadow-xl font-sans" },
    });

    if (!result.isConfirmed) return;

    try {
      await axios.patch(
        `${API_BASE}/api/stock/menu/${editId}`,
        { name: editName, category: editCategory, unit: editUnit, image_url: editImageUrl },
        { withCredentials: true }
      );
      showNotification("Item Updated Successfully!", "success");
      setEditModalOpen(false);
      fetchStockMenu();
    } catch (err: any) {
      console.error(err);
      showNotification(err.response?.data?.error || "Error updating item", "error");
    }
  };

  const handleDeleteItem = async (itemId: number) => {
    const isDark = document.documentElement.classList.contains("dark");
    const result = await Swal.fire({
      title: "Delete Item?",
      text: "Permanently delete this item from the master menu?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete item",
      background: isDark ? "#111827" : "#fff",
      color: isDark ? "#fff" : "#000",
      customClass: { popup: "rounded-2xl shadow-xl font-sans" },
    });

    if (!result.isConfirmed) return;

    try {
      await axios.delete(`${API_BASE}/api/stock/menu/${itemId}`, { withCredentials: true });
      showNotification("Item Deleted", "success");
      fetchStockMenu();
    } catch (err: any) {
      console.error(err);
      showNotification(err.response?.data?.error || "Error deleting item", "error");
    }
  };

  const categories = ["Cook", "Drink", "Supplies", "Packaging"];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Cook":
        return <i className="fa-solid fa-utensils text-orange-500 mr-2"></i>;
      case "Drink":
        return <i className="fa-solid fa-glass-water text-blue-500 mr-2"></i>;
      case "Supplies":
        return <i className="fa-solid fa-boxes-stacked text-purple-500 mr-2"></i>;
      case "Packaging":
        return <i className="fa-solid fa-box-open text-amber-605 mr-2"></i>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notifications */}
      <div id="toast-container" className="fixed top-24 right-4 z-[9999] flex flex-col gap-3 pointer-events-none"></div>

      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden transition-colors">
        <div className="p-6 bg-gray-50 dark:bg-gray-950 min-h-[400px] transition-colors space-y-8">
          {loading ? (
            <div className="text-center py-8 text-gray-500">
              <i className="fa-solid fa-spinner fa-spin mr-2"></i> Loading stock menu...
            </div>
          ) : (
            categories.map((catName) => {
              const totalItems = filteredStocks.filter((item) => item.category === catName);
              const items = displayedStocks.filter((item) => item.category === catName);

              if (items.length === 0) return null;

              return (
                <div key={catName} className="group-section">
                  <h2 className="text-xl font-bold text-gray-850 dark:text-white mb-4 flex items-center">
                    {getCategoryIcon(catName)}
                    <span>{catName}</span>
                    <span className="text-xs font-normal text-gray-400 dark:text-gray-500 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 px-2 py-0.5 rounded-full ml-2">
                      {totalItems.length}
                    </span>
                  </h2>

                  {items.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                      {items.map((item) => (
                        <div
                          key={item.id}
                          className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border border-gray-105 dark:border-gray-800 hover:shadow-md transition duration-300 relative group item-card"
                        >
                          <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition duration-200 z-10">
                            <button
                              onClick={() => handleOpenEdit(item)}
                              className="w-7 h-7 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/50 hover:text-blue-600 dark:hover:text-blue-400 flex items-center justify-center transition-colors"
                            >
                              <i className="fa-solid fa-pen text-[10px]"></i>
                            </button>
                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              className="w-7 h-7 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/50 hover:text-red-600 dark:hover:text-red-400 flex items-center justify-center transition-colors"
                            >
                              <i className="fa-solid fa-trash text-[10px]"></i>
                            </button>
                          </div>

                          <div className="h-32 w-full rounded-lg bg-gray-50 dark:bg-gray-850 mb-3 overflow-hidden flex items-center justify-center">
                            {item.image_url ? (
                              <img
                                src={item.image_url}
                                className="w-full h-full object-cover"
                                alt={item.name}
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src =
                                    "https://via.placeholder.com/150?text=No+Image";
                                }}
                              />
                            ) : (
                              <i className="fa-solid fa-box text-3xl text-gray-300 dark:text-gray-700"></i>
                            )}
                          </div>

                          <div>
                            <h4 className="font-bold text-gray-800 dark:text-white text-sm mb-1 truncate">
                              {item.name}
                            </h4>
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded">
                                {item.unit || "Unit"}
                              </span>
                              <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                                ID: {item.id}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-lg p-6 text-center bg-white dark:bg-gray-900">
                      <p className="text-gray-400 dark:text-gray-500 text-sm">
                        No items found for {catName}.
                      </p>
                    </div>
                  )}
                </div>
              );
            })
          )}
          {visibleLimit < filteredStocks.length && (
            <div ref={observerTarget} className="h-20 flex items-center justify-center mt-6">
              <i className="fa-solid fa-spinner fa-spin text-3xl text-orange-500 animate-pulse"></i>
            </div>
          )}
        </div>
      </div>

      {/* Add Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md border dark:border-gray-800 transition-colors animate-scale-in">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-950 rounded-t-2xl">
              <h3 className="text-lg font-bold text-gray-855 dark:text-white">Add Master Item</h3>
              <button
                onClick={() => setAddModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">
                  Item Name
                </label>
                <input
                  type="text"
                  required
                  value={addName}
                  onChange={(e) => setAddName(e.target.value)}
                  placeholder="e.g. Olive Oil"
                  className="w-full bg-gray-50 dark:bg-gray-850 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg p-2.5 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">
                    Category
                  </label>
                  <select
                    value={addCategory}
                    onChange={(e) => setAddCategory(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-gray-850 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg p-2.5 focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="Cook">Cook</option>
                    <option value="Drink">Drink</option>
                    <option value="Supplies">Supplies</option>
                    <option value="Packaging">Packaging</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Unit</label>
                  <select
                    value={addUnit}
                    onChange={(e) => setAddUnit(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-gray-850 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg p-2.5 focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="kg">kg</option>
                    <option value="g">g</option>
                    <option value="liter">Liter</option>
                    <option value="pcs">Pcs</option>
                    <option value="box">Box</option>
                    <option value="can">Can</option>
                    <option value="pack">Pack</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">
                  Image (Optional)
                </label>
                <input
                  type="file"
                  onChange={(e) => setAddImageFile(e.target.files?.[0] || null)}
                  className="w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 dark:file:bg-indigo-950/50 file:text-indigo-700 dark:file:text-indigo-400 hover:file:bg-indigo-100 dark:hover:file:bg-indigo-950/70"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-indigo-650 text-white rounded-xl font-bold hover:bg-indigo-750 transition shadow-sm"
              >
                Save Item
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md border dark:border-gray-800 transition-colors animate-scale-in">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-950 rounded-t-2xl">
              <h3 className="text-lg font-bold text-gray-855 dark:text-white">Edit Item</h3>
              <button
                onClick={() => setEditModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">
                  Item Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-850 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg p-2.5 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">
                    Category
                  </label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-gray-850 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg p-2.5 focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="Cook">Cook</option>
                    <option value="Drink">Drink</option>
                    <option value="Supplies">Supplies</option>
                    <option value="Packaging">Packaging</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Unit</label>
                  <select
                    value={editUnit}
                    onChange={(e) => setEditUnit(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-gray-850 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg p-2.5 focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="kg">kg</option>
                    <option value="g">g</option>
                    <option value="liter">Liter</option>
                    <option value="pcs">Pcs</option>
                    <option value="box">Box</option>
                    <option value="can">Can</option>
                    <option value="pack">Pack</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">
                  Image URL
                </label>
                <input
                  type="text"
                  value={editImageUrl}
                  onChange={(e) => setEditImageUrl(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-850 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg p-2.5 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <button
                onClick={handleEditSubmit}
                className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold transition shadow-sm"
              >
                Update Item
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
