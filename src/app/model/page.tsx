import { PublicPageShell } from "@/components/landing/PublicShell";

export default function ModelPage() {
  return (
    <PublicPageShell activePath="/model">
      <section className="bg-[#f7f9fb] px-5 py-16 transition-colors dark:bg-[#07110b] sm:px-8 lg:px-10">
        <div className="mx-auto max-w-[1180px]">
          <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-stretch">
            <div className="relative min-h-[460px] overflow-hidden rounded-lg border border-[#bdcac0] bg-[#173c27] shadow-xl shadow-emerald-950/10 dark:border-white/10">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage:
                    "url('https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=1400&q=85')",
                }}
              />
            </div>

            <div className="flex min-h-[460px] flex-col justify-center">
              <h1 className="font-display text-[34px] font-extrabold leading-tight text-[#191c1e] dark:text-white sm:text-[48px]">
                Tentang Agri-Tech
              </h1>
              <p className="mt-6 max-w-[680px] font-body text-[18px] leading-8 text-[#3e4942] dark:text-white/72">
                Agri-Tech merupakan Agriculture Technology Dashboard yang membantu menyajikan informasi pertanian digital
                secara lebih ringkas, terstruktur, dan mudah dipahami. Platform ini dirancang untuk mendukung pengguna dalam
                menelusuri konten pertanian, membaca ringkasan informasi, serta memahami data melalui tampilan dashboard yang
                sederhana, visual, dan nyaman diakses.
              </p>
            </div>
          </div>
        </div>
      </section>
    </PublicPageShell>
  );
}
