"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  BrainCircuit,
  Bell,
  Settings,
  ChevronsRight,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { useAppStore } from "@/store/app-store";

const navItems = [
  { href: "/dashboard", label: "لوحة التحكم", icon: LayoutDashboard },
  { href: "/projects", label: "المشاريع", icon: FolderKanban },
  { href: "/employees", label: "الموظفين", icon: Users },
  { href: "/analytics", label: "التحليلات الذكية", icon: BrainCircuit },
  { href: "/notifications", label: "التنبيهات", icon: Bell, badge: 3 },
  { href: "/settings", label: "الإعدادات", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar } = useAppStore();
  const collapsed = sidebarCollapsed;

  return (
    <motion.aside
      animate={{ width: collapsed ? 88 : 272 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="sticky top-0 flex h-screen shrink-0 flex-col bg-gradient-sidebar text-white/90"
    >
      {/* Logo */}
      <div className="flex h-20 items-center gap-3 px-6">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-soft p-1.5">
          <Image src="/brand/logo-icon.png" alt="منارة" width={28} height={56} className="h-full w-auto object-contain" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col whitespace-nowrap"
            >
              <span className="text-lg font-bold leading-tight">منارة</span>
              <span className="text-[11px] text-white/50 leading-tight">إدارة الابتكار</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-1.5 px-4 py-4">
        {navItems.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium transition-colors",
                active
                  ? "bg-white/10 text-white"
                  : "text-white/60 hover:bg-white/5 hover:text-white"
              )}
            >
              {active && (
                <motion.span
                  layoutId="sidebar-active"
                  className="absolute right-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-full bg-primary-400"
                />
              )}
              <item.icon className="h-5 w-5 shrink-0" />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
              {item.badge && !collapsed && (
                <span className="mr-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-danger px-1.5 text-[10px] font-bold text-white">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={toggleSidebar}
        className="mx-4 mb-2 flex items-center justify-center rounded-xl py-2.5 text-white/50 hover:bg-white/5 hover:text-white"
      >
        <motion.span animate={{ rotate: collapsed ? 180 : 0 }} transition={{ duration: 0.3 }}>
          <ChevronsRight className="h-4 w-4" />
        </motion.span>
      </button>

      {/* Current user */}
      <div className="border-t border-white/10 p-4">
        <div className="flex items-center gap-3">
          <Avatar name="سارة العتيبي" size={40} />
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-1 flex-col overflow-hidden"
              >
                <span className="truncate text-sm font-semibold text-white">سارة العتيبي</span>
                <span className="truncate text-xs text-white/50">مدير الابتكار</span>
              </motion.div>
            )}
          </AnimatePresence>
          {!collapsed && (
            <Link href="/login" className="text-white/50 hover:text-danger">
              <LogOut className="h-4 w-4" />
            </Link>
          )}
        </div>
      </div>
    </motion.aside>
  );
}
