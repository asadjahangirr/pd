import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../components/AdminLayout.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { fetchMessages, updateMessage, deleteMessage } from "../api/admin.js";
import { useAutoRefresh, triggerRefresh } from "../lib/useAutoRefresh.js";

const fmtDate = (d) => new Date(d).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });

export default function AdminInbox() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all | unread
  const [error, setError] = useState("");

  const handleAuthError = (err) => {
    if (err.status === 401) {
      logout();
      navigate("/admin/login", { replace: true });
      return true;
    }
    return false;
  };

  const load = (silent = false) => {
    if (!silent) setLoading(true);
    fetchMessages()
      .then(setMessages)
      .catch((err) => {
        if (!handleAuthError(err)) setError("Couldn't load messages");
      })
      .finally(() => {
        if (!silent) setLoading(false);
      });
  };
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useAutoRefresh(() => load(true), 20000);

  const unread = useMemo(() => messages.filter((m) => !m.read).length, [messages]);
  const shown = filter === "unread" ? messages.filter((m) => !m.read) : messages;

  const setRead = async (m, read) => {
    // optimistic
    setMessages((list) => list.map((x) => (x.id === m.id ? { ...x, read } : x)));
    try {
      await updateMessage(m.id, { read });
      triggerRefresh(); // update the sidebar unread badge instantly
    } catch (err) {
      if (!handleAuthError(err)) {
        setError(err.message);
        load();
      }
    }
  };

  const del = async (m) => {
    if (!window.confirm(`Delete message from ${m.name}?`)) return;
    try {
      await deleteMessage(m.id);
      load(true);
      triggerRefresh();
    } catch (err) {
      if (!handleAuthError(err)) setError(err.message);
    }
  };

  return (
    <AdminLayout title="Inbox">
      {error && (
        <div className="mb-5 flex items-center justify-between gap-2 rounded-xl bg-danger/10 px-4 py-3 font-body text-sm text-danger">
          <span><i className="fa-solid fa-circle-exclamation mr-1.5"></i> {error}</span>
          <button onClick={() => setError("")} aria-label="Dismiss"><i className="fa-solid fa-xmark"></i></button>
        </div>
      )}

      <div className="mb-6 flex flex-wrap gap-2">
        <button onClick={() => setFilter("all")} className={`chip ${filter === "all" ? "chip-active" : ""}`}>All ({messages.length})</button>
        <button onClick={() => setFilter("unread")} className={`chip ${filter === "unread" ? "chip-active" : ""}`}>Unread ({unread})</button>
      </div>

      {loading ? (
        <div className="py-16 text-center"><i className="fa-solid fa-spinner fa-spin text-2xl text-brand-400"></i></div>
      ) : shown.length === 0 ? (
        <div className="rounded-2xl border border-line bg-white p-12 text-center">
          <i className="fa-solid fa-inbox mb-3 text-4xl text-brand-200"></i>
          <p className="font-display text-lg text-ink">No {filter === "unread" ? "unread " : ""}messages</p>
          <p className="mt-1 font-body text-sm text-muted">Contact-form submissions will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {shown.map((m) => (
            <div key={m.id} className={`rounded-2xl border bg-white p-5 ${m.read ? "border-line" : "border-brand-300"}`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="flex items-center gap-2 font-display text-base font-semibold text-ink">
                    {!m.read && <span className="h-2 w-2 shrink-0 rounded-full bg-brand-600" title="Unread"></span>}
                    {m.name}
                  </p>
                  <p className="font-body text-xs text-muted">
                    {m.email && (
                      <a href={`mailto:${m.email}`} className="text-brand-700 hover:underline">{m.email}</a>
                    )}
                    {m.email ? " · " : ""}{fmtDate(m.createdAt)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setRead(m, !m.read)} className="inline-flex items-center rounded-full border border-line px-3 py-1.5 font-body text-xs font-semibold text-ink transition-colors hover:bg-brand-50 hover:text-brand-700">
                    <i className={`fa-solid ${m.read ? "fa-envelope" : "fa-envelope-open"} mr-1.5`}></i> Mark {m.read ? "unread" : "read"}
                  </button>
                  <button onClick={() => del(m)} aria-label="Delete" className="inline-flex items-center rounded-full border border-line px-3 py-1.5 font-body text-xs font-semibold text-danger transition-colors hover:bg-danger/10">
                    <i className="fa-solid fa-trash-can"></i>
                  </button>
                </div>
              </div>
              {m.subject && <p className="mt-3 font-body text-sm font-semibold text-ink">{m.subject}</p>}
              <p className="mt-1 whitespace-pre-wrap font-body text-sm text-muted">{m.message}</p>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
