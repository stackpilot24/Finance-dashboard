"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UserStore {
  name: string;
  setName: (name: string) => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      name: "there",
      setName: (name) => set({ name: name.trim() || "there" }),
    }),
    { name: "zorvyn_user" }
  )
);
