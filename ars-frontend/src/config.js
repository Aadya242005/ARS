const isProd = import.meta.env.PROD;

export const BACKEND_API = isProd
  ? import.meta.env.VITE_BACKEND_API_URL
  : "http://localhost:5050";

export const AGENTS_API = isProd
  ? import.meta.env.VITE_AGENTS_API_URL
  : "http://localhost:8000";
