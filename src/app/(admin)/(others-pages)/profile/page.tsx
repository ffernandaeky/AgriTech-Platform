"use client";

import { useAuthUser } from "@/lib/auth";
import Image from "next/image";
import React from "react";

export default function Profile() {
  const user = useAuthUser();

  return (
    <div className="space-y-8 p-4 md:p-8 text-left text-gray-800 dark:text-gray-100">
      <header className="rounded-[2rem] bg-[#15803d] p-8 text-white shadow-lg shadow-green-900/10">
        <p className="mb-3 text-[10px] font-black uppercase tracking-[0.3em] text-white/60">Profile</p>
        <h1 className="text-2xl font-black uppercase tracking-tight">{user?.name || "Agri-Tech User"}</h1>
        <p className="mt-3 max-w-2xl text-sm font-medium leading-7 text-white/80">
          Profil sesi aktif untuk akses {user?.role || "user"} pada platform Agri-Tech.
        </p>
      </header>

      <section className="rounded-[2rem] border border-gray-100 bg-white p-8 dark:border-white/10 dark:bg-white/[0.03]">
        <div className="flex flex-col gap-6 md:flex-row md:items-center">
          <div className="h-24 w-24 overflow-hidden rounded-3xl border border-gray-100 dark:border-white/10">
            <Image src="/images/user/owner.jpg" alt="User profile" width={96} height={96} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#15803d] dark:text-green-400">
              {user?.role || "user"}
            </p>
            <h2 className="mt-2 text-xl font-black text-gray-900 dark:text-white">{user?.name || "-"}</h2>
            <p className="mt-1 text-sm font-medium text-gray-500 dark:text-gray-400">{user?.email || "-"}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
