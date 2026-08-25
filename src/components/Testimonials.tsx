"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Quote } from "lucide-react";
import {
  REVIEW_AUDIENCE_LABELS,
  REVIEW_AUDIENCES,
  type Review,
  type ReviewAudience,
} from "@/lib/reviews-shared";

type TestimonialsProps = {
  reviews: Review[];
};

function ReviewAvatar({ name, image }: { name: string; image: string }) {
  if (image) {
    return (
      <img
        src={image}
        alt={name}
        className="w-14 h-14 rounded-full object-cover border-2 border-surface-border group-hover:border-primary transition-colors"
      />
    );
  }

  const initials = name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="w-14 h-14 rounded-full border-2 border-surface-border bg-surface text-primary font-bold flex items-center justify-center group-hover:border-primary transition-colors">
      {initials || "?"}
    </div>
  );
}

export default function Testimonials({ reviews }: TestimonialsProps) {
  const [activeAudience, setActiveAudience] = useState<"all" | ReviewAudience>("all");

  const visibleReviews = useMemo(() => {
    if (activeAudience === "all") return reviews;
    return reviews.filter((review) => review.audience === activeAudience);
  }, [activeAudience, reviews]);

  return (
    <section id="reviews" className="py-24 bg-surface relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -z-10" />

      <div className="container mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold mb-4"
          >
            Testimonials
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-gray-400 text-lg"
          >
            Feedback from managers, tech leads, developers, project managers, and clients.
          </motion.p>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-12">
          <button
            type="button"
            onClick={() => setActiveAudience("all")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeAudience === "all"
                ? "bg-primary text-white"
                : "bg-black border border-surface-border text-gray-300 hover:border-primary"
            }`}
          >
            All
          </button>
          {REVIEW_AUDIENCES.map((audience) => (
            <button
              type="button"
              key={audience}
              onClick={() => setActiveAudience(audience)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeAudience === audience
                  ? "bg-primary text-white"
                  : "bg-black border border-surface-border text-gray-300 hover:border-primary"
              }`}
            >
              {REVIEW_AUDIENCE_LABELS[audience]}
            </button>
          ))}
        </div>

        {visibleReviews.length === 0 ? (
          <p className="text-center text-gray-500">No testimonials in this group yet.</p>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            {visibleReviews.map((review, index) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-black p-8 rounded-2xl border border-surface-border relative group hover:border-primary transition-colors"
              >
                <Quote
                  size={40}
                  className="text-primary/20 absolute top-6 right-6 group-hover:text-primary/40 transition-colors"
                />
                <span className="inline-block mb-4 text-xs font-medium uppercase tracking-wide text-primary">
                  {REVIEW_AUDIENCE_LABELS[review.audience]}
                </span>
                <div className="flex items-center gap-4 mb-6">
                  <ReviewAvatar name={review.name} image={review.image} />
                  <div>
                    <h3 className="text-white font-bold">{review.name}</h3>
                    <p className="text-sm text-gray-400">
                      {[review.role, review.company].filter(Boolean).join(" at ")}
                    </p>
                  </div>
                </div>
                <p className="text-gray-300 leading-relaxed italic">&quot;{review.content}&quot;</p>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
