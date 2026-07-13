"use client";

import { useSyncExternalStore } from "react";

export type UserRole = "admin" | "user";

export interface AuthUser {
  name: string;
  email: string;
  role: UserRole;
}

export interface AuthAccount extends AuthUser {
  password: string;
}

const AUTH_STORAGE_KEY = "agritech_auth_user_v2";
const AUTH_USERS_STORAGE_KEY = "agritech_auth_users";
const AUTH_CHANGE_EVENT = "agritech-auth-change";

const seedUsers: AuthAccount[] = [
  {
    name: "Admin Agri-Tech",
    email: "admin@agritech.local",
    password: "admin123",
    role: "admin",
  },
  {
    name: "User Agri-Tech",
    email: "user@agritech.local",
    password: "user123",
    role: "user",
  },
];

export const publicAuthRoutes = ["/signin", "/signup"];

export const userAllowedRoutes = [
  "/dashboard",
  "/information",
  "/videos",
];

const adminOnlyRoutes = [
  "/keyword-scraping",
  "/web-scraping",
  "/data-processing",
  "/labeling",
  "/model-registry",
  "/inventory",
  "/settings",
  "/profile",
  "/alerts",
  "/avatars",
  "/badge",
  "/bar-chart",
  "/basic-tables",
  "/blank",
  "/buttons",
  "/calendar",
  "/error-404",
  "/form-elements",
  "/images",
  "/line-chart",
  "/modals",
  "/signup",
];

export function ensureAuthUsers(): AuthAccount[] {
  if (typeof window === "undefined") return seedUsers;

  const rawUsers = localStorage.getItem(AUTH_USERS_STORAGE_KEY);
  if (rawUsers) {
    try {
      const users = JSON.parse(rawUsers) as AuthAccount[];
      if (Array.isArray(users) && users.length > 0) return users;
    } catch {
      localStorage.removeItem(AUTH_USERS_STORAGE_KEY);
    }
  }

  localStorage.setItem(AUTH_USERS_STORAGE_KEY, JSON.stringify(seedUsers));
  return seedUsers;
}

export function getAuthUsers(): AuthAccount[] {
  return ensureAuthUsers();
}

export function login(email: string, password: string, remember = false): AuthUser | null {
  const normalizedEmail = email.trim().toLowerCase();
  const user = ensureAuthUsers().find(
    (item) => item.email === normalizedEmail && item.password === password
  );

  if (!user) return null;

  const authUser: AuthUser = {
    name: user.name,
    email: user.email,
    role: user.role,
  };

  const storage = remember ? localStorage : sessionStorage;
  localStorage.removeItem(AUTH_STORAGE_KEY);
  sessionStorage.removeItem(AUTH_STORAGE_KEY);
  storage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authUser));
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
  return authUser;
}

export function getCurrentUser(): AuthUser | null {
  if (typeof window === "undefined") return null;

  const rawUser =
    sessionStorage.getItem(AUTH_STORAGE_KEY) ||
    localStorage.getItem(AUTH_STORAGE_KEY);
  if (!rawUser) return null;

  try {
    return JSON.parse(rawUser) as AuthUser;
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

export function logout() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  sessionStorage.removeItem(AUTH_STORAGE_KEY);
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
}

export function canAccessRoute(pathname: string, role: UserRole) {
  if (role === "admin") return true;
  if (userAllowedRoutes.includes(pathname)) return true;
  if (adminOnlyRoutes.includes(pathname)) return false;

  return /^\/[a-z0-9-]+$/.test(pathname);
}

function subscribeAuth(callback: () => void) {
  window.addEventListener(AUTH_CHANGE_EVENT, callback);
  window.addEventListener("storage", callback);

  return () => {
    window.removeEventListener(AUTH_CHANGE_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function getAuthSnapshot() {
  return JSON.stringify(getCurrentUser());
}

export function useAuthUser(): AuthUser | null {
  const snapshot = useSyncExternalStore(subscribeAuth, getAuthSnapshot, () => "null");
  return JSON.parse(snapshot) as AuthUser | null;
}
