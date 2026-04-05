"use client";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Bell, CheckCheck, Trash2, Info, AlertTriangle, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNotificationStore } from "@/store/useNotificationStore";
import { Notification, NotificationType } from "@/types";

const TYPE_CONFIG: Record<NotificationType, { icon: React.ReactNode; color: string; bg: string }> = {
  info:    { icon: <Info className="h-4 w-4" />,          color: "text-blue-500",    bg: "bg-blue-50 dark:bg-blue-950/30" },
  warning: { icon: <AlertTriangle className="h-4 w-4" />, color: "text-amber-500",   bg: "bg-amber-50 dark:bg-amber-950/30" },
  success: { icon: <CheckCircle className="h-4 w-4" />,   color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950/30" },
  error:   { icon: <AlertCircle className="h-4 w-4" />,   color: "text-red-500",     bg: "bg-red-50 dark:bg-red-950/30" },
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function isToday(iso: string): boolean {
  return new Date(iso).toDateString() === new Date().toDateString();
}

function NotificationItem({ n }: { n: Notification }) {
  const { markRead, dismiss } = useNotificationStore();
  const cfg = TYPE_CONFIG[n.type];
  return (
    <div
      className={`relative flex gap-3 rounded-lg p-3 transition-colors ${n.isRead ? "opacity-60" : cfg.bg} ${!n.isRead ? "cursor-pointer" : ""}`}
      onClick={() => !n.isRead && markRead(n.id)}
    >
      <div className={`mt-0.5 shrink-0 ${cfg.color}`}>{cfg.icon}</div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold leading-snug ${n.isRead ? "text-muted-foreground" : "text-foreground"}`}>
          {n.title}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed break-words">
          {n.message}
        </p>
        <p className="text-[10px] text-muted-foreground mt-1">{timeAgo(n.timestamp)}</p>
      </div>
      <button
        className="shrink-0 mt-0.5 text-muted-foreground hover:text-foreground transition-colors"
        onClick={(e) => { e.stopPropagation(); dismiss(n.id); }}
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

interface Props { open: boolean; onClose: () => void; }

export function NotificationPanel({ open, onClose }: Props) {
  const { notifications, markAllRead, clearAll } = useNotificationStore();
  const [mounted, setMounted] = useState(false);

  // Must be mounted client-side to use createPortal
  useEffect(() => { setMounted(true); }, []);

  const today = notifications.filter((n) => isToday(n.timestamp));
  const earlier = notifications.filter((n) => !isToday(n.timestamp));

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop — z-[100] to sit above everything */}
          <motion.div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm"
            style={{ zIndex: 100 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Panel — z-[101] to sit above backdrop */}
          <motion.div
            className="fixed top-0 right-0 h-full w-full max-w-sm bg-background border-l shadow-2xl flex flex-col"
            style={{ zIndex: 101 }}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b px-4 py-3 shrink-0">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-muted-foreground" />
                <span className="font-semibold text-sm">Notifications</span>
                {notifications.filter((n) => !n.isRead).length > 0 && (
                  <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                    {notifications.filter((n) => !n.isRead).length}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={markAllRead}>
                  <CheckCheck className="h-3 w-3" /> All read
                </Button>
                <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-muted-foreground" onClick={clearAll}>
                  <Trash2 className="h-3 w-3" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
                  <Bell className="h-10 w-10 opacity-20" />
                  <p className="text-sm">No notifications</p>
                </div>
              ) : (
                <>
                  {today.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Today</p>
                      {today.map((n) => <NotificationItem key={n.id} n={n} />)}
                    </div>
                  )}
                  {earlier.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Earlier</p>
                      {earlier.map((n) => <NotificationItem key={n.id} n={n} />)}
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body   // ← renders outside any stacking context
  );
}
