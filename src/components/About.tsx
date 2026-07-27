"use client";

import { motion } from "framer-motion";
import { Heart, Briefcase, Globe2, Award } from "lucide-react";

export default function About() {
  const stats = [
    { icon: <Globe2 size={24} />, title: "Roots", desc: "Jakarta, Indonesia" },
    { icon: <Heart size={24} />, title: "Family", desc: "Wife Mira, sons Rafael & Mikhail" },
    { icon: <Briefcase size={24} />, title: "Role", desc: "Quality Engineer" },
    { icon: <Award size={24} />, title: "Experience", desc: "20+ Years in Melbourne" },
  ];

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
            I&apos;m a dedicated Quality Engineer with a passion for delivering flawless software experiences. 
            My journey started in Jakarta, but for over two decades, Melbourne has been my home. 
            When I&apos;m not ensuring software quality, I&apos;m spending time with my beautiful wife Mira and our two boys, Rafael and Mikhail.
          </motion.p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-black border border-surface-border p-6 rounded-xl hover:border-primary transition-colors group"
            >
              <div className="w-12 h-12 bg-surface rounded-lg flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
                {stat.icon}
              </div>
              <h3 className="text-xl font-bold mb-2 text-white">{stat.title}</h3>
              <p className="text-gray-400">{stat.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
