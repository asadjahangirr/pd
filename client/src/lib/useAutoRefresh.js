import { useEffect, useRef } from "react";

/* Keeps data fresh without manual reloads. Runs `fn`:
   - when the tab regains focus / becomes visible
   - on a light interval (if intervalMs > 0)
   - whenever something calls triggerRefresh() (instant, in-tab)
   Always uses the latest `fn` via a ref, so it never needs re-subscribing. */

export const REFRESH_EVENT = "app:refresh";
export const triggerRefresh = () => window.dispatchEvent(new Event(REFRESH_EVENT));

export function useAutoRefresh(fn, intervalMs = 20000) {
  const ref = useRef(fn);
  ref.current = fn;

  useEffect(() => {
    const run = () => {
      if (!document.hidden) ref.current();
    };
    window.addEventListener("focus", run);
    document.addEventListener("visibilitychange", run);
    window.addEventListener(REFRESH_EVENT, run);
    const id = intervalMs ? setInterval(run, intervalMs) : 0;
    return () => {
      window.removeEventListener("focus", run);
      document.removeEventListener("visibilitychange", run);
      window.removeEventListener(REFRESH_EVENT, run);
      if (id) clearInterval(id);
    };
  }, [intervalMs]);
}
