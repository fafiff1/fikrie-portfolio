"use client";

import { motion } from "framer-motion";
import { Quote } from "lucide-react";
import type { Review } from "@/lib/reviews-shared";

type TestimonialsProps = {
  reviews: Review[];
};

export default function Testimonials({ reviews }: TestimonialsProps) {
  return (
    <section id="reviews" className="py-24 bg-surface relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -z-10" />

      <div className="container mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold mb-4"
          >
            Client <span className="text-primary">Reviews</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-gray-400 text-lg"
          >
            What people say about my work and dedication to quality.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {reviews.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-black p-8 rounded-2xl border border-surface-border relative group hover:border-primary transition-colors"
            >
              <Quote size={40} className="text-primary/20 absolute top-6 right-6 group-hover:text-primary/40 transition-colors" />

              <div className="flex items-center gap-4 mb-6">
                <img
                  src={review.image}
                  alt={review.name}
                  className="w-14 h-14 rounded-full object-cover border-2 border-surface-border group-hover:border-primary transition-colors"
                />
                <div>
                  <h4 className="text-white font-bold">{review.name}</h4>
                  <p className="text-sm text-gray-400">{review.role} at {review.company}</p>
                </div>
              </div>

              <p className="text-gray-300 leading-relaxed italic">&quot;{review.content}&quot;</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
