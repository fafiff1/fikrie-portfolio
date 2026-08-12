"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase,
  Building2,
  Loader2,
  Pencil,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import type { PortfolioClient, PortfolioSection } from "@/lib/portfolio-shared";

type PortfolioSectionCardProps = {
  section: PortfolioSection;
  index: number;
  isLoggedIn: boolean;
  onSectionChange: (section: PortfolioSection) => void;
};

export default function PortfolioSectionCard({
  section,
  index,
  isLoggedIn,
  onSectionChange,
}: PortfolioSectionCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editing, setEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const [period, setPeriod] = useState(section.period);
  const [company, setCompany] = useState(section.company);
  const [role, setRole] = useState(section.role ?? "");
  const [description, setDescription] = useState(section.description);
  const [clients, setClients] = useState<PortfolioClient[]>(section.clients ?? []);

  const resetForm = () => {
    setPeriod(section.period);
    setCompany(section.company);
    setRole(section.role ?? "");
    setDescription(section.description);
    setClients(section.clients ?? []);
    setError(null);
  };

  const startEdit = () => {
    resetForm();
    setEditing(true);
  };

  const cancelEdit = () => {
    resetForm();
    setEditing(false);
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/portfolio/${section.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          period,
          company,
          role,
          description,
          clients: section.clients ? clients : undefined,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to save section.");
      }

      onSectionChange(data.section);
      setEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save section.");
    } finally {
      setSaving(false);
    }
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`/api/portfolio/${section.id}/media`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Upload failed.");
      }

      onSectionChange(data.section);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    if (!confirm("Delete this image?")) return;

    setDeletingId(imageId);
    setError(null);

    try {
      const response = await fetch(`/api/portfolio/${section.id}/media`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageId }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Delete failed.");
      }

      if (selectedImage === imageId) setSelectedImage(null);
      onSectionChange(data.section);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed.");
    } finally {
      setDeletingId(null);
    }
  };

  const updateClient = (clientId: string, field: "name" | "description", value: string) => {
    setClients((prev) =>
      prev.map((client) => (client.id === clientId ? { ...client, [field]: value } : client))
    );
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08 }}
      className="relative pl-8 md:pl-12"
    >
      <div className="absolute left-0 top-0 bottom-0 w-px bg-surface-border" />
      <div className="absolute left-0 top-6 -translate-x-1/2 w-4 h-4 rounded-full bg-primary border-4 border-black" />

      <div className="bg-surface border border-surface-border rounded-2xl overflow-hidden hover:border-primary/40 transition-colors">
        <div className="p-6 md:p-8 border-b border-surface-border">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-3">
                {section.period && (
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
                    <Briefcase size={14} />
                    {section.period}
                  </span>
                )}
                {section.role && (
                  <span className="text-sm text-gray-400">{section.role}</span>
                )}
              </div>

              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                  <Building2 size={22} className="text-primary" />
                </div>
                <div>
                  <h3 className="text-2xl md:text-3xl font-bold text-white">{section.company}</h3>
                  {section.id === "enett" && (
                    <p className="text-primary text-sm font-medium mt-1">B2B Payment Solution</p>
                  )}
                </div>
              </div>
            </div>

            {isLoggedIn && !editing && (
              <button
                onClick={startEdit}
                className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-hover transition-colors flex items-center gap-2 self-start"
              >
                <Pencil size={16} />
                Edit Section
              </button>
            )}
          </div>
        </div>

        <div className="p-6 md:p-8">
          {error && (
            <p className="mb-4 text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3">
              {error}
            </p>
          )}

          <AnimatePresence>
            {editing ? (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleSave}
                className="space-y-4 mb-6"
              >
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Period</label>
                    <input
                      value={period}
                      onChange={(e) => setPeriod(e.target.value)}
                      className="w-full bg-black border border-surface-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary"
                      placeholder="2012 – 2015"
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
                  />
                </div>

                {section.clients && (
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wider">
                      Client Sub-sections
                    </h4>
                    {clients.map((client) => (
                      <div
                        key={client.id}
                        className="bg-black border border-surface-border rounded-xl p-4 space-y-3"
                      >
                        <input
                          value={client.name}
                          onChange={(e) => updateClient(client.id, "name", e.target.value)}
                          className="w-full bg-surface border border-surface-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                          placeholder="Client name"
                        />
                        <textarea
                          value={client.description}
                          onChange={(e) => updateClient(client.id, "description", e.target.value)}
                          rows={3}
                          className="w-full bg-surface border border-surface-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary resize-none"
                          placeholder="Client description"
                        />
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex flex-wrap gap-3">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary-hover transition-colors flex items-center gap-2 disabled:opacity-60"
                  >
                    {saving ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="px-6 py-3 bg-transparent border border-surface-border text-white font-medium rounded-lg hover:bg-surface transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </motion.form>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{section.description}</p>

                {section.clients && section.clients.length > 0 && (
                  <div className="mt-8 grid md:grid-cols-3 gap-4">
                    {section.clients.map((client) => (
                      <div
                        key={client.id}
                        className="bg-black border border-surface-border rounded-xl p-5 hover:border-primary/40 transition-colors"
                      >
                        <h4 className="text-lg font-bold text-white mb-2">{client.name}</h4>
                        <p className="text-sm text-gray-400 leading-relaxed">{client.description}</p>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-8 pt-6 border-t border-surface-border">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wider">
                Project Images
              </h4>

              {isLoggedIn && (
                <>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="hidden"
                    onChange={handleUpload}
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-hover transition-colors flex items-center gap-2 self-start disabled:opacity-60"
                  >
                    {uploading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload size={16} />
                        Upload Image
                      </>
                    )}
                  </button>
                </>
              )}
            </div>

            {section.images.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {section.images.map((image) => (
                  <div
                    key={image.id}
                    className="group relative aspect-[4/3] rounded-xl overflow-hidden bg-black border border-surface-border hover:border-primary transition-colors"
                  >
                    <button
                      onClick={() => setSelectedImage(image.src)}
                      className="absolute inset-0 w-full h-full"
                    >
                      <img
                        src={image.src}
                        alt={image.caption || section.company}
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:scale-105"
                      />
                    </button>

                    {isLoggedIn && (
                      <button
                        onClick={() => handleDeleteImage(image.id)}
                        disabled={deletingId === image.id}
                        className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/80 border border-surface-border flex items-center justify-center text-gray-300 hover:bg-primary hover:text-white transition-colors disabled:opacity-60"
                        aria-label="Delete image"
                      >
                        {deletingId === image.id ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Trash2 size={14} />
                        )}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-gray-500 border border-dashed border-surface-border rounded-xl">
                No images yet.
                {isLoggedIn && " Upload images to showcase this role."}
              </div>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 md:p-8"
            onClick={() => setSelectedImage(null)}
          >
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-6 right-6 w-10 h-10 rounded-full bg-surface border border-surface-border flex items-center justify-center text-white hover:bg-primary transition-colors"
              aria-label="Close"
            >
              <X size={20} />
            </button>
            <motion.img
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              src={selectedImage}
              alt={section.company}
              className="max-w-5xl w-full max-h-[85vh] object-contain rounded-xl"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}
