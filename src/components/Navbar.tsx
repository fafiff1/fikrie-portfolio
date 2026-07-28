"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Menu, X, LogOut, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { logoutAction } from "@/app/login/actions";

type NavChild = {
  name: string;
  href: string;
};

type NavLink = {
  name: string;
  href: string;
  children?: NavChild[];
};

const navLinks: NavLink[] = [
  { name: "Home", href: "/" },
  {
    name: "About",
    href: "/about",
    children: [
      { name: "Hobbies", href: "/about/hobbies" },
      { name: "Sports", href: "/about/sports" },
      { name: "Travel", href: "/about/travel" },
    ],
  },
  { name: "Family", href: "/family" },
  { name: "Portfolio", href: "/portfolio" },
  { name: "Reviews", href: "/reviews" },
  { name: "Contact", href: "/contact" },
];

function isActivePath(pathname: string, href: string): boolean {
  if (href === "/") {
    return pathname === "/";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

function isAboutSectionActive(pathname: string, link: NavLink): boolean {
  if (!link.children) {
    return isActivePath(pathname, link.href);
  }
  return isActivePath(pathname, link.href);
}

type NavbarProps = {
  isLoggedIn: boolean;
};

export default function Navbar({ isLoggedIn }: NavbarProps) {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileAboutOpen, setMobileAboutOpen] = useState(false);

  const linkClassName = (href: string, mobile = false) => {
    const active = isActivePath(pathname, href);
    const base = mobile
      ? "text-lg font-medium transition-colors"
      : "text-sm font-medium transition-colors relative py-1";

    if (active) {
      return `${base} text-primary${mobile ? "" : " after:absolute after:left-0 after:right-0 after:-bottom-1 after:h-0.5 after:bg-primary after:rounded-full"}`;
    }

    return `${base} text-gray-300 hover:text-primary`;
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setMobileAboutOpen(false);
  }, [pathname]);

  const renderDesktopLink = (link: NavLink) => {
    if (!link.children) {
      return (
        <Link
          key={link.name}
          href={link.href}
          className={linkClassName(link.href)}
          aria-current={isActivePath(pathname, link.href) ? "page" : undefined}
        >
          {link.name}
        </Link>
      );
    }

    const aboutActive = isAboutSectionActive(pathname, link);

    return (
      <div key={link.name} className="relative group">
        <Link
          href={link.href}
          className={`${linkClassName(link.href)} flex items-center gap-1`}
          aria-current={aboutActive ? "page" : undefined}
        >
          {link.name}
          <ChevronDown
            size={14}
            className="transition-transform group-hover:rotate-180"
          />
        </Link>

        <div className="absolute top-full left-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none group-hover:pointer-events-auto">
          <div className="bg-surface border border-surface-border rounded-lg py-2 min-w-[160px] shadow-xl">
            {link.children.map((child) => (
              <Link
                key={child.name}
                href={child.href}
                className={`block px-4 py-2.5 text-sm transition-colors ${
                  isActivePath(pathname, child.href)
                    ? "text-primary bg-primary/10"
                    : "text-gray-300 hover:text-white hover:bg-black/50"
                }`}
                aria-current={isActivePath(pathname, child.href) ? "page" : undefined}
              >
                {child.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderMobileLink = (link: NavLink) => {
    if (!link.children) {
      return (
        <Link
          key={link.name}
          href={link.href}
          onClick={() => setMobileMenuOpen(false)}
          className={linkClassName(link.href, true)}
          aria-current={isActivePath(pathname, link.href) ? "page" : undefined}
        >
          {link.name}
        </Link>
      );
    }

    return (
      <div key={link.name} className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <Link
            href={link.href}
            onClick={() => setMobileMenuOpen(false)}
            className={linkClassName(link.href, true)}
            aria-current={isAboutSectionActive(pathname, link) ? "page" : undefined}
          >
            {link.name}
          </Link>
          <button
            type="button"
            onClick={() => setMobileAboutOpen(!mobileAboutOpen)}
            className="p-2 text-gray-400 hover:text-primary transition-colors"
            aria-expanded={mobileAboutOpen}
            aria-label="Toggle About submenu"
          >
            <ChevronDown
              size={18}
              className={`transition-transform ${mobileAboutOpen ? "rotate-180" : ""}`}
            />
          </button>
        </div>

        <AnimatePresence>
          {mobileAboutOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex flex-col gap-2 pl-4 border-l border-surface-border overflow-hidden"
            >
              {link.children.map((child) => (
                <Link
                  key={child.name}
                  href={child.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`text-base font-medium transition-colors ${
                    isActivePath(pathname, child.href)
                      ? "text-primary"
                      : "text-gray-400 hover:text-primary"
                  }`}
                  aria-current={isActivePath(pathname, child.href) ? "page" : undefined}
                >
                  {child.name}
                </Link>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-black/90 backdrop-blur-md py-4 border-b border-surface-border"
          : "bg-transparent py-6"
      }`}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-white tracking-tighter">
          Fahreza<span className="text-primary">.</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {isLoggedIn && navLinks.map(renderDesktopLink)}
          {isLoggedIn ? (
            <form action={logoutAction}>
              <button
                type="submit"
                className="px-5 py-2 border border-surface-border text-gray-300 text-sm font-medium rounded hover:border-primary hover:text-white transition-colors flex items-center gap-2"
              >
                Logout
                <LogOut size={16} />
              </button>
            </form>
          ) : (
            <Link
              href="/login"
              className={`px-5 py-2 text-sm font-medium rounded transition-colors ${
                pathname === "/login"
                  ? "bg-primary-hover text-white ring-2 ring-primary"
                  : "bg-primary text-white hover:bg-primary-hover"
              }`}
            >
              Login
            </Link>
          )}
        </nav>

        <button
          className="md:hidden text-white"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 w-full bg-surface border-b border-surface-border py-4 px-6 md:hidden flex flex-col gap-4"
          >
            {isLoggedIn && navLinks.map(renderMobileLink)}
            {isLoggedIn ? (
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="text-lg font-medium text-gray-300 hover:text-primary transition-colors"
                >
                  Logout
                </button>
              </form>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-lg font-medium text-primary"
              >
                Login
              </Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
