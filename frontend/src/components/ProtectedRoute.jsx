import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import api from "../api";
import { REFRESH_TOKEN, ACCESS_TOKEN } from "../constants";

export default function ProtectedRoute({ children }) {
  const [isAuthorized, setIsAuthorized] = useState(null); // null = loading

  const doRefresh = async () => {
    const refresh = localStorage.getItem(REFRESH_TOKEN);
    if (!refresh) return setIsAuthorized(false);
    try {
      const res = await api.post("/api/token/refresh/", { refresh }); // add/remove slash per your URLs
      if (res.status === 200 && res.data?.access) {
        localStorage.setItem(ACCESS_TOKEN, res.data.access);
        setIsAuthorized(true);
      } else {
        setIsAuthorized(false);
      }
    } catch (e) {
      console.error("refresh failed:", e);
      setIsAuthorized(false);
    }
  };

  const auth = async () => {
    const token = localStorage.getItem(ACCESS_TOKEN);
    if (!token) return setIsAuthorized(false);
    try {
      const { exp } = jwtDecode(token);
      const now = Date.now() / 1000;
      if (exp && exp > now) setIsAuthorized(true);
      else await doRefresh();
    } catch {
      await doRefresh();
    }
  };

  useEffect(() => {
    auth().catch(() => setIsAuthorized(false));
  }, []);

  if (isAuthorized === null) return <div>Loading...</div>;
  return isAuthorized ? children : <Navigate to="/login" replace />;
}
