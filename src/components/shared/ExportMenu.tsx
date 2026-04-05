"use client";
import { Download, FileText, FileJson } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useFilteredTransactions } from "@/hooks/useFilteredTransactions";
import { toCSV, toJSON, downloadFile } from "@/lib/exportUtils";

export function ExportMenu() {
  const { allFiltered } = useFilteredTransactions();

  const handleCSV = () => {
    downloadFile(toCSV(allFiltered), "transactions.csv", "text/csv");
  };
  const handleJSON = () => {
    downloadFile(toJSON(allFiltered), "transactions.json", "application/json");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="inline-flex items-center gap-1.5 h-9 rounded-md border border-border bg-background px-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors">
        <Download className="h-3.5 w-3.5" />
        Export
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleCSV} className="gap-2 cursor-pointer">
          <FileText className="h-4 w-4" />
          Export CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleJSON} className="gap-2 cursor-pointer">
          <FileJson className="h-4 w-4" />
          Export JSON
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
