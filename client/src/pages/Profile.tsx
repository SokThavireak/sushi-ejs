import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export const Profile: React.FC = () => {
  const { user, logout, checkAuth } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState<string>(user?.email || "");
  const [password, setPassword] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<boolean>(false);
  const [statusMsg, setStatusMsg] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");

  const API_BASE = import.meta.env.VITE_API_URL || "";

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setStatusMsg("");
    setErrorMsg("");

    try {
      await axios.put(`${API_BASE}/profile/update`, { email, password });
      await checkAuth();
      setStatusMsg("Profile updated successfully!");
      setPassword("");
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.error || "Failed to update profile.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm(
      "Are you absolutely sure you want to delete your account? This action cannot be undone."
    );
    if (!confirmDelete) return;

    setDeleting(true);
    try {
      await axios.delete(`${API_BASE}/profile/delete`);
      await logout();
      alert("Your account has been deleted.");
      navigate("/");
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.error || "Account deletion failed");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-6 mt-36 mb-20 font-sans min-h-[50vh]">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700">
        <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Account Settings</h1>

        {statusMsg && (
          <div className="bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400 p-4 rounded-xl mb-6 font-bold text-sm">
            {statusMsg}
          </div>
        )}

        {errorMsg && (
          <div className="bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-400 p-4 rounded-xl mb-6 font-bold text-sm">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleUpdate} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-gray-100 dark:bg-gray-750 px-4 py-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 text-gray-900 dark:text-white border-0"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
              New Password (leave blank to keep current)
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-gray-100 dark:bg-gray-750 px-4 py-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 text-gray-900 dark:text-white border-0"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-orange-500 disabled:opacity-50 text-white font-bold py-3.5 rounded-full hover:bg-orange-600 transition shadow-md"
          >
            {submitting ? "Updating..." : "Save Changes"}
          </button>
        </form>

        <div className="border-t border-gray-100 dark:border-gray-700 my-8 pt-8">
          <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-2">Danger Zone</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
            Once you delete your account, there is no going back. Please be certain.
          </p>
          <button
            onClick={handleDeleteAccount}
            disabled={deleting}
            className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3 rounded-xl transition duration-300 shadow-md focus:outline-none"
          >
            {deleting ? "Deleting..." : "Delete Account"}
          </button>
        </div>
      </div>
    </div>
  );
};
