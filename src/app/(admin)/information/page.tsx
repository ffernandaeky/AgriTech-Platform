"use client";

import { useAuthUser } from "@/lib/auth";
import React from "react";

const adminAccess = [
  "Mengatur keyword pencarian video dan menjalankan scraping data YouTube.",
  "Memantau pemrosesan NLP, pelabelan data, dan evaluasi hasil model AI.",
  "Mengelola daftar video, dashboard, serta kesiapan data untuk analisis lanjutan.",
];

const userAccess = [
  "Melihat dashboard ringkasan dan daftar video pertanian yang sudah diproses.",
  "Menelusuri konten berdasarkan topik seperti hama, pemupukan, irigasi, hidroponik, dan budidaya organik.",
  "Membaca informasi sistem tanpa akses ke fitur pengambilan data, pelabelan, atau pengaturan model.",
];

const roleDetails = {
  admin: {
    title: "Akses Admin",
    badge: "Pengelola Sistem",
    intro: "Admin berperan sebagai pengelola operasional data dan model pada sistem Agri-Tech.",
    items: adminAccess,
  },
  user: {
    title: "Akses User",
    badge: "Pembaca Informasi",
    intro: "User berfokus pada eksplorasi informasi dan pemanfaatan hasil analisis yang sudah siap dibaca.",
    items: userAccess,
  },
};

const moduleItems = [
  {
    title: "Scraping",
    body: "Mengambil metadata video pertanian dari YouTube berdasarkan kata kunci dan topik yang relevan.",
  },
  {
    title: "NLP Pipeline",
    body: "Membersihkan teks judul dan deskripsi agar siap digunakan untuk proses klasifikasi.",
  },
  {
    title: "BERT Prediction",
    body: "Memanfaatkan IndoBERT untuk memprediksi kategori topik pertanian dari konten video.",
  },
];

export default function InformationPage() {
  const user = useAuthUser();
  const currentRole = user?.role || "user";
  const roleCards = [roleDetails.admin, roleDetails.user];

  return (
    <div className="space-y-8 p-4 md:p-8 text-left text-gray-800 dark:text-gray-100">
      <header className="rounded-[2rem] bg-[#15803d] p-8 text-white shadow-lg shadow-green-900/10">
        <p className="mb-3 text-[10px] font-black uppercase tracking-[0.3em] text-white/60">Information</p>
        <h1 className="text-2xl font-black uppercase tracking-tight">Tentang Agri-Tech</h1>
        <p className="mt-3 max-w-2xl text-sm font-medium leading-7 text-white/80">
          Agriculture Technology Dashboard membantu pengelolaan data YouTube pertanian dari scraping hingga prediksi topik menggunakan model AI.
        </p>
      </header>

      <section className="grid gap-6 lg:grid-cols-3">
        {moduleItems.map((item) => (
          <div key={item.title} className="rounded-[2rem] border border-gray-100 bg-white p-8 dark:border-white/10 dark:bg-white/[0.03]">
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-gray-900 dark:text-white">{item.title}</h2>
            <p className="mt-4 text-sm font-medium leading-7 text-gray-500 dark:text-gray-400">
              {item.body}
            </p>
          </div>
        ))}
      </section>

      <section className="rounded-[2rem] border border-gray-100 bg-white p-8 dark:border-white/10 dark:bg-white/[0.03]">
        <h2 className="mb-6 text-sm font-black uppercase tracking-[0.2em] text-gray-900 dark:text-white">Role Access</h2>
        <div className="grid gap-5 lg:grid-cols-2">
          {roleCards.map((role) => {
            const isActiveRole = currentRole === role.title.replace("Akses ", "").toLowerCase();

            return (
              <article
                key={role.title}
                className={`flex h-full flex-col rounded-2xl border p-6 transition dark:bg-white/[0.03] ${
                  isActiveRole
                    ? "border-green-200 bg-green-50/60 shadow-sm dark:border-green-400/20"
                    : "border-gray-100 bg-gray-50 dark:border-white/10"
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.25em] text-[#15803d] dark:text-green-400">{role.title}</p>
                    <p className="mt-2 text-xs font-black uppercase tracking-[0.18em] text-gray-400 dark:text-gray-500">{role.badge}</p>
                  </div>
                  {isActiveRole && (
                    <span className="rounded-full bg-[#15803d] px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-white">
                      Role Aktif
                    </span>
                  )}
                </div>
                <p className="mt-5 text-sm font-semibold leading-6 text-gray-700 dark:text-gray-200">{role.intro}</p>
                <div className="mt-5 flex flex-1 flex-col gap-3">
                  {role.items.map((item) => (
                    <p key={item} className="rounded-xl border border-gray-100 bg-white px-4 py-3 text-sm font-medium leading-6 text-gray-500 dark:border-white/10 dark:bg-white/[0.03] dark:text-gray-400">
                      {item}
                    </p>
                  ))}
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
