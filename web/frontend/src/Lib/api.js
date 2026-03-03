// FILE: src/Lib/api.js
import axios from "axios";

/* ============================================================
   🔧 1. Axios Instance
   ============================================================ */

const api = axios.create({
  baseURL: import.meta.env.DEV
    ? "http://localhost:5001/api"
    : import.meta.env.VITE_API_BASE_URL ||
      "https://curevirtual-2-production-ee33.up.railway.app/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 60000, // 60s to handle cold starts
});

/* ============================================================
   🔒 2. Attach JWT Token Automatically
   ============================================================ */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/* ============================================================
   🔄 3. Handle Token Expiry or Network Errors Gracefully
   ============================================================ */
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (!error.response) {
      console.error("🌐 Network error — check backend connection");
      alert("Network error. Please check your connection.");
      return Promise.reject(error);
    }

    // Handle expired tokens globally
    if (error.response.status === 401) {
      console.warn("🔒 Token expired — preserving auth data");
      // Do not clear localStorage or redirect; allow app to handle it gracefully
    }

    return Promise.reject(error);
  }
);

/* ============================================================
   🧩 4. Utility API Functions
   ============================================================ */

// 🔔 Notifications
export const getNotifications = async (userId) => {
  const res = await api.get(`/notifications/count/${userId}`);
  return res.data.notifications;
};

// 📊 Superadmin Stats
export const getSuperadminStats = async () => {
  const res = await api.get("/superadmin/stats");
  return res.data;
};

// 👥 Admin Management
export const fetchAdmins = async (role) => {
  const res = await api.get(`/admins${role ? `?role=${role}` : ""}`);
  return res.data;
};

export const getAdmin = async (id) => {
  const res = await api.get(`/admins/${id}`);
  return res.data;
};

export const createAdmin = async (data) => {
  const res = await api.post("/admins", data);
  return res.data;
};

export const updateAdmin = async (id, data) => {
  const res = await api.put(`/admins/${id}`, data);
  return res.data;
};

export const suspendAdmin = async (id) => {
  const res = await api.patch(`/admins/${id}/suspend`);
  return res.data;
};

export const deleteAdmin = async (id) => {
  const res = await api.delete(`/admins/${id}`);
  return res.data;
};

// 🧾 System Reports
export const fetchSystemReports = async () => {
  const res = await api.get("/superadmin/reports/summary");
  return res.data;
};

// ⚙️ Settings
export const fetchSettings = async () => {
  const res = await api.get("/settings");
  return res.data;
};

export const updateSettings = async (data) => {
  const res = await api.put("/settings", data);
  return res.data;
};

// 🧠 Logs & Activity
export const fetchLogs = async (role, limit = 20) => {
  const res = await api.get(`/logs?role=${role || ""}&limit=${limit}`);
  return res.data;
};

export const addLog = async (data) => {
  await api.post("/logs", data);
};

/* ============================================================
   🧩 5. Generic CRUD Helpers (optional reuse)
   ============================================================ */
export const getAll = async (endpoint, params = {}) => {
  const res = await api.get(endpoint, { params });
  return res.data;
};

export const getOne = async (endpoint, id) => {
  const res = await api.get(`${endpoint}/${id}`);
  return res.data;
};

export const create = async (endpoint, data) => {
  const res = await api.post(endpoint, data);
  return res.data;
};

export const update = async (endpoint, id, data) => {
  const res = await api.put(`${endpoint}/${id}`, data);
  return res.data;
};

export const remove = async (endpoint, id) => {
  const res = await api.delete(`${endpoint}/${id}`);
  return res.data;
};

/* ============================================================
   🧭 6. Export Default Instance
   ============================================================ */
export default api;
