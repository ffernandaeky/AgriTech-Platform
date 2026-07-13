import { Hanken_Grotesk, Inter, JetBrains_Mono, Outfit } from 'next/font/google';
import React from 'react';
import './globals.css'; 
import "flatpickr/dist/flatpickr.css";
import { ThemeProvider } from '@/context/ThemeContext';
import { SidebarProvider } from '@/context/SidebarContext';
import { Metadata } from 'next';

const outfit = Outfit({
  subsets: ["latin"],
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-inter",
});

const hankenGrotesk = Hanken_Grotesk({
  subsets: ["latin"],
  weight: ["700", "800"],
  variable: "--font-hanken-grotesk",
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["600"],
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  title: "Agri-Tech - Agriculture Technology Dashboard",
  description: "Agriculture Technology Dashboard untuk klasifikasi konten pertanian YouTube menggunakan NLP IndoBERT",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`${outfit.className} ${inter.variable} ${hankenGrotesk.variable} ${jetBrainsMono.variable} bg-[#f6f8f5] text-slate-900 antialiased dark:bg-[#07110b] dark:text-white/90`}>
        <ThemeProvider>
          <SidebarProvider>
            {children}
          </SidebarProvider>
        </ThemeProvider>
        <div id="modal-root"></div>
      </body>
    </html>
  );
}
