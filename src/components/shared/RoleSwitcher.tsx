"use client";
import { useRoleStore } from "@/store/useRoleStore";
import { Role } from "@/types";
import { Shield, Eye } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function RoleSwitcher() {
  const { role, setRole } = useRoleStore();

  return (
    <div className="flex items-center gap-2">
      <Select value={role} onValueChange={(v) => setRole(v as Role)}>
        <SelectTrigger className="w-36 h-9 text-sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="viewer">
            <span className="flex items-center gap-2">
              <Eye className="h-3.5 w-3.5 text-blue-500" />
              Viewer
            </span>
          </SelectItem>
          <SelectItem value="admin">
            <span className="flex items-center gap-2">
              <Shield className="h-3.5 w-3.5 text-amber-500" />
              Admin
            </span>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
