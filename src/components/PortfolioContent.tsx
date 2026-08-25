"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Plus } from "lucide-react";
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
  const [showForm, setShowForm] = useState(false);
  const [period, setPeriod] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateSection = (updated: PortfolioSection) => {
    setSections((prev) => prev.map((section) => (section.id === updated.id ? updated : section)));
  };

  const resetForm = () => {
    setPeriod("");
    setCompany("");
    setRole("");
    setDescription("");
    setError(null);
  };

  const closeForm = () => {
    resetForm();
    setShowForm(false);
  };

  const openCreateForm = () => {
    if (showForm) {
      closeForm();
      return;
    }
    resetForm();
    setShowForm(true);
  };

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ period, company, role, description }),
      });

      const data = (await response.json()) as { sections?: PortfolioSection[]; error?: string };
      if (!response.ok) {
        throw new Error(data.error || "Failed to add section.");
      }

      setSections(data.sections ?? []);
      closeForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add section.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSection = (sectionId: string) => {
    setSections((prev) => prev.filter((section) => section.id !== sectionId));
  };

  return (
    <section id="portfolio" className="py-24">
      <div className="container mx-auto px-6">
        <div className="max-w-5xl mx-auto mb-16">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="max-w-3xl">
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

            {isLoggedIn && (
              <button
                onClick={openCreateForm}
                className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-hover transition-colors flex items-center gap-2 self-start"
              >
                <Plus size={16} />
                {showForm ? "Cancel" : "Add Section"}
              </button>
            )}
          </div>
        </div>

        {error && (
          <p className="max-w-5xl mx-auto mb-6 text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3">
            {error}
          </p>
        )}

        <AnimatePresence>
          {showForm && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleCreate}
              className="max-w-5xl mx-auto mb-10 bg-surface border border-surface-border rounded-2xl p-6 space-y-4 overflow-hidden"
            >
              <h3 className="text-lg font-bold text-white">New Section</h3>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Period</label>
                  <input
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    className="w-full bg-black border border-surface-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary"
                    placeholder="2024 – Present"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Role</label>
                  <input
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-black border border-surface-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary"
                    placeholder="Senior Quality Engineer"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Company</label>
                <input
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  required
                  className="w-full bg-black border border-surface-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary"
                  placeholder="Company name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  rows={5}
                  className="w-full bg-black border border-surface-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary resize-none"
                  placeholder="Describe this role and the work you delivered."
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary-hover transition-colors flex items-center gap-2 disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Adding...
                    </>
                  ) : (
                    "Create Section"
                  )}
                </button>
                <button
                  type="button"
                  onClick={closeForm}
                  className="px-6 py-3 bg-transparent border border-surface-border text-white font-medium rounded-lg hover:bg-surface transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        <div className="max-w-5xl mx-auto space-y-10">
          {sections.length > 0 ? (
            sections.map((section, index) => (
              <PortfolioSectionCard
                key={section.id}
                section={section}
                index={index}
                isLoggedIn={isLoggedIn}
                onSectionChange={updateSection}
                onSectionDelete={handleDeleteSection}
              />
            ))
          ) : (
            <div className="text-center py-16 text-gray-500 border border-dashed border-surface-border rounded-2xl">
              No experience sections yet.
              {isLoggedIn && " Add a section to start building your career timeline."}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
