import { useState } from "react";
import { useNavigate, useLocation, Navigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function AdminLogin() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ username: "admin", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Already logged in? Skip the form.
  if (isAuthenticated) return <Navigate to="/admin" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.username.trim() || !form.password) {
      setError("Enter both username and password.");
      return;
    }
    setLoading(true);
    try {
      await login(form.username.trim(), form.password);
      const dest = location.state?.from?.pathname || "/admin";
      navigate(dest, { replace: true });
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Navbar />
      <main className="flex flex-1 items-center justify-center bg-mist px-5 py-16">
        <div className="w-full max-w-md rounded-[2rem] border border-line bg-white p-8 shadow-[0_18px_50px_rgba(23,36,31,0.08)] md:p-10">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-2xl text-brand-600">
              <i className="fa-solid fa-user-shield"></i>
            </div>
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-brand-600">Admin</p>
            <h1 className="mt-2 font-display text-2xl font-semibold text-ink">Sign in</h1>
            <p className="mt-2 font-body text-sm text-muted">Enter your admin credentials to manage the store.</p>
          </div>

          {error && (
            <div className="mt-6 flex items-center gap-2 rounded-xl bg-danger/10 px-4 py-3 font-body text-sm text-danger">
              <i className="fa-solid fa-circle-exclamation"></i> {error}
            </div>
          )}

          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-widest text-brand-500">Username</label>
              <input
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                className="review-input"
                placeholder="admin"
                autoComplete="username"
              />
            </div>
            <div>
              <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-widest text-brand-500">Password</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="review-input"
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center disabled:cursor-not-allowed disabled:opacity-60">
              {loading ? (
                <><i className="fa-solid fa-spinner fa-spin mr-2"></i> Signing in…</>
              ) : (
                <><i className="fa-solid fa-right-to-bracket mr-2"></i> Sign in</>
              )}
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
