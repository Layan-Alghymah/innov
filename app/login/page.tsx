"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, Briefcase, User, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";

const quickRoles = [
  { role: "MANAGER", label: "مدير", icon: Briefcase },
  { role: "EMPLOYEE", label: "موظف", icon: User },
  { role: "INNOVATOR", label: "مبتكر", icon: Lightbulb },
] as const;

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      router.push("/dashboard");
    }, 700);
  }

  function quickLogin() {
    setLoading(true);
    setTimeout(() => router.push("/dashboard"), 500);
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-bg px-4">
      {/* Ambient background shapes */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-secondary/10 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 flex w-full max-w-md flex-col items-center"
      >
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex items-center justify-center rounded-2xl bg-white px-6 py-3.5 shadow-soft">
            <Image src="/brand/logo-full.png" alt="منارة" width={220} height={70} className="h-11 w-auto object-contain" priority />
          </div>
          <div className="text-center">
            <p className="mt-1 text-sm text-muted">سجّل الدخول لمتابعة مشاريعك وفريقك</p>
          </div>
        </div>

        {/* Login card */}
        <div className="glass-panel w-full rounded-3xl p-8 shadow-glass">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-700">البريد الإلكتروني</label>
              <div className="relative">
                <Mail className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  className="h-12 w-full rounded-xl border border-border bg-white pr-10 pl-4 text-sm outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-700">كلمة المرور</label>
              <div className="relative">
                <Lock className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  className="h-12 w-full rounded-xl border border-border bg-white pr-10 pl-10 text-sm outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <div className="flex justify-end">
                <a href="#" className="text-xs font-medium text-primary hover:underline">
                  نسيت كلمة المرور؟
                </a>
              </div>
            </div>

            <Button type="submit" size="lg" disabled={loading} className="mt-2 w-full">
              {loading ? "جارٍ تسجيل الدخول..." : "تسجيل الدخول"}
            </Button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted">دخول سريع للتجربة</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <div className="grid grid-cols-3 gap-3">
            {quickRoles.map(({ role, label, icon: Icon }) => (
              <button
                key={role}
                onClick={quickLogin}
                type="button"
                className="flex flex-col items-center gap-2 rounded-xl border border-border bg-white p-4 text-xs font-semibold text-slate-600 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-card"
              >
                <Icon className="h-5 w-5 text-primary" />
                {label}
              </button>
            ))}
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-muted">
          © 2026 منصّة إدارة الابتكار المؤسسي — جميع الحقوق محفوظة
        </p>
      </motion.div>
    </main>
  );
}
