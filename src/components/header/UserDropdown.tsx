"use client";
import { logout, useAuthUser } from "@/lib/auth";
import { UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";

export default function UserDropdown() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const user = useAuthUser();

  function toggleDropdown(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    e.stopPropagation();
    setIsOpen((prev) => !prev);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  function handleLogout() {
    logout();
    router.replace("/");
  }

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="flex items-center text-gray-700 dark:text-gray-400 dropdown-toggle"
      >
        <span className="mr-3 flex h-11 w-11 items-center justify-center rounded-full border border-brand-500 bg-emerald-50 text-brand-500 shadow-sm dark:bg-emerald-500/10 dark:text-emerald-300">
          <UserRound className="h-6 w-6" aria-hidden="true" />
        </span>
        <span className="block mr-1 font-bold text-theme-sm uppercase tracking-tighter">{user?.name || "Agri-Tech User"}</span>
        <svg
          className={`stroke-gray-500 dark:stroke-gray-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          width="18"
          height="20"
          viewBox="0 0 18 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4.3125 8.65625L9 13.3437L13.6875 8.65625"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute right-0 mt-[17px] flex w-[260px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark"
      >
        <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-800 mb-2">
          <span className="block font-bold text-gray-800 text-theme-sm dark:text-white uppercase">
            {user?.name || "Agri-Tech User"}
          </span>
          <span className="mt-0.5 block text-[10px] text-brand-500 font-bold italic">
            {user?.email || "user@agritech.local"} - {user?.role || "user"}
          </span>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 mt-2 font-bold text-error-500 rounded-lg group text-theme-sm hover:bg-error-50 dark:hover:bg-error-500/10"
        >
          Sign out
        </button>
      </Dropdown>
    </div>
  );
}
