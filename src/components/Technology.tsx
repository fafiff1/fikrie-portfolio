"use client";

import { motion } from "framer-motion";
import { Beaker, Cloud, Code2, Database } from "lucide-react";
import type { SiteContent } from "@/lib/site-content-shared";

const groupIcons = [Beaker, Code2, Cloud, Database];

type TechnologyProps = {
  content: SiteContent["technology"];
};

export default function Technology({ content }: TechnologyProps) {
  return (
    <section id="technology" className="py-24 bg-surface relative">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold mb-6"
          >
            Technology
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
          {content.groups.map((group, index) => {
            const Icon = groupIcons[index] ?? Code2;
            return (
              <motion.div
                key={group.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-black border border-surface-border p-6 rounded-xl hover:border-primary transition-colors"
              >
                <div className="w-12 h-12 bg-surface rounded-lg flex items-center justify-center text-primary mb-4">
                  <Icon size={24} />
                </div>
                <h3 className="text-xl font-bold mb-4 text-white">{group.title}</h3>
                <ul className="space-y-2">
                  {group.items.map((item) => (
                    <li key={item} className="text-gray-400 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
