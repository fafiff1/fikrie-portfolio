"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ImageIcon, Play, X, Upload, Trash2, Loader2 } from "lucide-react";
import type { MediaItem } from "@/lib/lifestyle-shared";

type LifestyleMediaGalleryProps = {
  category: string;
  sectionTitle: string;
  media: MediaItem[];
  isLoggedIn: boolean;
  onMediaChange: (media: MediaItem[]) => void;
};

export default function LifestyleMediaGallery({
  category,
  sectionTitle,
  media,
  isLoggedIn,
  onMediaChange,
}: LifestyleMediaGalleryProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<"all" | "photo" | "video">("all");
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filteredMedia =
    activeTab === "all" ? media : media.filter((item) => item.type === activeTab);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", file.name.replace(/\.[^/.]+$/, ""));

    try {
      const response = await fetch(`/api/lifestyle/${category}/media`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Upload failed.");

      onMediaChange(data.media);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDelete = async (item: MediaItem, event: React.MouseEvent) => {
    event.stopPropagation();
    if (!confirm(`Delete "${item.title}"?`)) return;

    setDeletingId(item.id);
    setError(null);

    try {
      const response = await fetch(`/api/lifestyle/${category}/media`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mediaId: item.id }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Delete failed.");

      if (selectedItem?.id === item.id) setSelectedItem(null);
      onMediaChange(data.media);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h3 className="text-xl font-bold text-white mb-1">Photos & Videos</h3>
          <p className="text-sm text-gray-400">{sectionTitle} gallery</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 p-1 bg-black border border-surface-border rounded-lg">
            {(["all", "photo", "video"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors capitalize ${
                  activeTab === tab
                    ? "bg-primary text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {tab === "all" ? "All" : tab === "photo" ? "Photos" : "Videos"}
              </button>
            ))}
          </div>

          {isLoggedIn && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime"
                className="hidden"
                onChange={handleUpload}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-hover transition-colors flex items-center gap-2 disabled:opacity-60"
              >
                {uploading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload size={16} />
                    Upload
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>

      {error && (
        <p className="mb-4 text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3">
          {error}
        </p>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {filteredMedia.map((item, index) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: index * 0.05 }}
              className="group relative aspect-square rounded-xl overflow-hidden bg-black border border-surface-border hover:border-primary transition-colors"
            >
              <button
                onClick={() => setSelectedItem(item)}
                className="absolute inset-0 w-full h-full text-left"
              >
                {item.type === "video" && !item.poster ? (
                  <video
                    src={item.src}
                    muted
                    playsInline
                    preload="metadata"
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:scale-105"
                  />
                ) : (
                  <img
                    src={item.type === "video" ? item.poster || item.src : item.src}
                    alt={item.title}
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:scale-105"
                  />
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />

                {item.type === "video" && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-12 h-12 rounded-full bg-primary/90 flex items-center justify-center text-white">
                      <Play size={20} className="ml-1" fill="currentColor" />
                    </div>
                  </div>
                )}

                <div className="absolute bottom-0 left-0 right-0 p-3 pointer-events-none">
                  <p className="text-sm font-medium text-white line-clamp-2">{item.title}</p>
                </div>
              </button>

              {isLoggedIn && (
                <button
                  onClick={(e) => handleDelete(item, e)}
                  disabled={deletingId === item.id}
                  className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/80 border border-surface-border flex items-center justify-center text-gray-300 hover:bg-primary hover:text-white transition-colors z-10 disabled:opacity-60"
                  aria-label={`Delete ${item.title}`}
                >
                  {deletingId === item.id ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Trash2 size={16} />
                  )}
                </button>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredMedia.length === 0 && (
        <div className="text-center py-12 text-gray-500 border border-dashed border-surface-border rounded-xl">
          No {activeTab === "all" ? "media" : activeTab === "photo" ? "photos" : "videos"} yet.
          {isLoggedIn && " Use Upload to add some."}
        </div>
      )}

      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 md:p-8"
            onClick={() => setSelectedItem(null)}
          >
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-6 right-6 w-10 h-10 rounded-full bg-surface border border-surface-border flex items-center justify-center text-white hover:bg-primary transition-colors"
              aria-label="Close"
            >
              <X size={20} />
            </button>

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="max-w-4xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              {selectedItem.type === "photo" ? (
                <img
                  src={selectedItem.src}
                  alt={selectedItem.title}
                  className="w-full max-h-[80vh] object-contain rounded-xl"
                />
              ) : (
                <video
                  src={selectedItem.src}
                  poster={selectedItem.poster}
                  controls
                  autoPlay
                  className="w-full max-h-[80vh] rounded-xl bg-black object-contain mx-auto"
                />
              )}
              <p className="text-center text-white mt-4 text-lg font-medium">{selectedItem.title}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
