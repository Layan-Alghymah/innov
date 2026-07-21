"use client";

import { Search, Bell, Moon, Sun } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { useAppStore } from "@/store/app-store";
import { notifications } from "@/lib/mock-data";

export function Topbar({ title }: { title: string }) {
  const { theme, toggleTheme } = useAppStore();
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-20 flex h-20 items-center justify-between gap-4 border-b border-border bg-bg/80 px-8 backdrop-blur-xl dark:border-border-dark dark:bg-bg-dark/80">
      <div>
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">{title}</h1>
      </div>

      <div className="flex flex-1 items-center justify-end gap-3">
        <div className="relative w-full max-w-sm">
          <Search className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="ابحث عن مشروع، موظف، تقرير..."
            className="h-11 w-full rounded-xl border border-border bg-white pr-10 pl-4 text-sm outline-none transition-colors focus:border-primary/50 focus:ring-2 focus:ring-primary/20 dark:border-border-dark dark:bg-surface-dark"
          />
        </div>

        <button
          onClick={toggleTheme}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border text-slate-500 transition-colors hover:bg-slate-50 dark:border-border-dark dark:text-slate-300 dark:hover:bg-white/5"
        >
          {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        </button>

        <button className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border text-slate-500 transition-colors hover:bg-slate-50 dark:border-border-dark dark:text-slate-300 dark:hover:bg-white/5">
          <Bell className="h-4 w-4" />
          {unread > 0 && (
            <span className="absolute -top-1 -left-1 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-[9px] font-bold text-white">
              {unread}
            </span>
          )}
        </button>

        <Avatar name="سارة العتيبي" size={44} />
      </div>
    </header>
  );
}
