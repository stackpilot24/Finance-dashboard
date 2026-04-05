"use client";
import { useState, useEffect, useRef } from "react";
import { Pencil, Check, X } from "lucide-react";
import { useUserStore } from "@/store/useUserStore";
import { motion } from "framer-motion";

function getGreeting(): { text: string; emoji: string } {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12)  return { text: "Good Morning",   emoji: "🌤️" };
  if (hour >= 12 && hour < 17) return { text: "Good Afternoon", emoji: "☀️" };
  if (hour >= 17 && hour < 21) return { text: "Good Evening",   emoji: "🌆" };
  return                               { text: "Good Night",     emoji: "🌙" };
}

export function GreetingBanner() {
  const { name, setName } = useUserStore();
  const [greeting, setGreeting] = useState<{ text: string; emoji: string } | null>(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Only compute on client to avoid hydration mismatch
  useEffect(() => {
    setGreeting(getGreeting());
  }, []);

  function startEdit() {
    setDraft(name === "there" ? "" : name);
    setEditing(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  function confirm() {
    setName(draft);
    setEditing(false);
  }

  function cancel() {
    setEditing(false);
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter") confirm();
    if (e.key === "Escape") cancel();
  }

  if (!greeting) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex items-center gap-3"
    >
      <span className="text-2xl select-none">{greeting.emoji}</span>

      <div className="flex items-center gap-2 flex-wrap">
        {editing ? (
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold tracking-tight">{greeting.text},</span>
            <input
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Enter your name"
              maxLength={30}
              className="text-2xl font-bold tracking-tight bg-transparent border-b-2 border-primary outline-none w-40 placeholder:text-muted-foreground/50 placeholder:font-normal placeholder:text-base"
            />
            <button onClick={confirm} className="text-emerald-500 hover:text-emerald-600 transition-colors">
              <Check className="h-5 w-5" />
            </button>
            <button onClick={cancel} className="text-muted-foreground hover:text-foreground transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 group">
            <h2 className="text-2xl font-bold tracking-tight">
              {greeting.text},{" "}
              <span className="text-primary">{name}!</span>
            </h2>
            <button
              onClick={startEdit}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
              title="Edit name"
            >
              <Pencil className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
