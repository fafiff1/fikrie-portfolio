import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import NavbarWrapper from "@/components/NavbarWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Fahreza | Quality Engineer Portfolio",
  description: "Modern portfolio of Fahreza, a Quality Engineer based in Melbourne.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-black text-white selection:bg-primary selection:text-white">
        <NavbarWrapper />
        <div className="flex-grow">
          {children}
        </div>
        <footer className="border-t border-surface-border py-8 text-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} Fahreza. All rights reserved.</p>
        </footer>
      </body>
    </html>
  );
}
