import { PublicPageShell } from "@/components/landing/PublicShell";
import { CheckCircle2, LockKeyhole, ShieldCheck, UserRound } from "lucide-react";

const roleCards = [
  {
    title: "ADMIN",
    subtitle: "Full Access",
    body: "Role pengelola sistem yang bertanggung jawab terhadap pengambilan data, pemrosesan, evaluasi model, dan pengaturan konten.",
    icon: ShieldCheck,
    features: ["Scraping", "Processing", "Modeling", "Melihat Informasi & Konten"],
  },
  {
    title: "USER",
    subtitle: "Limited Access",
    body: "Role pembaca yang berfokus pada akses informasi dan konten pertanian yang sudah diproses.",
    icon: UserRound,
    features: ["Melihat Informasi", "Melihat Konten"],
  },
];

export default function RolesPage() {
  return (
    <PublicPageShell activePath="/roles">
      <section className="bg-[#f7f9fb] px-5 py-14 transition-colors dark:bg-[#07110b] sm:px-8 lg:px-10">
        <div className="mx-auto max-w-[1280px]">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="font-display text-[36px] font-extrabold leading-tight text-[#191c1e] dark:text-white sm:text-[52px]">
              Panduan Role dan Hak Akses Pengguna Agri-Tech
            </h1>
            <p className="mx-auto mt-5 max-w-3xl font-body text-[17px] leading-8 text-[#3e4942] dark:text-white/72">
              Sistem membagi akses berdasarkan kebutuhan. Admin mengelola data dan model, sedangkan User membaca
              informasi hasil analisis dan menelusuri konten pertanian.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {roleCards.map((role) => {
              const Icon = role.icon;
              return (
                <article key={role.title} className="rounded-lg border border-[#bdcac0]/80 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:border-[#006947] hover:shadow-xl dark:border-white/10 dark:bg-[#102016] dark:hover:border-[#7bd99b]/70 sm:p-8">
                  <div className="flex items-start justify-between gap-5">
                    <span className="flex h-16 w-16 items-center justify-center rounded-lg bg-[#d9e6da] text-[#006947] dark:bg-white/10 dark:text-[#7bd99b]">
                      <Icon className="h-7 w-7" />
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-full bg-[#eceef0] px-3 py-2 font-mono text-[11px] font-semibold uppercase tracking-[0.1em] text-[#3e4942] dark:bg-white/10 dark:text-white/80">
                      <LockKeyhole className="h-4 w-4" />
                      {role.subtitle}
                    </span>
                  </div>
                  <h2 className="mt-7 font-display text-[32px] font-extrabold text-[#191c1e] dark:text-white">{role.title}</h2>
                  <p className="mt-4 font-body text-[15px] leading-7 text-[#3e4942] dark:text-white/72">{role.body}</p>

                  <div className="mt-7 space-y-3">
                    {role.features.map((feature) => (
                      <div key={feature} className="flex items-center gap-3 rounded-lg border border-[#bdcac0]/70 bg-[#f7f9fb] px-4 py-3 dark:border-white/10 dark:bg-white/[0.04]">
                        <CheckCircle2 className="h-5 w-5 text-[#006947] dark:text-[#7bd99b]" />
                        <span className="font-display text-[16px] font-bold text-[#191c1e] dark:text-white">{feature}</span>
                      </div>
                    ))}
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </PublicPageShell>
  );
}
