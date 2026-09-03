import { createContext, useContext, useState, useEffect } from "react";
import api from "../Services/api";
import { auth, googleProvider, signInWithPopup } from "../firebase";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMe = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      // If token is a firebase token or custom session
      if (token.startsWith("google_fb_")) {
        const savedUser = localStorage.getItem("user");
        if (savedUser) {
          try {
            setUser(JSON.parse(savedUser));
          } catch (e) {
            logout();
          }
        }
        setLoading(false);
        return;
      }

      try {
        const response = await api.get("/auth/me");
        if (response.data && response.data.success) {
          setUser(response.data.user || response.data.data);
        } else {
          logout();
        }
      } catch (err) {
        console.error("Auth check failed:", err);
        logout();
      } finally {
        setLoading(false);
      }
    };

    fetchMe();
  }, [token]);

  const login = async (email, password) => {
    try {
      const response = await api.post("/auth/login", { email, password });
      if (response.data && response.data.success) {
        const newToken = response.data.token || response.data.data?.token;
        const userData = response.data.user || response.data.data?.user || response.data.data;
        
        localStorage.setItem("token", newToken);
        localStorage.setItem("user", JSON.stringify(userData));
        setToken(newToken);
        setUser(userData);
        return { success: true, message: response.data.message };
      } else {
        return { success: false, message: response.data?.message || "Login failed" };
      }
    } catch (error) {
      const msg = error.response?.data?.message || "Invalid credentials or server error";
      return { success: false, message: msg };
    }
  };

  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;

      const googleUserObj = {
        id: fbUser.uid,
        name: fbUser.displayName || "Google User",
        email: fbUser.email,
        role: "admin",
        avatar: fbUser.photoURL,
      };

      const customToken = `google_fb_${fbUser.uid}`;

      localStorage.setItem("token", customToken);
      localStorage.setItem("user", JSON.stringify(googleUserObj));
      setToken(customToken);
      setUser(googleUserObj);

      return { success: true, message: "Google Sign-In successful" };
    } catch (error) {
      console.error("Google Auth error:", error);
      return {
        success: false,
        message: error.message || "Google Sign-In popup was closed or canceled",
      };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
