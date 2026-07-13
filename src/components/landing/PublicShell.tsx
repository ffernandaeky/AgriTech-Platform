"use client";

import SignInForm from "@/components/auth/SignInForm";
import { useTheme } from "@/context/ThemeContext";
import { Globe2, Menu, Moon, Sprout, Sun, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export const publicNavItems = [
  { label: "BERANDA", href: "/" },
  { label: "INFORMASI", href: "/model" },
  { label: "ROLE", href: "/roles" },
];

export function BrandMark({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`flex items-center gap-4 ${className}`} aria-label="Agri-Tech Beranda">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/25 dark:bg-emerald-500 dark:shadow-emerald-500/20">
        <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7 text-white" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path fillRule="evenodd" clipRule="evenodd" d="M11.665 3.75618C11.8762 3.65061 12.1247 3.65061 12.3358 3.75618L18.7807 6.97853L12.3358 10.2009C12.1247 10.3064 11.8762 10.3064 11.665 10.2009L5.22014 6.97853L11.665 3.75618ZM4.29297 8.19199V16.0946C4.29297 16.3787 4.45347 16.6384 4.70757 16.7654L11.25 20.0365V11.6512C11.1631 11.6205 11.0777 11.5843 10.9942 11.5425L4.29297 8.19199ZM12.75 20.037L19.2933 16.7654C19.5474 16.6384 19.7079 16.3787 19.7079 16.0946V8.19199L13.0066 11.5425C12.9229 11.5844 12.8372 11.6208 12.75 11.6516V20.037ZM13.0066 2.41453C12.3732 2.09783 11.6277 2.09783 10.9942 2.41453L4.03676 5.89316C3.27449 6.27429 2.79297 7.05339 2.79297 7.90563V16.0946C2.79297 16.9468 3.27448 17.7259 4.03676 18.1071L10.9942 21.5857C11.6277 21.9024 12.3732 21.9024 13.0066 21.5857L19.9641 18.1071C20.7264 17.7259 21.2079 16.9468 21.2079 16.0946V7.90563C21.2079 7.05339 20.7264 6.27429 19.9641 5.89316L13.0066 2.41453Z" fill="currentColor" />
        </svg>
      </span>
      <span className="min-w-0">
        <span className="block font-display text-xl font-black leading-none tracking-tight text-slate-950 dark:text-white">
          Agri-Tech
        </span>
        <span className="mt-2 block font-mono text-[9px] font-black uppercase leading-tight tracking-[0.14em] text-slate-500 dark:text-slate-400">
          Agriculture Technology Dashboard
        </span>
      </span>
    </Link>
  );
}

function LoginLauncher({
  children,
  className,
  onClick,
}: {
  children: React.ReactNode;
  className: string;
  onClick?: () => void;
}) {
  return (
    <button type="button" onClick={onClick} className={className}>
      {children}
    </button>
  );
}

