"use client";

import { motion } from "framer-motion";
import { Heart, Briefcase, Globe2, Award } from "lucide-react";
import type { SiteContent } from "@/lib/site-content-shared";

const statIcons = [Globe2, Heart, Briefcase, Award];

type AboutProps = {
  content: SiteContent["about"];
};

export default function About({ content }: AboutProps) {
  return (
    <section id="about" className="py-24 bg-surface relative">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold mb-6"
          >
            About <span className="text-primary">Me</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-gray-400 text-lg leading-relaxed"
          >
            {content.intro}
          </motion.p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {content.stats.map((stat, index) => {
            const Icon = statIcons[index] ?? Award;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-black border border-surface-border p-6 rounded-xl hover:border-primary transition-colors group"
              >
                <div className="w-12 h-12 bg-surface rounded-lg flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
                  <Icon size={24} />
                </div>
                <h3 className="text-xl font-bold mb-2 text-white">{stat.title}</h3>
                <p className="text-gray-400">{stat.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
