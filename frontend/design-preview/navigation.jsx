import { useSyncExternalStore } from "react";
const subscribe = (callback) => { window.addEventListener("popstate", callback); return () => window.removeEventListener("popstate", callback); };
export function usePathname() { return useSyncExternalStore(subscribe, () => window.location.pathname.startsWith("/admin") ? window.location.pathname : "/admin"); }
export function useRouter() { return { push: (path) => { window.history.pushState(null, "", path); window.dispatchEvent(new PopStateEvent("popstate")); }, refresh: () => {} }; }
