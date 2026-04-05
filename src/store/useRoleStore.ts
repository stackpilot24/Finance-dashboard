"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Role } from "@/types";

interface RoleStore {
  role: Role;
  setRole: (r: Role) => void;
}

export const useRoleStore = create<RoleStore>()(
  persist(
    (set) => ({
      role: "viewer",
      setRole: (role) => set({ role }),
    }),
    { name: "zorvyn_role" }
  )
);
