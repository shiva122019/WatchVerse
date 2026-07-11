import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import api, { formatApiError } from "@/lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check whether the user already has a valid session
  const refresh = useCallback(async () => {
    try {
      const { data } = await api.get("/auth/me");
      setUser(data);
    } catch (e) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = async (email, password) => {
    try {
      const { data } = await api.post("/auth/login", {
        email,
        password,
      });

      setUser(data.user);

      return {
        ok: true,
      };
    } catch (e) {
      return {
        ok: false,
        error:
          formatApiError(
            e.response?.data?.message || e.response?.data?.detail,
          ) || e.message,
      };
    }
  };

  const register = async (email, password, username) => {
    try {
      const { data } = await api.post("/auth/register", {
        email,
        password,
        username,
      });

      setUser(data.user);

      return {
        ok: true,
      };
    } catch (e) {
      return {
        ok: false,
        error:
          formatApiError(
            e.response?.data?.message || e.response?.data?.detail,
          ) || e.message,
      };
    }
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (e) {
      // Ignore errors during logout
    }

    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        refresh,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
