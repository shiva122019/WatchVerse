import axios from "axios";

const API = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API,
  withCredentials: true,
});

export function formatApiError(message) {
  return message || "internal server error";
}

export { API };

export default api;
