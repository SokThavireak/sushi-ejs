import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

export const Payment: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [amount, setAmount] = useState<string>("0.00");
  const [loading, setLoading] = useState<boolean>(true);
  const [paying, setPaying] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const API_BASE = import.meta.env.VITE_API_URL || "";

  useEffect(() => {
    const fetchPaymentInfo = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/payment/${id}`);
        setAmount(res.data.amount || "0.00");
      } catch (err) {
        console.error("Error fetching payment details:", err);
        setError("Order not found or access denied.");
      } finally {
        setLoading(false);
      }
    };
    fetchPaymentInfo();
  }, [id]);

  const handleConfirmPayment = async () => {
    setPaying(true);
    try {
      const res = await axios.post(`${API_BASE}/payment/confirm/${id}`);
      if (res.data.success) {
        alert("Payment Successful! Your order has been paid successfully.");
        const isStaff = user && ["manager", "admin", "store_manager", "staff", "cashier"].includes(user.role.trim().toLowerCase());
        navigate(isStaff ? "/admin/orders" : "/orders");
      } else {
        alert(res.data.error || "Payment failed");
      }
    } catch (err: any) {
      console.error("Payment confirmation failed:", err);
      alert(err.response?.data?.error || "Connection error during payment");
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 lg:pt-24 font-sans">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 p-6 lg:p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 text-center">
        <div className="mb-6 animate-bounce">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto shadow-sm">
            <i className="fa-solid fa-check text-3xl"></i>
          </div>
        </div>

        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Confirm Payment
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">
          Order ID: <span className="font-mono font-bold text-gray-700 dark:text-gray-300">#{id}</span>
        </p>

        {loading ? (
          <div className="text-gray-500 py-4">Loading order details...</div>
        ) : error ? (
          <div className="text-red-500 py-4 font-bold">{error}</div>
        ) : (
          <>
            <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-2xl mb-8 border border-gray-100 dark:border-gray-700">
              <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
                Total Amount
              </p>
              <p className="text-4xl font-extrabold text-indigo-600 dark:text-indigo-400 tracking-tight">
                {amount} $
              </p>
            </div>

            <button
              onClick={handleConfirmPayment}
              disabled={paying}
              className="group w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-indigo-200 transition-all transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3 focus:outline-none"
            >
              <i className="fa-solid fa-credit-card group-hover:rotate-12 transition-transform"></i>
              <span>{paying ? "Processing Payment..." : "Confirm & Pay Now (Demo Mode)"}</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
};
