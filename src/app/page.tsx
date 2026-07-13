import { LoginModalButton, PublicFooter, PublicHeader } from "@/components/landing/PublicShell";
import { ArrowRight, Bot, Database, FileText } from "lucide-react";
import Link from "next/link";

const featureCards = [
  {
    title: "Wawasan Informasi Video",
    body: "Menyajikan transparansi data video YouTube secara utuh dan terstruktur, meliputi penelitian judul, deskripsi, akumulasi jumlah tayangan, kategori, nama channel, jumlah suka, hingga hasil pemetaan kategori berdasarkan topik pertanian.",
    icon: Bot,
  },
  {
    title: "Akses Video Pertanian",
    body: "Menyediakan akses langsung bagi pengguna untuk memutar dan menonton video edukasi pertanian pilihan tanpa perlu meninggalkan platform website, menciptakan pengalaman interaksi konten yang ringkas dan terintegrasi.",
    icon: Database,
  },
  {
    title: "Analisis Topik Video Pertanian",
    body: "Menampilkan pemetaan ragam topik pertanian yang tersedia di dalam database, berfungsi sebagai sistem navigasi cerdas yang memudahkan pengguna dalam mencari dan menemukan konten spesifik sesuai kebutuhan informasinya.",
    icon: FileText,
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#f7f9fb] text-[#191c1e] transition-colors dark:bg-[#07110b] dark:text-white">
        <PublicHeader activePath="/" />

        <section className="relative flex min-h-[calc(100svh-64px)] items-center overflow-hidden">
          <div
            className="absolute inset-0 scale-[1.03] bg-cover bg-[center_right_28%]"
            style={{
              backgroundImage:
                "url('https://cropwatch.unl.edu/sites/unl.edu.ianr.extension.cropwatch/files/styles/16_9_2129x1198/public/media/image/drone-corn-field_0.jpg?itok=aKcB0MRf')",
            }}
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,17,11,0.86)_0%,rgba(7,17,11,0.58)_42%,rgba(7,17,11,0.1)_100%)] dark:bg-[linear-gradient(90deg,rgba(2,7,4,0.93)_0%,rgba(2,7,4,0.72)_45%,rgba(2,7,4,0.25)_100%)]" />
          <div className="absolute inset-x-0 top-0 h-20 bg-[linear-gradient(180deg,rgba(7,17,11,0.36),transparent)]" />

          <div className="relative z-10 mx-auto w-full max-w-[1280px] px-6 sm:px-9 lg:px-10">
            <div className="max-w-[620px] pt-8">
              <h1 className="font-display text-[34px] font-extrabold uppercase leading-[1.02] text-white [text-shadow:_0_4px_8px_rgba(0,0,0,0.7)] sm:text-[48px] md:text-[56px]">
                AGRITECH
                <br />
                OPTIMALISASI METADATA
                <br />
                PERTANIAN DI YOUTUBE
              </h1>
              <p className="mt-4 max-w-[600px] font-display text-[22px] font-bold leading-[1.28] text-white [text-shadow:_0_4px_8px_rgba(0,0,0,0.7)] sm:text-[28px]">
                Sistem cerdas untuk memantau tren informasi dan manajemen konten pertanian di YouTube.
              </p>
              <div className="mt-9 flex flex-wrap gap-4">
                <LoginModalButton className="inline-flex min-h-[58px] items-center gap-3 rounded-full bg-[#006947] px-10 font-display text-[20px] font-bold text-white transition hover:-translate-y-0.5 hover:shadow-xl">
                  Mulai
                  <ArrowRight className="h-5 w-5" />
                </LoginModalButton>
                <Link
                  href="/model"
                  className="inline-flex min-h-[58px] items-center rounded-full bg-[#eceef0] px-10 font-display text-[20px] font-bold text-[#191c1e] transition hover:-translate-y-0.5 hover:shadow-xl dark:bg-white/90"
                >
                  Informasi
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#f7f9fb] px-6 py-9 transition-colors dark:bg-[#07110b] sm:px-9 lg:px-10">
          <div className="mx-auto grid max-w-[1280px] gap-6 md:grid-cols-3">
            {featureCards.map((card) => {
              const Icon = card.icon;

              return (
                <article
                  key={card.title}
                  className="group min-h-[245px] rounded-lg border border-[#bdcac0] bg-white p-8 transition duration-300 hover:border-[#006947] hover:shadow-2xl dark:border-white/10 dark:bg-[#102016]"
                >
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-lg bg-[#d9e6da] text-[#006947] transition group-hover:bg-[#006947] group-hover:text-white dark:bg-white/10 dark:text-[#7bd99b]">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h2 className="font-display text-[24px] font-bold leading-tight text-[#191c1e] dark:text-white">{card.title}</h2>
                  <p className="mt-3 font-body text-[15px] leading-7 text-[#3e4942] dark:text-white/72">{card.body}</p>
                </article>
              );
            })}
          </div>
        </section>

        <PublicFooter />
    </main>
  );
}
