"use client";

import { motion } from "framer-motion";
import { ArrowRight, MapPin } from "lucide-react";
import Link from "next/link";
import type { SiteContent } from "@/lib/site-content-shared";

type HeroProps = {
  content: SiteContent["hero"];
};

export default function Hero({ content }: HeroProps) {
  return (
    <section className="min-h-screen flex items-center justify-center pt-20 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px] -z-10" />

      <div className="container mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface border border-surface-border mb-6">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            <span className="text-xs font-medium text-gray-300">{content.roleBadge}</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6">
            Hi, I&apos;m <span className="text-primary">{content.name}</span>
            <br />
            {content.headline}
          </h1>

          <p className="text-lg text-gray-400 mb-8 max-w-lg leading-relaxed">{content.bio}</p>

          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/portfolio"
              className="px-8 py-3 bg-primary text-white font-medium rounded hover:bg-primary-hover transition-colors flex items-center gap-2 group"
            >
              View My Work
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/contact"
              className="px-8 py-3 bg-transparent border border-surface-border text-white font-medium rounded hover:bg-surface transition-colors"
            >
              Contact Me
            </Link>
          </div>

          <div className="mt-12 flex items-center gap-4 text-sm text-gray-500">
            <MapPin size={16} className="text-primary" />
            <span>{content.location}</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative"
        >
          <div className="aspect-[4/5] md:aspect-square bg-surface border border-surface-border rounded-2xl overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />
            <img
              src={content.profileImage}
              alt={content.name}
              className="w-full h-full object-cover transition-all duration-500"
            />

            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="absolute bottom-6 left-6 bg-black/80 backdrop-blur-md border border-surface-border p-4 rounded-xl z-20"
            >
              <p className="text-2xl font-bold text-white">{content.badgeValue}</p>
              <p className="text-xs text-gray-400">{content.badgeLabel}</p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
