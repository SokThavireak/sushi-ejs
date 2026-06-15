import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  product_name: string | null;
  price: string | number;
  quantity: number;
}

interface Order {
  id: number;
  created_at: string;
  table_number: string | null;
  pickup_location: string;
  payment_method: string;
  status: string;
  total_price: string | number;
}

interface Location {
  id: number;
  name: string;
}

const API_BASE = import.meta.env.VITE_API_URL || "";

export default function AdminEditOrder() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [status, setStatus] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [pickupLocation, setPickupLocation] = useState("");
  const [tableNumber, setTableNumber] = useState("");

  // Edit item quantities map
  const [itemQuantities, setItemQuantities] = useState<Record<number, number>>({});

  const fetchOrderDetails = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/admin/orders/edit/${id}`, { withCredentials: true });
      const o = res.data.order;
      setOrder(o);
      setItems(res.data.items || []);
      setLocations(res.data.locations || []);

      // Init form states
      setStatus(o.status || "");
      setPaymentMethod(o.payment_method || "Cash");
      setPickupLocation(o.pickup_location || "");
      setTableNumber(o.table_number || "");

      // Init inline quantity edits
      const qtyMap: Record<number, number> = {};
      (res.data.items || []).forEach((item: OrderItem) => {
        qtyMap[item.id] = item.quantity;
      });
      setItemQuantities(qtyMap);
    } catch (err: any) {
      console.error(err);
      Swal.fire("Error", err.response?.data?.error || "Failed to load order details", "error");
      navigate("/admin/orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchOrderDetails();
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

  const handleUpdateOrderDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    const isDark = document.documentElement.classList.contains("dark");

    const result = await Swal.fire({
      title: "Update Order?",
      text: "Save changes to this order?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#10b981",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, update order",
      background: isDark ? "#111827" : "#fff",
      color: isDark ? "#fff" : "#000",
      customClass: { popup: "rounded-2xl shadow-xl font-sans" },
    });

    if (result.isConfirmed) {
      try {
        await axios.put(
          `${API_BASE}/api/admin/orders/update/${id}`,
          { status, payment_method: paymentMethod, pickup_location: pickupLocation, table_number: tableNumber },
          { withCredentials: true }
        );
        showNotification("Order Details Updated!", "success");
        fetchOrderDetails();
      } catch (err: any) {
        console.error(err);
        showNotification(err.response?.data?.error || "Error updating order details", "error");
      }
    }
  };

  const handleItemQuantityChange = (itemId: number, newQty: number) => {
    setItemQuantities((prev) => ({
      ...prev,
      [itemId]: newQty,
    }));
  };

  const handleUpdateItemQuantity = async (itemId: number) => {
    const qty = itemQuantities[itemId];
    if (qty < 1) {
      handleRemoveItem(itemId);
      return;
    }

    try {
      await axios.patch(
        `${API_BASE}/api/admin/orders/items/update/${itemId}`,
        { quantity: qty },
        { withCredentials: true }
      );
      showNotification("Item quantity updated", "success");
      fetchOrderDetails();
    } catch (err: any) {
      console.error(err);
      showNotification(err.response?.data?.error || "Failed to update quantity", "error");
    }
  };

  const handleRemoveItem = async (itemId: number) => {
    const isDark = document.documentElement.classList.contains("dark");
    const result = await Swal.fire({
      title: "Remove item?",
      text: "Are you sure you want to remove this item from the order?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, remove it",
      background: isDark ? "#111827" : "#fff",
      color: isDark ? "#fff" : "#000",
      customClass: { popup: "rounded-2xl shadow-xl font-sans" },
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`${API_BASE}/api/admin/orders/items/delete/${itemId}`, { withCredentials: true });
        showNotification("Item removed successfully", "success");
        fetchOrderDetails();
      } catch (err: any) {
        console.error(err);
        showNotification(err.response?.data?.error || "Failed to remove item", "error");
      }
    }
  };

  const handleDeleteEntireOrder = async () => {
    const isDark = document.documentElement.classList.contains("dark");
    const result = await Swal.fire({
      title: "Delete Order?",
      text: "This action will permanently delete the order. Are you sure?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete order",
      background: isDark ? "#111827" : "#fff",
      color: isDark ? "#fff" : "#000",
      customClass: { popup: "rounded-2xl shadow-xl font-sans" },
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`${API_BASE}/api/admin/orders/delete/${id}`, { withCredentials: true });
        Swal.fire({
          title: "Deleted!",
          text: "Order deleted successfully.",
          icon: "success",
          confirmButtonColor: "#10b981",
          background: isDark ? "#111827" : "#fff",
          color: isDark ? "#fff" : "#000",
        }).then(() => {
          navigate("/admin/orders");
        });
      } catch (err: any) {
        console.error(err);
        showNotification(err.response?.data?.error || "Failed to delete order", "error");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500 dark:text-gray-400 flex items-center gap-2">
          <i className="fa-solid fa-spinner fa-spin text-2xl"></i> Loading order details...
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center p-8 text-red-500">
        <p>Order not found</p>
        <Link to="/admin/orders" className="text-indigo-600 hover:underline">
          Back to Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-white dark:bg-gray-900 p-8 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 transition-colors">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-850 dark:text-white">Edit Order #{order.id}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Created: {new Date(order.created_at).toLocaleString()}
          </p>
        </div>
        <Link to="/admin/orders" className="text-indigo-650 dark:text-indigo-400 hover:underline font-bold">
          Back to Orders
        </Link>
      </div>

      <form onSubmit={handleUpdateOrderDetails} className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            {["Pending", "Processing", "Completed", "Cancelled", "Refunded"].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Payment Method</label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="Cash">Cash</option>
            <option value="QR">QR / Online</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Pickup Location</label>
          <select
            value={pickupLocation}
            onChange={(e) => setPickupLocation(e.target.value)}
            className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            {locations.map((loc) => (
              <option key={loc.id} value={loc.name}>
                {loc.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Table Number</label>
          <input
            type="text"
            value={tableNumber}
            onChange={(e) => setTableNumber(e.target.value)}
            className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="md:col-span-2">
          <button
            type="submit"
            className="w-full bg-indigo-650 hover:bg-indigo-750 text-white font-bold py-3 rounded-lg transition-colors shadow-sm"
          >
            Update Order Details
          </button>
        </div>
      </form>

      <hr className="border-gray-200 dark:border-gray-800 my-8" />

      <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Order Items</h3>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-xs uppercase text-gray-500 border-b border-gray-200 dark:border-gray-800">
              <th className="py-3">Item Info</th>
              <th className="py-3">Price</th>
              <th className="py-3">Quantity</th>
              <th className="py-3">Total</th>
              <th className="py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm text-gray-700 dark:text-gray-300">
            {items.map((item) => (
              <tr key={item.id} className="border-b border-gray-100 dark:border-gray-800/50">
                <td className="py-4">
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {item.product_name || `Product ID: ${item.product_id}`}
                  </div>
                  <div className="text-xs text-gray-400">ID: {item.product_id}</div>
                </td>
                <td className="py-4">${Number(item.price).toFixed(2)}</td>
                <td className="py-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={itemQuantities[item.id] || ""}
                      onChange={(e) => handleItemQuantityChange(item.id, parseInt(e.target.value) || 0)}
                      min="1"
                      className="w-16 p-1 border border-gray-200 dark:border-gray-700 rounded text-center dark:bg-gray-800 dark:text-white focus:outline-none"
                    />
                    <button
                      onClick={() => handleUpdateItemQuantity(item.id)}
                      className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 text-xs font-bold transition-colors"
                    >
                      Update
                    </button>
                  </div>
                </td>
                <td className="py-4 font-bold text-gray-900 dark:text-white">
                  ${(Number(item.price) * (itemQuantities[item.id] || item.quantity)).toFixed(2)}
                </td>
                <td className="py-4 text-right">
                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    className="text-red-500 hover:text-red-700 font-bold transition-colors"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={3} className="text-right py-4 font-bold text-lg text-gray-900 dark:text-white">
                Total Order Value:
              </td>
              <td className="py-4 font-bold text-xl text-indigo-650 dark:text-indigo-400">
                ${Number(order.total_price).toFixed(2)}
              </td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="mt-8 text-right">
        <button
          onClick={handleDeleteEntireOrder}
          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-350 text-sm font-bold border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20 px-4 py-2 rounded-lg transition-colors"
        >
          Delete Entire Order
        </button>
      </div>
    </div>
  );
}
