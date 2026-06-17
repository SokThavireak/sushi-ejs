import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useHeader } from "../../context/HeaderContext";

interface Location {
  id: number;
  name: string;
  address: string;
  google_map_url: string;
  hours_mon_fri: string;
  hours_sat_sun: string;
  status: string;
}

const API_BASE = import.meta.env.VITE_API_URL || "";

export default function AdminLocations() {
  const { setHeaderContent } = useHeader();
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  useEffect(() => {
    setHeaderContent(
      <button
        onClick={() => setAddModalOpen(true)}
        className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow transition shrink-0"
      >
        + Add Location
      </button>
    );
    return () => setHeaderContent(null);
  }, [setHeaderContent]);

  // Add Location form states
  const [addName, setAddName] = useState("");
  const [addAddress, setAddAddress] = useState("");
  const [addGoogleMapUrl, setAddGoogleMapUrl] = useState("");
  const [addHoursMonFri, setAddHoursMonFri] = useState("");
  const [addHoursSatSun, setAddHoursSatSun] = useState("");
  const [addStatus, setAddStatus] = useState("Open");

  // Edit Location form states
  const [editId, setEditId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editGoogleMapUrl, setEditGoogleMapUrl] = useState("");
  const [editHoursMonFri, setEditHoursMonFri] = useState("");
  const [editHoursSatSun, setEditHoursSatSun] = useState("");
  const [editStatus, setEditStatus] = useState("Open");

  const fetchLocations = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/api/admin/locations`, { withCredentials: true });
      setLocations(res.data.locations || []);
    } catch (err: any) {
      console.error(err);
      showNotification(err.response?.data?.error || "Error loading locations", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
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
    try {
      await axios.post(
        `${API_BASE}/api/locations`,
        {
          name: addName,
          address: addAddress,
          google_map_url: addGoogleMapUrl,
          hours_mon_fri: addHoursMonFri,
          hours_sat_sun: addHoursSatSun,
          status: addStatus,
        },
        { withCredentials: true }
      );
      showNotification("Location Added Successfully!", "success");
      setAddModalOpen(false);
      // Reset form fields
      setAddName("");
      setAddAddress("");
      setAddGoogleMapUrl("");
      setAddHoursMonFri("");
      setAddHoursSatSun("");
      setAddStatus("Open");
      fetchLocations();
    } catch (err: any) {
      console.error(err);
      showNotification(err.response?.data?.error || "Error adding location", "error");
    }
  };

  const handleOpenEdit = (loc: Location) => {
    setEditId(loc.id);
    setEditName(loc.name);
    setEditAddress(loc.address);
    setEditGoogleMapUrl(loc.google_map_url || "");
    setEditHoursMonFri(loc.hours_mon_fri || "");
    setEditHoursSatSun(loc.hours_sat_sun || "");
    setEditStatus(loc.status);
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isDark = document.documentElement.classList.contains("dark");
    const result = await Swal.fire({
      title: "Update Location?",
      text: "Save changes to this location?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#10b981",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, update it",
      background: isDark ? "#111827" : "#fff",
      color: isDark ? "#fff" : "#000",
      customClass: { popup: "rounded-2xl shadow-xl font-sans" },
    });

    if (!result.isConfirmed) return;

    try {
      await axios.patch(
        `${API_BASE}/api/locations/${editId}`,
        {
          name: editName,
          address: editAddress,
          google_map_url: editGoogleMapUrl,
          hours_mon_fri: editHoursMonFri,
          hours_sat_sun: editHoursSatSun,
          status: editStatus,
        },
        { withCredentials: true }
      );
      showNotification("Location Updated!", "success");
      setEditModalOpen(false);
      fetchLocations();
    } catch (err: any) {
      console.error(err);
      showNotification(err.response?.data?.error || "Error updating location", "error");
    }
  };

  const handleDeleteLocation = async (id: number) => {
    const isDark = document.documentElement.classList.contains("dark");
    const result = await Swal.fire({
      title: "Delete Location?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it",
      background: isDark ? "#111827" : "#fff",
      color: isDark ? "#fff" : "#000",
      customClass: { popup: "rounded-2xl shadow-xl font-sans" },
    });

    if (!result.isConfirmed) return;

    try {
      await axios.delete(`${API_BASE}/api/locations/${id}`, { withCredentials: true });
      showNotification("Location Deleted", "success");
      fetchLocations();
    } catch (err: any) {
      console.error(err);
      showNotification(err.response?.data?.error || "Error deleting location", "error");
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notifications */}
      <div id="toast-container" className="fixed top-24 right-4 z-[9999] flex flex-col gap-3 pointer-events-none"></div>

      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden transition-colors">
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-gray-500 dark:text-gray-400 text-sm border-b border-gray-100 dark:border-gray-800">
                  <th className="p-3">Name</th>
                  <th className="p-3">Address</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-gray-700 dark:text-gray-300">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-gray-500">
                      <i className="fa-solid fa-spinner fa-spin mr-2"></i> Loading locations...
                    </td>
                  </tr>
                ) : locations.length > 0 ? (
                  locations.map((loc) => (
                    <tr
                      key={loc.id}
                      className="border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 group transition-colors"
                    >
                      <td className="p-3 font-bold text-gray-800 dark:text-white">{loc.name}</td>
                      <td className="p-3 text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">{loc.address}</td>
                      <td className="p-3">
                        {loc.status === "Open" ? (
                          <span className="bg-green-100 dark:bg-green-905/30 text-green-700 dark:text-green-400 px-2 py-1 rounded text-xs font-bold">
                            Open
                          </span>
                        ) : (
                          <span className="bg-red-100 dark:bg-red-955/30 text-red-700 dark:text-red-405 px-2 py-1 rounded text-xs font-bold">
                            Closed
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-right space-x-2">
                        <button
                          onClick={() => handleOpenEdit(loc)}
                          className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-bold"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteLocation(loc.id)}
                          className="text-red-500 hover:text-red-700 dark:text-red-450 dark:hover:text-red-300 text-sm font-bold"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-gray-400">
                      No locations found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 bg-black/50 hidden flex items-center justify-center z-50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-lg p-6 shadow-2xl border dark:border-gray-800 transition-colors animate-scale-in">
            <h3 className="text-xl font-bold mb-4 text-gray-808 dark:text-white">Add New Location</h3>
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Location Name"
                required
                value={addName}
                onChange={(e) => setAddName(e.target.value)}
                className="w-full border dark:border-gray-700 p-2.5 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />

              <input
                type="text"
                placeholder="Full Address"
                required
                value={addAddress}
                onChange={(e) => setAddAddress(e.target.value)}
                className="w-full border dark:border-gray-700 p-2.5 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />

              <input
                type="text"
                placeholder="Google Maps Link"
                value={addGoogleMapUrl}
                onChange={(e) => setAddGoogleMapUrl(e.target.value)}
                className="w-full border dark:border-gray-700 p-2.5 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />

              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Mon-Fri Hours"
                  value={addHoursMonFri}
                  onChange={(e) => setAddHoursMonFri(e.target.value)}
                  className="w-full border dark:border-gray-700 p-2.5 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                />
                <input
                  type="text"
                  placeholder="Sat-Sun Hours"
                  value={addHoursSatSun}
                  onChange={(e) => setAddHoursSatSun(e.target.value)}
                  className="w-full border dark:border-gray-700 p-2.5 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <select
                value={addStatus}
                onChange={(e) => setAddStatus(e.target.value)}
                className="w-full border dark:border-gray-700 p-2.5 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
              >
                <option value="Open">Open</option>
                <option value="Closed">Closed</option>
              </select>

              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-4 py-2 text-gray-500 dark:text-gray-400 hover:text-gray-750 dark:hover:text-gray-200"
                >
                  Cancel
                </button>
                <button type="submit" className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-sm">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 bg-black/50 hidden flex items-center justify-center z-50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-lg p-6 shadow-2xl border dark:border-gray-800 transition-colors animate-scale-in">
            <h3 className="text-xl font-bold mb-4 text-gray-808 dark:text-white">Edit Location</h3>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full border dark:border-gray-700 p-2.5 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
              <input
                type="text"
                value={editAddress}
                onChange={(e) => setEditAddress(e.target.value)}
                className="w-full border dark:border-gray-700 p-2.5 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
              <input
                type="text"
                value={editGoogleMapUrl}
                onChange={(e) => setEditGoogleMapUrl(e.target.value)}
                className="w-full border dark:border-gray-700 p-2.5 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  value={editHoursMonFri}
                  onChange={(e) => setEditHoursMonFri(e.target.value)}
                  className="w-full border dark:border-gray-700 p-2.5 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
                <input
                  type="text"
                  value={editHoursSatSun}
                  onChange={(e) => setEditHoursSatSun(e.target.value)}
                  className="w-full border dark:border-gray-700 p-2.5 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value)}
                className="w-full border dark:border-gray-700 p-2.5 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
              >
                <option value="Open">Open</option>
                <option value="Closed">Closed</option>
              </select>
              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 text-gray-500 dark:text-gray-400 hover:text-gray-750 dark:hover:text-gray-200"
                >
                  Cancel
                </button>
                <button type="submit" className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold shadow-sm">
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
