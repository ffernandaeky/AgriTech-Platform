"use client";

import Checkbox from "@/components/form/input/Checkbox";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { ThemeToggleButton } from "@/components/common/ThemeToggleButton";
import Button from "@/components/ui/button/Button";
import { CloseIcon, EyeCloseIcon, EyeIcon } from "@/icons";
import { AuthAccount, getAuthUsers, login } from "@/lib/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useMemo, useState } from "react";

type SignInFormProps = {
  compact?: boolean;
  onClose?: () => void;
};

export default function SignInForm({ compact = false, onClose }: SignInFormProps) {
  const router = useRouter();
  const accounts = useMemo(() => getAuthUsers(), []);
  const adminAccount = accounts.find((account) => account.role === "admin") || accounts[0];
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(true);
  const [email, setEmail] = useState(adminAccount?.email || "");
  const [password, setPassword] = useState(adminAccount?.password || "");
  const [error, setError] = useState("");

  const selectAccount = (account: AuthAccount) => {
    setEmail(account.email);
    setPassword(account.password);
    setError("");
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const user = login(email, password, isChecked);
    if (!user) {
      setError("Email atau password tidak sesuai.");
      return;
    }

    router.replace("/dashboard");
  };

  const accountDescriptions: Record<AuthAccount["role"], string> = {
    admin: "Akses penuh dashboard",
    user: "Akses pengguna",
  };

  const formCard = (
      <div
        className={`relative grid w-full overflow-hidden border border-white bg-white shadow-2xl shadow-emerald-950/15 backdrop-blur-xl dark:border-white/10 dark:bg-[#101510] ${
          compact
            ? "max-h-[calc(100vh-7rem)] max-w-xl overflow-y-auto rounded-2xl"
            : "max-w-6xl rounded-[1.75rem] lg:grid-cols-[1fr_0.95fr]"
        }`}
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-1.5 bg-[linear-gradient(90deg,#16a34a_0%,#84cc16_48%,#0f766e_100%)]" />
        <div className="pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full bg-emerald-200/35 blur-3xl dark:bg-emerald-500/10" />
        <section
          className={`relative min-h-[720px] overflow-hidden bg-[#173c27] text-white ${
            compact ? "hidden" : "hidden lg:block"
          }`}
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=1400&q=85')",
            }}
          />
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(10,31,19,0.92)_0%,rgba(23,60,39,0.7)_48%,rgba(9,20,13,0.42)_100%)]" />

          <div className="relative z-10 flex h-full flex-col justify-between p-12">
            <div>
              <Link href="/" className="inline-flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-[#176b3a] shadow-lg shadow-black/20">
                  <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7" aria-hidden="true">
                    <path
                      d="M5 12.7C5 7.9 8.5 4.2 13.8 3c.3 5.8-2.6 9.4-7.8 10.8 1.3 2.9 4.1 4.7 7.7 4.7 2.1 0 3.9-.5 5.3-1.5-.9 2.5-3.3 4-6.5 4C8 21 5 17.7 5 12.7Z"
                      fill="currentColor"
                    />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl font-black leading-none tracking-tight text-white">Agri-Tech</h1>
                  <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-100">
                    Agriculture Technology Dashboard
                  </p>
                </div>
              </Link>

              <div className="mt-20 max-w-xl">
                <p className="mb-4 text-[11px] font-black uppercase tracking-[0.32em] text-emerald-200">
                  Secure Workspace
                </p>
                <h2 className="text-5xl font-black leading-[1.02] tracking-tight">
                  Masuk ke ruang analisis konten pertanian.
                </h2>
                <p className="mt-6 text-sm font-medium leading-7 text-white/75">
                  Dashboard Agri-Tech menggabungkan scraping YouTube, klasifikasi topik BERT, dan visualisasi agar data
                  pertanian lebih mudah dibaca oleh admin dan user.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                ["Role", "Admin/User"],
                ["Model", "BERT"],
                ["Focus", "Agrikultur"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-100">{label}</p>
                  <p className="mt-2 text-lg font-black text-white">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className={`relative flex flex-col justify-center p-6 sm:p-8 ${compact ? "" : "lg:p-12"}`}>
          <div className="mb-7 flex items-center justify-between">
            <Link href="/" className="inline-flex items-center gap-3 text-[#176b3a] transition hover:text-emerald-700 dark:text-emerald-300 dark:hover:text-emerald-200">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 dark:bg-emerald-500">
                <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
                  <path fillRule="evenodd" clipRule="evenodd" d="M11.665 3.75618C11.8762 3.65061 12.1247 3.65061 12.3358 3.75618L18.7807 6.97853L12.3358 10.2009C12.1247 10.3064 11.8762 10.3064 11.665 10.2009L5.22014 6.97853L11.665 3.75618ZM4.29297 8.19199V16.0946C4.29297 16.3787 4.45347 16.6384 4.70757 16.7654L11.25 20.0365V11.6512C11.1631 11.6205 11.0777 11.5843 10.9942 11.5425L4.29297 8.19199ZM12.75 20.037L19.2933 16.7654C19.5474 16.6384 19.7079 16.3787 19.7079 16.0946V8.19199L13.0066 11.5425C12.9229 11.5844 12.8372 11.6208 12.75 11.6516V20.037ZM13.0066 2.41453C12.3732 2.09783 11.6277 2.09783 10.9942 2.41453L4.03676 5.89316C3.27449 6.27429 2.79297 7.05339 2.79297 7.90563V16.0946C2.79297 16.9468 3.27448 17.7259 4.03676 18.1071L10.9942 21.5857C11.6277 21.9024 12.3732 21.9024 13.0066 21.5857L19.9641 18.1071C20.7264 17.7259 21.2079 16.9468 21.2079 16.0946V7.90563C21.2079 7.05339 20.7264 6.27429 19.9641 5.89316L13.0066 2.41453Z" fill="currentColor" />
                </svg>
              </span>
              <span className="text-xs font-black uppercase tracking-[0.18em]">
                Agri-Tech
              </span>
            </Link>
            <div className="flex items-center gap-2">
              {!compact && <ThemeToggleButton />}
              {compact && (
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Tutup login"
                  className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-emerald-300 hover:text-emerald-700 dark:border-white/10 dark:bg-white/[0.04] dark:text-gray-300 dark:hover:border-emerald-500/40 dark:hover:text-emerald-200"
                >
                  <CloseIcon className="h-5 w-5 fill-current" />
                </button>
              )}
            </div>
          </div>

          <div className="mb-8">
            <p className="mb-3 text-[11px] font-black uppercase tracking-[0.28em] text-[#176b3a] dark:text-emerald-300">
              Portal Login
            </p>
            <h2 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Selamat datang
            </h2>
          </div>

          <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {accounts.map((account) => {
              const isSelected = email === account.email;

              return (
                <button
                  key={account.email}
                  type="button"
                  onClick={() => selectAccount(account)}
                  className={`rounded-2xl border px-5 py-4 text-left transition-all ${
                    isSelected
                      ? "border-[#176b3a] bg-[linear-gradient(135deg,#ecfdf5_0%,#f7fee7_100%)] text-[#176b3a] shadow-md shadow-emerald-900/10 dark:border-emerald-400/40 dark:bg-none dark:bg-emerald-400/10 dark:text-emerald-300"
                      : "border-gray-100 bg-white text-gray-600 shadow-sm hover:border-emerald-200 hover:bg-emerald-50/40 dark:border-white/10 dark:bg-white/[0.03] dark:text-gray-300"
                  }`}
                >
                  <span className="block text-[10px] font-black uppercase tracking-[0.24em]">{account.role}</span>
                  <span className="mt-1 block text-sm font-black">{accountDescriptions[account.role]}</span>
                  <span className="mt-3 block truncate text-xs font-semibold opacity-70">{account.email}</span>
                </button>
              );
            })}
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-5">
              <div>
                <Label>Email</Label>
                <Input
                  placeholder="admin@agritech.local"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </div>
              <div>
                <Label>Password</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Masukkan password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="absolute right-4 top-1/2 z-30 -translate-y-1/2"
                    aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                  >
                    {showPassword ? (
                      <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                    ) : (
                      <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-bold text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
                  {error}
                </div>
              )}

              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Checkbox checked={isChecked} onChange={setIsChecked} />
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Ingat sesi login</span>
                </div>
                <Link
                  href="/"
                  className="text-xs font-black uppercase tracking-[0.18em] text-[#176b3a] dark:text-emerald-300"
                >
                  Landing
                </Link>
              </div>

              <Button className="w-full !rounded-xl !py-4 !font-black uppercase tracking-[0.18em]" size="sm">
                Masuk Dashboard
              </Button>
            </div>
          </form>
        </section>
      </div>
  );

  if (compact) {
    return formCard;
  }

  return (
    <main className="relative z-10 flex min-h-screen w-full items-center justify-center px-4 py-8 sm:px-6 lg:px-10">
      {formCard}
    </main>
  );
}
