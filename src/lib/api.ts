import axios from "axios";

let redirectingToLogin = false;

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api",
  withCredentials: true, 
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

export async function getCsrfCookie() {
  await axios.get(
    `${process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, "") || "http://localhost:8000"}/sanctum/csrf-cookie`,
    {
      withCredentials: true,
    },
  );
}

// 🛑 STRICT BROWSER LOCK: Node.js will completely ignore this during npm run build
if (typeof window !== "undefined" && typeof document !== "undefined") {
  
  // ROBUST CSRF EXTRACTION
  api.interceptors.request.use((config) => {
    const cookies = document.cookie.split(";");
    let xsrfToken = "";
    
    for (let cookie of cookies) {
      cookie = cookie.trim();
      if (cookie.startsWith("XSRF-TOKEN=")) {
        xsrfToken = decodeURIComponent(cookie.substring(11));
        break;
      }
    }

    if (xsrfToken) {
      config.headers["X-XSRF-TOKEN"] = xsrfToken;
    }
    return config;
  });

  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        if (!redirectingToLogin && !window.location.pathname.endsWith("/login")) {
          redirectingToLogin = true;
          if (window.location.pathname.startsWith("/admin")) {
            window.location.replace("/admin/login");
          } else {
            window.location.replace("/login");
          }
        }
      }
      return Promise.reject(error);
    }
  );
}