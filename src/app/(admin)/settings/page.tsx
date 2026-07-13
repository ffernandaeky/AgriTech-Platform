"use client";

import { useAuthUser } from "@/lib/auth";
import React from "react";

export default function SettingsPage() {
  const user = useAuthUser();

  return (
    <div className="space-y-8 p-4 md:p-8 text-left text-gray-800 dark:text-gray-100">
      <header className="rounded-[2rem] bg-[#15803d] p-8 text-white shadow-lg shadow-green-900/10">
        <p className="mb-3 text-[10px] font-black uppercase tracking-[0.3em] text-white/60">Account</p>
        <h1 className="text-2xl font-black uppercase tracking-tight">Pengaturan Akun</h1>
        <p className="mt-3 max-w-2xl text-sm font-medium leading-7 text-white/80">
          Ringkasan akses dan preferensi akun untuk sesi yang sedang aktif.
        </p>
      </header>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[2rem] border border-gray-100 bg-white p-8 dark:border-white/10 dark:bg-white/[0.03]">
          <h2 className="text-sm font-black uppercase tracking-[0.2em] text-gray-900 dark:text-white">Session Profile</h2>
          <div className="mt-6 space-y-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Name</p>
              <p className="mt-1 text-sm font-bold text-gray-800 dark:text-white">{user?.name || "-"}</p>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Email</p>
              <p className="mt-1 text-sm font-bold text-gray-800 dark:text-white">{user?.email || "-"}</p>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Role</p>
              <span className="mt-2 inline-block rounded-xl border border-green-200 bg-green-50 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-[#15803d] dark:border-green-500/20 dark:bg-green-500/10 dark:text-green-400">
                {user?.role || "user"}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-gray-100 bg-white p-8 dark:border-white/10 dark:bg-white/[0.03]">
          <h2 className="text-sm font-black uppercase tracking-[0.2em] text-gray-900 dark:text-white">Status Sistem</h2>
          <p className="mt-6 text-sm font-medium leading-7 text-gray-500 dark:text-gray-400">
            Autentikasi saat ini memakai seed users lokal untuk prototipe. Modul sudah dipisah sehingga dapat diganti ke database user dan session backend ketika tabel user siap.
          </p>
        </div>
      </section>
    </div>
  );
}
