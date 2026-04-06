import { createContext, useContext, useEffect, useState } from "react";
import api from "../lib/axios.js";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("certitrust-token");
    if (!token) {
      setLoading(false);
      return;
    }

    api
      .get("/auth/me")
      .then((response) => {
        setUser(response.data.data.user);
        setCompany(response.data.data.company || null);
      })
      .catch(() => localStorage.removeItem("certitrust-token"))
      .finally(() => setLoading(false));
  }, []);

  const persistSession = (payload) => {
    localStorage.setItem("certitrust-token", payload.token);
    setUser(payload.user);
    setCompany(payload.company || null);
  };

  const login = async (credentials) => {
    const response = await api.post("/auth/login", credentials);
    persistSession(response.data.data);
  };

  const register = async (formData) => {
    const response = await api.post("/auth/register", formData);
    persistSession(response.data.data);
  };

  const updateProfile = async (profileData) => {
    const localProfileImage =
      profileData instanceof FormData && profileData.get("profileImage") instanceof File
        ? {
            url: URL.createObjectURL(profileData.get("profileImage"))
          }
        : null;

    const response = await api.put("/auth/profile", profileData);
    setUser((current) => ({
      ...current,
      ...response.data.data.user,
      profileImage: response.data.data.user?.profileImage || current?.profileImage || localProfileImage
    }));
    setCompany(response.data.data.company || null);
  };

  const logout = () => {
    localStorage.removeItem("certitrust-token");
    setUser(null);
    setCompany(null);
  };

  return (
    <AuthContext.Provider value={{ user, company, loading, login, register, updateProfile, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
