"use client";
import React, { useEffect } from 'react';
import { useSidebar } from '@/context/SidebarContext';
import AppHeader from "@/layout/AppHeader";
import AppSidebar from "@/layout/AppSidebar";
import Backdrop from "@/layout/Backdrop";
import { canAccessRoute, useAuthUser } from "@/lib/auth";
import { usePathname, useRouter } from "next/navigation";

// Catatan: Karena ini file "use client", metadata tidak bisa diekspor di sini.
// Judul akan otomatis mengambil dari Root Layout di atas[cite: 1].

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuthUser();
  const isPublicLanding = pathname === "/";
  const isAllowed = Boolean(user && canAccessRoute(pathname, user.role));

  useEffect(() => {
    if (isPublicLanding) {
      return;
    }

    if (!user) {
      router.replace("/");
      return;
    }

    if (!canAccessRoute(pathname, user.role)) {
      router.replace("/");
    }
  }, [isPublicLanding, pathname, router, user]);
  
  const mainContentMargin = isMobileOpen
    ? "ml-0"
    : isExpanded || isHovered
    ? "lg:ml-[290px]"
    : "lg:ml-[90px]";

  if (isPublicLanding) {
    return <>{children}</>;
  }

  if (!isAllowed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f8f5] text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 dark:bg-[#07110b] dark:text-slate-500">
        Checking Access...
      </div>
    );
  }

  return (
    <div className="relative min-h-screen max-w-full overflow-x-hidden bg-[#f6f8f5] text-slate-900 dark:bg-[#07110b] dark:text-white/90 xl:flex">
      <AppSidebar />
      <Backdrop />
      <div className={`min-w-0 flex-1 transition-all duration-300 ease-in-out ${mainContentMargin}`}>
        <AppHeader />
        <main className="mx-auto w-full max-w-(--breakpoint-2xl) overflow-x-hidden p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