export function PublicHeader({ activePath = "/" }: { activePath?: string }) {
  const { theme, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-[#bdcac0]/40 bg-white shadow-sm transition-colors dark:border-white/10 dark:bg-[#07110b]">
      <nav className="relative mx-auto flex h-16 max-w-[1536px] items-center justify-between px-4 sm:px-6 lg:px-8">
        <BrandMark />

        <div className="absolute left-1/2 hidden -translate-x-1/2 items-center justify-center gap-10 md:flex">
          {publicNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`border-b-2 pb-1 font-mono text-[12px] font-semibold uppercase leading-none tracking-[0.1em] transition ${
                activePath === item.href
                  ? "border-[#006947] text-[#006947] dark:border-[#7bd99b] dark:text-[#7bd99b]"
                  : "border-transparent text-[#3e4942] hover:text-[#006947] dark:text-white/72 dark:hover:text-[#7bd99b]"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={`Ubah ke ${theme === "light" ? "dark" : "light"} theme`}
            className="hidden h-10 w-10 items-center justify-center rounded-full text-[#191c1e] transition hover:bg-[#f2f4f6] dark:text-white dark:hover:bg-white/10 md:flex"
          >
            {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </button>

          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((value) => !value)}
            className="flex h-10 w-10 items-center justify-center rounded-md border border-[#bdcac0]/60 text-[#191c1e] dark:border-white/15 dark:text-white md:hidden"
            aria-label="Buka menu navigasi"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {isMobileMenuOpen && (
        <div className="border-t border-[#bdcac0]/40 bg-white px-5 py-4 dark:border-white/10 dark:bg-[#07110b] md:hidden">
          <div className="flex flex-col gap-2">
            {publicNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`rounded px-3 py-3 font-mono text-[12px] font-semibold uppercase tracking-[0.1em] ${
                  activePath === item.href ? "bg-[#e9f5ee] text-[#006947] dark:bg-white/10 dark:text-[#7bd99b]" : "text-[#3e4942] dark:text-white/72"
                }`}
              >
                {item.label}
              </Link>
            ))}
            <button
              type="button"
              onClick={toggleTheme}
              className="mt-2 flex h-10 w-10 items-center justify-center rounded-full bg-[#f2f4f6] text-[#191c1e] dark:bg-white/10 dark:text-white"
              aria-label={`Ubah ke ${theme === "light" ? "dark" : "light"} theme`}
            >
              {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

export function PublicFooter() {
  return (
    <footer className="border-t border-[#bdcac0] bg-white transition-colors dark:border-white/10 dark:bg-[#07110b]">
      <div className="mx-auto flex max-w-[1280px] flex-col justify-between gap-8 px-5 py-10 sm:px-8 md:flex-row lg:px-10">
        <div className="max-w-sm">
          <BrandMark className="mb-4" />
          <p className="font-body text-[14px] leading-6 text-[#3e4942] dark:text-white/72">
            Pertanian presisi untuk masa depan berkelanjutan. Membantu pengelolaan informasi pertanian dengan wawasan berbasis data.
          </p>
          <div className="mt-5 flex gap-3">
            {[Globe2, Sprout].map((Icon, index) => (
              <span key={index} className="flex h-9 w-9 items-center justify-center rounded-full bg-[#eceef0] text-[#006947] dark:bg-white/10 dark:text-[#7bd99b]">
                <Icon className="h-4 w-4" />
              </span>
            ))}
          </div>
        </div>

        <div className="grid gap-8 sm:grid-cols-3">
          {[
            { title: "PLATFORM", links: publicNavItems.slice(1) },
            {
              title: "HUKUM",
              links: [
                { label: "Kebijakan Privasi", href: "/" },
                { label: "Ketentuan Layanan", href: "/" },
                { label: "Hubungi Kami", href: "/" },
              ],
            },
            {
              title: "DUKUNGAN",
              links: [
                { label: "Tanya Jawab", href: "/" },
                { label: "Panduan API", href: "/" },
                { label: "Publikasi Riset", href: "/" },
              ],
            },
          ].map((group) => (
            <div key={group.title} className="flex min-w-36 flex-col gap-3">
              <h3 className="mb-1 font-mono text-[12px] font-semibold uppercase leading-none tracking-[0.1em] text-[#006947] dark:text-[#7bd99b]">
                {group.title}
              </h3>
              {group.links.map((link) => (
                <Link key={`${group.title}-${link.label}`} href={link.href} className="font-body text-[14px] text-[#3e4942] transition hover:text-[#006947] hover:underline dark:text-white/72 dark:hover:text-[#7bd99b]">
                  {link.label}
                </Link>
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="mx-auto max-w-[1280px] border-t border-[#bdcac0]/30 px-5 py-5 font-mono text-[11px] font-semibold uppercase tracking-[0.1em] text-[#3e4942] dark:border-white/10 dark:text-white/60 sm:px-8 lg:px-10">
        (c) 2026 Sistem AgriTech. Seluruh hak cipta dilindungi.
      </div>
    </footer>
  );
}

export function PublicPageShell({
  activePath,
  children,
}: {
  activePath: string;
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-[#f7f9fb] text-[#191c1e] transition-colors dark:bg-[#07110b] dark:text-white">
      <PublicHeader activePath={activePath} />
      {children}
      <PublicFooter />
    </main>
  );
}

export function LoginModalButton({ children, className }: { children: React.ReactNode; className: string }) {
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  useEffect(() => {
    if (!isLoginOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsLoginOpen(false);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isLoginOpen]);

  return (
    <>
      <LoginLauncher className={className} onClick={() => setIsLoginOpen(true)}>
        {children}
      </LoginLauncher>
      {isLoginOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Login Agri-Tech"
          className="fixed inset-0 z-50 flex items-start justify-center bg-slate-950/60 px-4 pb-8 pt-24 backdrop-blur-sm md:items-center md:py-12"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setIsLoginOpen(false);
          }}
        >
          <SignInForm compact onClose={() => setIsLoginOpen(false)} />
        </div>
      )}
    </>
  );
}
