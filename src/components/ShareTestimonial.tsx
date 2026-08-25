"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import {
  REVIEW_AUDIENCE_LABELS,
  REVIEW_AUDIENCES,
  type Review,
  type ReviewAudience,
} from "@/lib/reviews-shared";

type ShareTestimonialProps = {
  onPublished: (reviews: Review[]) => void;
};

type SubmitStatus = "idle" | "loading" | "success" | "error";

const emptyForm = {
  name: "",
  role: "",
  company: "",
  audience: "" as "" | ReviewAudience,
  content: "",
  website: "",
};

export default function ShareTestimonial({ onPublished }: ShareTestimonialProps) {
  const [form, setForm] = useState(emptyForm);
  const [photo, setPhoto] = useState<File | null>(null);
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("role", form.role);
    formData.append("company", form.company);
    formData.append("audience", form.audience);
    formData.append("content", form.content);
    formData.append("website", form.website);
    if (photo) formData.append("image", photo);

    try {
      const response = await fetch("/api/settings/reviews", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not publish testimonial.");

      onPublished(data.reviews);
      setForm(emptyForm);
      setPhoto(null);
      setStatus("success");
    } catch (error) {
      setStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "Could not publish testimonial.");
    }
  };

  return (
    <section id="share-testimonial" className="py-24 bg-black border-t border-surface-border">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold mb-4"
          >
            Share a <span className="text-primary">testimonial</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-gray-400 text-lg"
          >
            One form for managers, tech leads, developers, project managers, and clients.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto bg-surface border border-surface-border rounded-2xl p-6 md:p-8"
        >
          {status === "success" && (
            <p className="text-green-400 mb-6">Thank you — your testimonial is now on the page.</p>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              name="website"
              value={form.website}
              onChange={(event) => setForm((prev) => ({ ...prev, website: event.target.value }))}
              className="hidden"
              tabIndex={-1}
              autoComplete="off"
            />
            <div className="grid md:grid-cols-2 gap-4">
              <label className="block">
                <span className="block text-sm font-medium text-gray-400 mb-2">Name</span>
                <input
                  required
                  value={form.name}
                  onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                  className="w-full bg-black border border-surface-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary"
                />
              </label>
              <label className="block">
                <span className="block text-sm font-medium text-gray-400 mb-2">I am a</span>
                <select
                  required
                  value={form.audience}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, audience: event.target.value as ReviewAudience }))
                  }
                  className="w-full bg-black border border-surface-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary"
                >
                  <option value="">Select audience</option>
                  {REVIEW_AUDIENCES.map((audience) => (
                    <option key={audience} value={audience}>
                      {REVIEW_AUDIENCE_LABELS[audience]}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="block text-sm font-medium text-gray-400 mb-2">Role (optional)</span>
                <input
                  value={form.role}
                  onChange={(event) => setForm((prev) => ({ ...prev, role: event.target.value }))}
                  className="w-full bg-black border border-surface-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary"
                />
              </label>
              <label className="block">
                <span className="block text-sm font-medium text-gray-400 mb-2">Company (optional)</span>
                <input
                  value={form.company}
                  onChange={(event) => setForm((prev) => ({ ...prev, company: event.target.value }))}
                  className="w-full bg-black border border-surface-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary"
                />
              </label>
            </div>
            <label className="block">
              <span className="block text-sm font-medium text-gray-400 mb-2">Testimonial</span>
              <textarea
                required
                minLength={10}
                rows={5}
                value={form.content}
                onChange={(event) => setForm((prev) => ({ ...prev, content: event.target.value }))}
                className="w-full bg-black border border-surface-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary resize-none"
              />
            </label>
            <label className="block">
              <span className="block text-sm font-medium text-gray-400 mb-2">Photo (optional)</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={(event) => setPhoto(event.target.files?.[0] || null)}
                className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary file:text-white file:cursor-pointer"
              />
            </label>
            {status === "error" && <p className="text-sm text-red-400">{errorMessage}</p>}
            <button
              type="submit"
              disabled={status === "loading"}
              className="px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-60 flex items-center gap-2"
            >
              {status === "loading" && <Loader2 size={16} className="animate-spin" />}
              Post testimonial
            </button>
          </form>
        </motion.div>
      </div>
    </section>
  );
}
