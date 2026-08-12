import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import NavbarWrapper from "@/components/NavbarWrapper";
import { readSiteContent } from "@/lib/site-content";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const siteContent = await readSiteContent();

  return {
    title: siteContent.seo.siteTitle,
    description: siteContent.seo.siteDescription,
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const siteContent = await readSiteContent();

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
          <p>© {new Date().getFullYear()} {siteContent.footer.copyrightName}. All rights reserved.</p>
        </footer>
      </body>
    </html>
  );
}
