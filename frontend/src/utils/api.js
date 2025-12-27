import axios from "axios";

const api = axios.create({
  baseURL: "https://professional-networking-system-1.onrender.com",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json"
  }
});

export default api;
