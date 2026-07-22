import { createContext, useContext, useState } from "react";
import { loginRequest } from "../api/auth.js";

/* ============================================================
   Admin authentication state, shared app-wide.
   - login(user, pass): calls the API, stores the JWT
   - logout(): clears it
   - isAuthenticated: true only if a non-expired token is held
   The token is persisted in localStorage so a refresh keeps you in.
   ============================================================ */

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

const TOKEN_KEY = "delight_admin_token";
const USER_KEY = "delight_admin_user";

// Decode a JWT's payload to check its expiry (no verification — that's the
// server's job; this just avoids acting logged-in with an expired token).
function tokenExpired(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return !payload.exp || payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    const saved = localStorage.getItem(TOKEN_KEY);
    return saved && !tokenExpired(saved) ? saved : null;
  });
  const [username, setUsername] = useState(() => localStorage.getItem(USER_KEY) || null);

  const login = async (user, pass) => {
    const data = await loginRequest(user, pass);
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY, data.username);
    setToken(data.token);
    setUsername(data.username);
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUsername(null);
  };

  const isAuthenticated = !!token && !tokenExpired(token);

  return (
    <AuthContext.Provider value={{ token, username, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
