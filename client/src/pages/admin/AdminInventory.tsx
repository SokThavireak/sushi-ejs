import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";

interface Product {
  id: number;
  name: string;
  category: string;
  price: string | number;
  image_url: string | null;
  is_best_seller: boolean;
  discount_type: string;
  discount_value: string | number;
}

interface Category {
  id?: number;
  name: string;
}

const API_BASE = import.meta.env.VITE_API_URL || "";

export default function AdminInventory() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeCategory, setActiveCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Modals state
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  // Add Product form states
  const [addName, setAddName] = useState("");
  const [addCategory, setAddCategory] = useState("");
  const [addPrice, setAddPrice] = useState("");
  const [addDiscountType, setAddDiscountType] = useState("none");
  const [addDiscountValue, setAddDiscountValue] = useState("0");
  const [addIsBestSeller, setAddIsBestSeller] = useState("false");
  const [addImageFile, setAddImageFile] = useState<File | null>(null);

  // Edit Product form states
  const [editId, setEditId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editDiscountType, setEditDiscountType] = useState("none");
  const [editDiscountValue, setEditDiscountValue] = useState("0");
  const [editImageUrl, setEditImageUrl] = useState("");
  const [editIsBestSeller, setEditIsBestSeller] = useState("false");

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/api/admin/inventory`, { withCredentials: true });
      setProducts(res.data.products || []);

      const cats: Category[] = res.data.categories || [];
      // Re-order and ensure "On Sale" and "Most Sales" are at the front
      const cleanCats = cats.filter((c) => c.name !== "On Sale" && c.name !== "Most Sales");
      const orderedCats = [{ name: "On Sale" }, { name: "Most Sales" }, ...cleanCats];
      setCategories(orderedCats);

      // Default category selection for the add form
      const formCats = orderedCats.filter((c) => c.name !== "On Sale" && c.name !== "Most Sales");
      if (formCats.length > 0) {
        setAddCategory(formCats[0].name);
      }
    } catch (err: any) {
      console.error(err);
      showNotification(err.response?.data?.error || "Error loading inventory", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
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
    formData.append("price", addPrice);
    formData.append("discount_type", addDiscountType);
    formData.append("discount_value", addDiscountValue);
    formData.append("is_best_seller", addIsBestSeller);
    if (addImageFile) {
      formData.append("image", addImageFile);
    }

    try {
      await axios.post(`${API_BASE}/admin/inventory/add`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });
      showNotification("Product Added Successfully!", "success");
      setAddModalOpen(false);
      // Reset form fields
      setAddName("");
      setAddPrice("");
      setAddDiscountType("none");
      setAddDiscountValue("0");
      setAddIsBestSeller("false");
      setAddImageFile(null);
      fetchInventory();
    } catch (err: any) {
      console.error(err);
      showNotification(err.response?.data?.error || "Error adding product", "error");
    }
  };

  const handleOpenEdit = (p: Product) => {
    setEditId(p.id);
    setEditName(p.name);
    setEditCategory(p.category);
    setEditPrice(String(p.price));
    setEditDiscountType(p.discount_type || "none");
    setEditDiscountValue(String(p.discount_value || 0));
    setEditImageUrl(p.image_url || "");
    setEditIsBestSeller(String(p.is_best_seller));
    setEditModalOpen(true);
  };

  const handleEditSubmit = async () => {
    const isDark = document.documentElement.classList.contains("dark");
    const result = await Swal.fire({
      title: "Update Product?",
      text: "Save changes to this product?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#10b981",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, update product",
      background: isDark ? "#111827" : "#fff",
      color: isDark ? "#fff" : "#000",
      customClass: { popup: "rounded-2xl shadow-xl font-sans" },
    });

    if (!result.isConfirmed) return;

    try {
      await axios.patch(
        `${API_BASE}/api/inventory/${editId}`,
        {
          name: editName,
          category: editCategory,
          price: editPrice,
          discount_type: editDiscountType,
          discount_value: editDiscountValue,
          image_url: editImageUrl,
          is_best_seller: editIsBestSeller,
        },
        { withCredentials: true }
      );
      showNotification("Product Updated!", "success");
      setEditModalOpen(false);
      fetchInventory();
    } catch (err: any) {
      console.error(err);
      showNotification(err.response?.data?.error || "Error updating product", "error");
    }
  };

  const handleDeleteProduct = async (itemId: number) => {
    const isDark = document.documentElement.classList.contains("dark");
    const result = await Swal.fire({
      title: "Delete Product?",
      text: "This action will permanently delete the product. Are you sure?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete product",
      background: isDark ? "#111827" : "#fff",
      color: isDark ? "#fff" : "#000",
      customClass: { popup: "rounded-2xl shadow-xl font-sans" },
    });

    if (!result.isConfirmed) return;

    try {
      await axios.delete(`${API_BASE}/api/inventory/${itemId}`, { withCredentials: true });
      showNotification("Product Deleted", "success");
      fetchInventory();
    } catch (err: any) {
      console.error(err);
      showNotification(err.response?.data?.error || "Error deleting product", "error");
    }
  };

  const getFilteredProductsByCategory = (catName: string) => {
    let filtered = products;

    // First filter by search term if active
    if (searchTerm) {
      filtered = filtered.filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }

    if (catName === "On Sale") {
      return filtered.filter((p) => p.discount_type && p.discount_type !== "none" && Number(p.discount_value) > 0);
    } else if (catName === "Most Sales") {
      return filtered.filter((p) => p.is_best_seller === true);
    } else {
      return filtered.filter((p) => p.category === catName);
    }
  };

  // Only display categories that are active or show all categories if "all" is selected
  const activeCategoriesToDisplay = categories.filter((cat) => {
    if (activeCategory === "all") return true;
    return cat.name === activeCategory;
  });

  return (
    <div className="space-y-6">
      {/* Toast Notifications */}
      <div id="toast-container" className="fixed top-24 right-4 z-[9999] flex flex-col gap-3 pointer-events-none"></div>

      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden transition-colors">
        <div className="p-6 flex justify-between items-center border-b border-gray-100 dark:border-gray-800">
          <h3 className="font-bold text-gray-805 dark:text-white text-lg">Product Inventory</h3>
          <button
            onClick={() => setAddModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 shadow-sm"
          >
            <i className="fa-solid fa-plus"></i> Add New Product
          </button>
        </div>

        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-955 border-b border-gray-100 dark:border-gray-800">
          <div className="relative">
            <input
              type="text"
              placeholder="Type to search product name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors shadow-sm"
            />
            <div className="absolute left-3 top-3 text-gray-400">
              <i className="fa-solid fa-magnifying-glass"></i>
            </div>
          </div>

          <div className="pt-4 flex flex-wrap gap-2">
            <button
              onClick={() => setActiveCategory("all")}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                activeCategory === "all"
                  ? "bg-blue-600 text-white shadow-sm font-bold"
                  : "bg-white dark:bg-gray-900 text-gray-650 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.name}
                onClick={() => setActiveCategory(cat.name)}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                  activeCategory === cat.name
                    ? "bg-blue-600 text-white shadow-sm font-bold"
                    : "bg-white dark:bg-gray-900 text-gray-655 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Categories grid listings */}
        <div className="p-6 bg-gray-50 dark:bg-gray-950 min-h-[400px] transition-colors space-y-12">
          {loading ? (
            <div className="text-center py-8 text-gray-500">
              <i className="fa-solid fa-spinner fa-spin mr-2"></i> Loading product inventory...
            </div>
          ) : (
            activeCategoriesToDisplay.map((category) => {
              const catProducts = getFilteredProductsByCategory(category.name);

              return (
                <div key={category.name} className="inventory-section">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                    <span>{category.name}</span>
                    <span className="text-sm font-normal text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 px-2.5 py-0.5 rounded-full">
                      {catProducts.length} items
                    </span>
                  </h2>

                  {catProducts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                      {catProducts.map((product) => (
                        <div
                          key={product.id}
                          className="bg-white dark:bg-gray-900 rounded-[2rem] p-4 shadow-sm hover:shadow-md transition duration-300 relative group product-card border border-transparent dark:border-gray-800"
                        >
                          <div className="absolute bottom-4 right-4 flex gap-2 z-10 opacity-0 group-hover:opacity-100 transition duration-200">
                            <button
                              onClick={() => handleOpenEdit(product)}
                              className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-blue-100 dark:hover:bg-blue-900/50 hover:text-blue-600 dark:hover:text-blue-400 transition text-gray-600 dark:text-gray-300 shadow-sm"
                            >
                              <i className="fa-solid fa-pen"></i>
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product.id)}
                              className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-950/30 flex items-center justify-center hover:bg-red-100 dark:hover:bg-red-900/50 hover:text-red-650 transition text-red-500 shadow-sm"
                            >
                              <i className="fa-solid fa-trash"></i>
                            </button>
                          </div>

                          <div className="relative h-48 w-full rounded-2xl overflow-hidden mb-4 bg-gray-100 dark:bg-gray-850">
                            <img
                              src={product.image_url || "https://via.placeholder.com/150?text=No+Img"}
                              className="w-full h-full object-cover"
                              alt={product.name}
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "https://via.placeholder.com/150?text=No+Img";
                              }}
                            />
                          </div>
                          <h3 className="font-bold text-gray-900 dark:text-white product-name">{product.name}</h3>
                          <p className="text-gray-500 dark:text-gray-400 text-sm">${product.price}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400 dark:text-gray-500 italic pl-2">No items.</p>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Add Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg border dark:border-gray-800 transition-colors animate-scale-in">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-950 rounded-t-2xl">
              <h3 className="text-lg font-bold text-gray-855 dark:text-white">Add New Product</h3>
              <button
                onClick={() => setAddModalOpen(false)}
                className="text-gray-400 hover:text-gray-655 dark:hover:text-gray-200"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={addName}
                  onChange={(e) => setAddName(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-850 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg p-2.5 focus:border-blue-500 focus:outline-none"
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
                    className="w-full bg-gray-50 dark:bg-gray-850 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg p-2.5 focus:outline-none"
                  >
                    {categories
                      .filter((c) => c.name !== "On Sale" && c.name !== "Most Sales")
                      .map((cat) => (
                        <option key={cat.name} value={cat.name}>
                          {cat.name}
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">
                    Price
                  </label>
                  <input
                    type="number"
                    required
                    value={addPrice}
                    onChange={(e) => setAddPrice(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-gray-850 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg p-2.5 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">
                    Discount Type
                  </label>
                  <select
                    value={addDiscountType}
                    onChange={(e) => setAddDiscountType(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-gray-855 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg p-2.5 focus:outline-none"
                  >
                    <option value="none">No Discount</option>
                    <option value="percentage">Percentage (%)</option>
                    <option value="subtract">Subtract Amount ($)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">
                    Discount Value
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={addDiscountValue}
                    onChange={(e) => setAddDiscountValue(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-gray-855 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg p-2.5 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">
                    Image File
                  </label>
                  <input
                    type="file"
                    onChange={(e) => setAddImageFile(e.target.files?.[0] || null)}
                    className="w-full text-sm dark:text-gray-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">
                    Is Best Seller?
                  </label>
                  <select
                    value={addIsBestSeller}
                    onChange={(e) => setAddIsBestSeller(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-gray-850 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg p-2.5 focus:outline-none"
                  >
                    <option value="false">No (Normal Product)</option>
                    <option value="true">Yes (Add to Most Sales)</option>
                  </select>
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold mt-2 shadow-sm transition-colors"
              >
                Save Product
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg border dark:border-gray-800 transition-colors animate-scale-in">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-950 rounded-t-2xl">
              <h3 className="text-lg font-bold text-gray-855 dark:text-white">Edit Product</h3>
              <button
                onClick={() => setEditModalOpen(false)}
                className="text-gray-400 hover:text-gray-655 dark:hover:text-gray-200"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-850 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg p-2.5 focus:border-blue-500 focus:outline-none"
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
                    className="w-full bg-gray-50 dark:bg-gray-850 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg p-2.5 focus:outline-none"
                  >
                    {categories
                      .filter((c) => c.name !== "On Sale" && c.name !== "Most Sales")
                      .map((cat) => (
                        <option key={cat.name} value={cat.name}>
                          {cat.name}
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">
                    Price
                  </label>
                  <input
                    type="number"
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-gray-855 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg p-2.5 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">
                    Discount Type
                  </label>
                  <select
                    value={editDiscountType}
                    onChange={(e) => setEditDiscountType(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-gray-855 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg p-2.5 focus:outline-none"
                  >
                    <option value="none">No Discount</option>
                    <option value="percentage">Percentage (%)</option>
                    <option value="subtract">Subtract Amount ($)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">
                    Discount Value
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={editDiscountValue}
                    onChange={(e) => setEditDiscountValue(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-gray-855 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg p-2.5 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">
                    Image URL
                  </label>
                  <input
                    type="text"
                    value={editImageUrl}
                    onChange={(e) => setEditImageUrl(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-gray-855 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg p-2.5 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">
                    Is Best Seller?
                  </label>
                  <select
                    value={editIsBestSeller}
                    onChange={(e) => setEditIsBestSeller(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-gray-850 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg p-2.5 focus:outline-none"
                  >
                    <option value="false">No</option>
                    <option value="true">Yes</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleEditSubmit}
                className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold mt-2 shadow-sm transition-colors"
              >
                Update Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
