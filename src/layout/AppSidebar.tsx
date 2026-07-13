"use client";
import React, { useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "../context/SidebarContext";
import { useAuthUser } from "@/lib/auth";
import {
  ChevronDownIcon,
  GridIcon,
  PageIcon,
  SearchIcon,
  GlobeIcon,
  TableIcon,
  CpuIcon,
  VideoIcon,
  PencilIcon,
} from "../icons/index";

interface NavSubItem {
  name: string;
  path: string;
}

interface NavItem {
  name: string;
  icon: React.ReactNode;
  path: string;
  subItems?: NavSubItem[];
}

interface NavGroup {
  title: string;
  roles: string[];
  items: NavItem[];
}

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const pathname = usePathname();
  const [openSubmenu, setOpenSubmenu] = React.useState<string | null>(null);
  const user = useAuthUser();
  const role = user?.role || "user";

  const isActive = useCallback((path: string) => path === pathname, [pathname]);

  const navGroups: NavGroup[] = [
    {
      title: "Menu Utama",
      roles: ["admin", "user"],
      items: [
        { name: "Dashboard", icon: <GridIcon className="size-5" />, path: "/dashboard" },
        { name: "Daftar Video", icon: <VideoIcon className="size-5" />, path: "/videos" },
      ],
    },
    {
      title: "Scraping & Data",
      roles: ["admin"],
      items: [
        { name: "Keyword Pencarian Video", icon: <SearchIcon className="size-5" />, path: "/keyword-scraping" },
        { name: "Web Scraping", icon: <GlobeIcon className="size-5" />, path: "/web-scraping" },
        { name: "Pemrosesan NLP", icon: <TableIcon className="size-5" />, path: "/data-processing" },
        { name: "Pelabelan", icon: <PencilIcon className="size-5" />, path: "/labeling" },
      ],
    },
    {
      title: "Teknis & Stok",
      roles: ["admin"],
      items: [
        { name: "Model AI", icon: <CpuIcon className="size-5" />, path: "/model-registry" },
      ],
    },
    {
      title: "Lainnya",
      roles: ["admin", "user"],
      items: [
        { name: "Informasi", icon: <PageIcon className="size-5" />, path: "/information" },
      ],
    },
  ];

  const expanded = isExpanded || isHovered || isMobileOpen;

  return (
    <aside
      className={`fixed top-0 left-0 h-screen flex flex-col transition-all duration-300 ease-in-out z-[60] 
        ${expanded ? "w-[290px]" : "w-[95px]"}
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0
        border-r border-emerald-900/10 bg-white/95 shadow-xl shadow-emerald-950/[0.04] backdrop-blur-xl dark:border-white/[0.07] dark:bg-[#07110b] dark:shadow-none
      `}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex h-20 shrink-0 items-center border-b border-emerald-900/10 px-6 dark:border-white/[0.07]">
        <Link href="/dashboard" className="flex items-center gap-4 w-full group">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/25 transition-transform duration-300 group-hover:rotate-3 group-hover:scale-105 dark:bg-emerald-500 dark:shadow-emerald-500/20">
            <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7 text-white" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M11.665 3.75618C11.8762 3.65061 12.1247 3.65061 12.3358 3.75618L18.7807 6.97853L12.3358 10.2009C12.1247 10.3064 11.8762 10.3064 11.665 10.2009L5.22014 6.97853L11.665 3.75618ZM4.29297 8.19199V16.0946C4.29297 16.3787 4.45347 16.6384 4.70757 16.7654L11.25 20.0365V11.6512C11.1631 11.6205 11.0777 11.5843 10.9942 11.5425L4.29297 8.19199ZM12.75 20.037L19.2933 16.7654C19.5474 16.6384 19.7079 16.3787 19.7079 16.0946V8.19199L13.0066 11.5425C12.9229 11.5844 12.8372 11.6208 12.75 11.6516V20.037ZM13.0066 2.41453C12.3732 2.09783 11.6277 2.09783 10.9942 2.41453L4.03676 5.89316C3.27449 6.27429 2.79297 7.05339 2.79297 7.90563V16.0946C2.79297 16.9468 3.27448 17.7259 4.03676 18.1071L10.9942 21.5857L11.3296 20.9149L10.9942 21.5857C11.6277 21.9024 12.3732 21.9024 13.0066 21.5857L19.9641 18.1071C20.7264 17.7259 21.2079 16.9468 21.2079 16.0946V7.90563C21.2079 7.05339 20.7264 6.27429 19.9641 5.89316L13.0066 2.41453Z" fill="currentColor"/>
            </svg>
          </div>
          {expanded && (
            <div className="flex flex-col min-w-0 animate-in fade-in slide-in-from-left-2 duration-500">
              <h1 className="text-xl font-black tracking-tight text-slate-950 dark:text-white leading-none">Agri-Tech</h1>
              <p className="mt-2 text-[9px] font-black uppercase leading-tight tracking-[0.14em] text-slate-500 dark:text-slate-400">Agriculture Technology Dashboard</p>
            </div>
          )}
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto px-4 space-y-8 no-scrollbar pt-6 pb-10 custom-scrollbar">
        {navGroups
          .filter((group) => group.roles.includes(role))
          .map((group, gIdx) => (
          <div key={gIdx} className="space-y-3">
            <h2 className={`px-4 text-[10px] font-black uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500 ${!expanded ? "hidden" : "block"}`}>
              {group.title}
            </h2>
            <ul className="space-y-1.5">
              {group.items.map((nav, iIdx) => {
                const itemKey = `${gIdx}-${iIdx}`;
                const isItemActive = isActive(nav.path);
                const isSubmenuOpen = openSubmenu === itemKey;
                return (
                  <li key={nav.name}>
                    {nav.subItems ? (
                      <div className="flex flex-col">
                        <button
                          onClick={() => setOpenSubmenu(isSubmenuOpen ? null : itemKey)}
                          className={`flex w-full items-center px-4 py-3.5 rounded-xl transition-all duration-300 group
                            ${isSubmenuOpen ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300" : "text-slate-500 hover:bg-slate-50 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-white/[0.04] dark:hover:text-white"}`}
                        >
                          <span className={`flex size-5 shrink-0 items-center justify-center ${isSubmenuOpen ? "text-emerald-600 dark:text-emerald-300" : "group-hover:scale-110"}`}>{nav.icon}</span>
                          {expanded && (
                            <>
                              <span className="ml-3 text-sm font-bold tracking-tight">{nav.name}</span>
                              <ChevronDownIcon className={`ml-auto size-4 transition-transform duration-500 ${isSubmenuOpen ? "rotate-180" : ""}`} />
                            </>
                          )}
                        </button>
                        {isSubmenuOpen && expanded && (
                          <ul className="mt-2 ml-6 border-l-2 border-emerald-100 dark:border-white/[0.07] space-y-1 animate-in slide-in-from-top-2 duration-300">
                            {nav.subItems.map((sub) => (
                              <li key={sub.path}>
                                <Link href={sub.path} className={`text-[12px] block py-2.5 pl-6 transition-all relative ${isActive(sub.path) ? "text-emerald-700 dark:text-emerald-300 font-black" : "text-slate-500 dark:text-slate-500 hover:text-slate-950 dark:hover:text-white font-bold"}`}>
                                  {sub.name}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ) : (
                      <Link href={nav.path} className={`group relative flex items-center rounded-xl px-4 py-3.5 transition-all duration-300 ${isItemActive ? "bg-emerald-600 text-white font-black shadow-lg shadow-emerald-600/20 dark:bg-emerald-500/15 dark:text-emerald-200 dark:shadow-none" : "font-bold text-slate-500 hover:translate-x-1 hover:bg-slate-50 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-white/[0.04] dark:hover:text-white"}`}>
                        <span className={`flex size-5 shrink-0 items-center justify-center ${isItemActive ? "text-white dark:text-emerald-200" : "group-hover:scale-110"}`}>{nav.icon}</span>
                        {expanded && <span className="ml-3 text-sm tracking-tight">{nav.name}</span>}
                        {isItemActive && <div className="absolute left-0 h-6 w-1 rounded-r-full bg-white/80 dark:bg-emerald-300" />}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </aside>
  );
};

export default AppSidebar;
