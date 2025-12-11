"use client"

import { Noto_Sans_JP, Noto_Sans_Mono } from "next/font/google";
import "./globals.css";
import { FloatingHeader } from "@/components/floating-header";

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
});

const notoSansMono = Noto_Sans_Mono({
  variable: "--font-noto-sans-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${notoSansJP.variable} ${notoSansMono.variable} antialiased`}
      >
        <FloatingHeader/>
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}
