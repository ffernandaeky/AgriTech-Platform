import { ThemeProvider } from "@/context/ThemeContext";
import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#edf7ef] dark:bg-[#07110b]">
      <ThemeProvider>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(21,128,61,0.16),transparent_32%),radial-gradient(circle_at_80%_10%,rgba(132,204,22,0.14),transparent_30%),linear-gradient(135deg,rgba(255,255,255,0.74),rgba(236,253,245,0.5))] dark:bg-[radial-gradient(circle_at_20%_20%,rgba(34,197,94,0.14),transparent_32%),radial-gradient(circle_at_80%_10%,rgba(132,204,22,0.1),transparent_30%),linear-gradient(135deg,rgba(5,18,10,0.9),rgba(10,28,16,0.92))]" />
        <div className="relative z-10">{children}</div>
      </ThemeProvider>
    </div>
  );
}
