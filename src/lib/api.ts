import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:8000/api",
  withCredentials: true, 
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Extract the CSRF token and force it into the headers
api.interceptors.request.use((config) => {
  if (typeof document !== "undefined") {
    const match = document.cookie.match(new RegExp("(^|;\\s*)(XSRF-TOKEN)=([^;]*)"));
    if (match) {
      config.headers["X-XSRF-TOKEN"] = decodeURIComponent(match[3]);
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      if (typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
        
        // Route admins to the admin login, and merchants to the merchant login
        if (window.location.pathname.startsWith("/admin")) {
          window.location.href = "/admin/login";
        } else {
          window.location.href = "/login";
        }
        
        // Halt the promise chain immediately
        return new Promise(() => {}); 
      }
    }
    return Promise.reject(error);
  }
);