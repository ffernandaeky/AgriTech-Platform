"use client";

import Link from "next/link";
import React from "react";

export default function SignUpForm() {
  return (
    <div className="relative z-10 flex min-h-screen w-full items-center justify-center px-4 py-8">
      <div className="w-full max-w-xl rounded-[2rem] border border-white/20 bg-white/95 p-8 text-center shadow-2xl shadow-green-950/20 backdrop-blur-xl dark:border-white/10 dark:bg-[#101510]/95 sm:p-10">
        <p className="mb-3 text-[11px] font-black uppercase tracking-[0.3em] text-[#15803d] dark:text-green-400">
          Account Registration
        </p>
        <h1 className="text-3xl font-black uppercase tracking-tight text-gray-900 dark:text-white">
          Registrasi Belum Diaktifkan
        </h1>
        <p className="mx-auto mt-4 max-w-md text-sm font-medium leading-7 text-gray-500 dark:text-gray-400">
          Untuk versi saat ini, akun dikelola melalui seed users agar role admin dan user stabil selama pengembangan. Silakan masuk melalui form login di landing page.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex rounded-xl bg-[#15803d] px-8 py-4 text-[11px] font-black uppercase tracking-[0.2em] text-white transition hover:brightness-110"
        >
          Kembali ke Landing
        </Link>
      </div>
    </div>
  );
}
