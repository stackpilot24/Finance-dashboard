"use client";
import { useCurrencyStore, CURRENCIES } from "@/store/useCurrencyStore";
import { CurrencyCode } from "@/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, RefreshCw, Wifi, WifiOff } from "lucide-react";

export function CurrencySelector() {
  const { selectedCurrency, setCurrency, isLoading, lastFetched, error, fetchRates } = useCurrencyStore();
  const current = CURRENCIES[selectedCurrency];

  const isLive = !!lastFetched && !error;
  const lastUpdated = lastFetched
    ? new Date(lastFetched).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="inline-flex items-center gap-1 h-8 px-2.5 text-xs font-medium rounded-lg border border-border bg-background hover:bg-muted transition-colors">
        <span>{current.flag}</span>
        <span>{current.code}</span>
        {isLoading
          ? <RefreshCw className="h-3 w-3 opacity-60 animate-spin" />
          : <ChevronDown className="h-3 w-3 opacity-60" />}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {/* Rate status */}
        <div className="flex items-center justify-between px-2 py-1.5 border-b mb-1">
          <div className="flex items-center gap-1.5">
            {isLive
              ? <Wifi className="h-3 w-3 text-emerald-500" />
              : <WifiOff className="h-3 w-3 text-amber-500" />}
            <span className="text-[10px] text-muted-foreground">
              {isLoading ? "Fetching rates..." : isLive ? `Live · ${lastUpdated}` : "Fallback rates"}
            </span>
          </div>
          {!isLoading && (
            <button onClick={(e) => { e.stopPropagation(); fetchRates(); }}
              className="text-[10px] text-primary hover:underline">
              Refresh
            </button>
          )}
        </div>

        {(Object.keys(CURRENCIES) as CurrencyCode[]).map((code) => {
          const info = CURRENCIES[code];
          return (
            <DropdownMenuItem
              key={code}
              onClick={() => setCurrency(code)}
              className={`flex items-center gap-2 text-sm cursor-pointer ${selectedCurrency === code ? "font-semibold bg-accent" : ""}`}
            >
              <span className="text-base">{info.flag}</span>
              <span className="flex-1">{info.country}</span>
              <span className="text-muted-foreground">{info.code}</span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
