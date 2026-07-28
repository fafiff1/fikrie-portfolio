"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import BlogSection from "@/components/BlogSection";
import LifestyleMediaGallery from "@/components/LifestyleMediaGallery";
import type { BlogPost, LifestyleCategory, MediaItem } from "@/lib/lifestyle-shared";
import { LIFESTYLE_META } from "@/lib/lifestyle-shared";

type LifestylePageContentProps = {
  category: LifestyleCategory;
  initialBlogs: BlogPost[];
  initialMedia: MediaItem[];
  isLoggedIn: boolean;
};

export default function LifestylePageContent({
  category,
  initialBlogs,
  initialMedia,
  isLoggedIn,
}: LifestylePageContentProps) {
  const meta = LIFESTYLE_META[category];
  const [blogs, setBlogs] = useState(initialBlogs);
  const [media, setMedia] = useState(initialMedia);
  const [activeSection, setActiveSection] = useState<"blog" | "media">("blog");

  return (
    <div className="min-h-screen pt-32 pb-24 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] -z-10" />

      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl mb-4"
          >
            {meta.emoji}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-bold mb-6"
          >
            {meta.title}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-400 leading-relaxed"
          >
            {meta.description}
          </motion.p>
        </div>

        <div className="flex justify-center mb-10">
          <div className="flex items-center gap-2 p-1 bg-surface border border-surface-border rounded-lg">
            {(["blog", "media"] as const).map((section) => (
              <button
                key={section}
                onClick={() => setActiveSection(section)}
                className={`px-6 py-2 text-sm font-medium rounded-md transition-colors capitalize ${
                  activeSection === section
                    ? "bg-primary text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {section === "blog" ? "Blog" : "Photos & Videos"}
              </button>
            ))}
          </div>
        </div>

        <motion.div
          key={activeSection}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface border border-surface-border rounded-2xl p-6 md:p-10"
        >
          {activeSection === "blog" ? (
            <BlogSection
              category={category}
              sectionTitle={meta.title}
              blogs={blogs}
              isLoggedIn={isLoggedIn}
              onBlogsChange={setBlogs}
            />
          ) : (
            <LifestyleMediaGallery
              category={category}
              sectionTitle={meta.title}
              media={media}
              isLoggedIn={isLoggedIn}
              onMediaChange={setMedia}
            />
          )}
        </motion.div>
      </div>
    </div>
  );
}
