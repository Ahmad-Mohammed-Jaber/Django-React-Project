// api.js
import axios from "axios";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "./constants";

const DEFAULT_API = "/choreo-apis/awbo/backend/rest-api-be2/v1.0";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || DEFAULT_API,
  timeout: 15000,
});

// attach access token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(ACCESS_TOKEN);
    if (token) {
      config.headers = { ...config.headers, Authorization: `Bearer ${token}` };
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// refresh + retry on 401 once
let refreshing = null; // promise guard so concurrent 401s share one refresh

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    // not a candidate to refresh
    const status = error?.response?.status;
    const code = error?.response?.data?.code;
    const isAuthError = status === 401 || code === "token_not_valid";

    // avoid infinite loop
    if (!isAuthError || original?._retry) {
      return Promise.reject(error);
    }
    original._retry = true;

    const refresh = localStorage.getItem(REFRESH_TOKEN);
    if (!refresh) {
      // no refresh token → kick to login
      localStorage.removeItem(ACCESS_TOKEN);
      return Promise.reject(error);
    }

    try {
      // share a single refresh request across callers
      if (!refreshing) {
        refreshing = api.post("/api/token/refresh/", { refresh }).then((res) => {
          const newAccess = res.data?.access;
          if (!newAccess) throw new Error("No access token in refresh response");
          localStorage.setItem(ACCESS_TOKEN, newAccess);
          return newAccess;
        }).finally(() => {
          refreshing = null;
        });
      }

      const newAccess = await refreshing;

      // update header and retry original request
      original.headers = {
        ...(original.headers || {}),
        Authorization: `Bearer ${newAccess}`,
      };
      return api.request(original);
    } catch (err) {
      // refresh failed → clear tokens so ProtectedRoute redirects next render
      localStorage.removeItem(ACCESS_TOKEN);
      localStorage.removeItem(REFRESH_TOKEN);
      return Promise.reject(err);
    }
  }
);

export default api;
