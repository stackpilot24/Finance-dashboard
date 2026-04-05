"use client";
import { useEffect, useState } from "react";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("zorvyn_sidebar_collapsed");
    if (stored) setCollapsed(stored === "true");

    // Listen for storage changes (from Sidebar component)
    const handler = () => {
      const s = localStorage.getItem("zorvyn_sidebar_collapsed");
      setCollapsed(s === "true");
    };
    window.addEventListener("storage", handler);
    // Also poll since storage events don't fire in the same tab
    const interval = setInterval(handler, 300);
    return () => { window.removeEventListener("storage", handler); clearInterval(interval); };
  }, []);

  return (
    <div
      className={`flex flex-col flex-1 min-w-0 w-full overflow-x-hidden transition-all duration-300 ${collapsed ? "md:ml-16" : "md:ml-60"}`}
    >
      {children}
    </div>
  );
}
