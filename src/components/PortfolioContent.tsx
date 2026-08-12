"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { PortfolioSection } from "@/lib/portfolio-shared";
import PortfolioSectionCard from "@/components/PortfolioSectionCard";

type PortfolioContentProps = {
  initialSections: PortfolioSection[];
  isLoggedIn: boolean;
};

export default function PortfolioContent({
  initialSections,
  isLoggedIn,
}: PortfolioContentProps) {
  const [sections, setSections] = useState(initialSections);

  const updateSection = (updated: PortfolioSection) => {
    setSections((prev) => prev.map((section) => (section.id === updated.id ? updated : section)));
  };

  return (
    <section id="portfolio" className="py-24">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold mb-4"
          >
            Professional <span className="text-primary">Experience</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-gray-400 text-lg leading-relaxed"
          >
            A career journey in quality engineering — from foundational testing to senior
            leadership across enterprise, healthcare, finance, and retail.
          </motion.p>
        </div>

        <div className="max-w-5xl mx-auto space-y-10">
          {sections.map((section, index) => (
            <PortfolioSectionCard
              key={section.id}
              section={section}
              index={index}
              isLoggedIn={isLoggedIn}
              onSectionChange={updateSection}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
