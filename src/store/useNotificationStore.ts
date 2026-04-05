"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Notification } from "@/types";

let idCounter = 1;
function generateId() { return `notif_${Date.now()}_${idCounter++}`; }

interface NotificationStore {
  notifications: Notification[];
  addNotification: (n: Omit<Notification, "id" | "timestamp" | "isRead">) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  dismiss: (id: string) => void;
  clearAll: () => void;
  unreadCount: () => number;
}

export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set, get) => ({
      notifications: [],
      addNotification: (n) =>
        set((s) => ({
          notifications: [
            { ...n, id: generateId(), timestamp: new Date().toISOString(), isRead: false },
            ...s.notifications,
          ],
        })),
      markRead: (id) =>
        set((s) => ({ notifications: s.notifications.map((n) => n.id === id ? { ...n, isRead: true } : n) })),
      markAllRead: () =>
        set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, isRead: true })) })),
      dismiss: (id) =>
        set((s) => ({ notifications: s.notifications.filter((n) => n.id !== id) })),
      clearAll: () => set({ notifications: [] }),
      unreadCount: () => get().notifications.filter((n) => !n.isRead).length,
    }),
    { name: "zorvyn_notifications" }
  )
);
