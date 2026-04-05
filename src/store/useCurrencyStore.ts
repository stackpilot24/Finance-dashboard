"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CurrencyCode, CurrencyInfo } from "@/types";

export const CURRENCIES: Record<CurrencyCode, CurrencyInfo> = {
  INR: { code: "INR", symbol: "₹", name: "Indian Rupee", country: "India", flag: "🇮🇳", locale: "en-IN" },
  USD: { code: "USD", symbol: "$", name: "US Dollar", country: "United States", flag: "🇺🇸", locale: "en-US" },
  EUR: { code: "EUR", symbol: "€", name: "Euro", country: "Eurozone", flag: "🇪🇺", locale: "de-DE" },
  GBP: { code: "GBP", symbol: "£", name: "British Pound", country: "United Kingdom", flag: "🇬🇧", locale: "en-GB" },
  JPY: { code: "JPY", symbol: "¥", name: "Japanese Yen", country: "Japan", flag: "🇯🇵", locale: "ja-JP" },
  AED: { code: "AED", symbol: "د.إ", name: "UAE Dirham", country: "UAE", flag: "🇦🇪", locale: "ar-AE" },
  SGD: { code: "SGD", symbol: "S$", name: "Singapore Dollar", country: "Singapore", flag: "🇸🇬", locale: "en-SG" },
  CAD: { code: "CAD", symbol: "CA$", name: "Canadian Dollar", country: "Canada", flag: "🇨🇦", locale: "en-CA" },
  AUD: { code: "AUD", symbol: "A$", name: "Australian Dollar", country: "Australia", flag: "🇦🇺", locale: "en-AU" },
  CNY: { code: "CNY", symbol: "¥", name: "Chinese Yuan", country: "China", flag: "🇨🇳", locale: "zh-CN" },
};

// Fallback static rates (used if API fails)
const FALLBACK_RATES: Record<CurrencyCode, number> = {
  INR: 1,
  USD: 1 / 83.5,
  EUR: 1 / 90.2,
  GBP: 1 / 105.8,
  JPY: 1 / 0.56,
  AED: 1 / 22.7,
  SGD: 1 / 62.1,
  CAD: 1 / 61.8,
  AUD: 1 / 54.3,
  CNY: 1 / 11.5,
};

const CACHE_DURATION_MS = 6 * 60 * 60 * 1000; // refresh every 6 hours

interface CurrencyStore {
  selectedCurrency: CurrencyCode;
  rates: Record<CurrencyCode, number>;       // 1 INR = X target currency
  lastFetched: number | null;                // timestamp
  isLoading: boolean;
  error: string | null;
  setCurrency: (code: CurrencyCode) => void;
  convertFromINR: (amountInINR: number) => number;
  fetchRates: () => Promise<void>;
  getSymbol: () => string;
  getInfo: () => CurrencyInfo;
}

export const useCurrencyStore = create<CurrencyStore>()(
  persist(
    (set, get) => ({
      selectedCurrency: "INR",
      rates: FALLBACK_RATES,
      lastFetched: null,
      isLoading: false,
      error: null,

      setCurrency: (code) => set({ selectedCurrency: code }),

      convertFromINR: (amountInINR) => {
        const rate = get().rates[get().selectedCurrency] ?? FALLBACK_RATES[get().selectedCurrency];
        return amountInINR * rate;
      },

      fetchRates: async () => {
        const { lastFetched, isLoading } = get();
        const now = Date.now();

        // Skip if already loading or cache is fresh
        if (isLoading) return;
        if (lastFetched && now - lastFetched < CACHE_DURATION_MS) return;

        set({ isLoading: true, error: null });

        try {
          // frankfurter.app — free, no API key, returns rates relative to base currency
          const codes = Object.keys(CURRENCIES).filter((c) => c !== "INR").join(",");
          const res = await fetch(`https://api.frankfurter.app/latest?base=INR&symbols=${codes}`);

          if (!res.ok) throw new Error(`HTTP ${res.status}`);

          const data = await res.json() as { rates: Record<string, number> };

          const newRates: Record<CurrencyCode, number> = { ...FALLBACK_RATES };
          for (const [code, rate] of Object.entries(data.rates)) {
            if (code in CURRENCIES) {
              newRates[code as CurrencyCode] = rate;
            }
          }
          newRates.INR = 1;

          set({ rates: newRates, lastFetched: now, isLoading: false });
        } catch (err) {
          // Silently fall back to last known rates
          set({ isLoading: false, error: "Using cached rates" });
        }
      },

      getSymbol: () => CURRENCIES[get().selectedCurrency].symbol,
      getInfo: () => CURRENCIES[get().selectedCurrency],
    }),
    {
      name: "zorvyn_currency",
      partialize: (s) => ({
        selectedCurrency: s.selectedCurrency,
        rates: s.rates,
        lastFetched: s.lastFetched,
      }),
    }
  )
);
