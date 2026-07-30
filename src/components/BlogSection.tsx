"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Plus, Trash2, Loader2, X, Calendar, Pencil } from "lucide-react";
import type { BlogPost } from "@/lib/lifestyle-shared";

type BlogSectionProps = {
  apiPath: string;
  sectionTitle: string;
  blogs: BlogPost[];
  isLoggedIn: boolean;
  onBlogsChange: (blogs: BlogPost[]) => void;
};

export default function BlogSection({
  apiPath,
  sectionTitle,
  blogs,
  isLoggedIn,
  onBlogsChange,
}: BlogSectionProps) {
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingBlogId, setEditingBlogId] = useState<string | null>(null);
  const [editingCoverImage, setEditingCoverImage] = useState<string | undefined>();
  const [removeCover, setRemoveCover] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState<BlogPost | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isEditing = editingBlogId !== null;

  const resetForm = () => {
    setTitle("");
    setContent("");
    setCoverFile(null);
    setEditingBlogId(null);
    setEditingCoverImage(undefined);
    setRemoveCover(false);
    if (coverInputRef.current) coverInputRef.current.value = "";
  };

  const closeForm = () => {
    resetForm();
    setShowForm(false);
  };

  const openCreateForm = () => {
    if (showForm && !isEditing) {
      closeForm();
      return;
    }
    resetForm();
    setShowForm(true);
  };

  const startEdit = (blog: BlogPost, event?: React.MouseEvent) => {
    event?.stopPropagation();
    setEditingBlogId(blog.id);
    setEditingCoverImage(blog.coverImage);
    setRemoveCover(false);
    setTitle(blog.title);
    setContent(blog.content);
    setCoverFile(null);
    if (coverInputRef.current) coverInputRef.current.value = "";
    setShowForm(true);
    setSelectedBlog(null);
    setError(null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    if (coverFile) formData.append("cover", coverFile);
    if (isEditing) {
      formData.append("blogId", editingBlogId);
      if (removeCover) formData.append("removeCover", "true");
    }

    try {
      const response = await fetch(apiPath, {
        method: isEditing ? "PATCH" : "POST",
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || (isEditing ? "Failed to update blog." : "Failed to publish blog."));
      }

      onBlogsChange(data.blogs);
      closeForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (blog: BlogPost, event: React.MouseEvent) => {
    event.stopPropagation();
    if (!confirm(`Delete blog "${blog.title}"?`)) return;

    setDeletingId(blog.id);
    setError(null);

    try {
      const response = await fetch(apiPath, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blogId: blog.id }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Delete failed.");

      if (selectedBlog?.id === blog.id) setSelectedBlog(null);
      if (editingBlogId === blog.id) closeForm();
      onBlogsChange(data.blogs);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed.");
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-AU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  const showExistingCover = isEditing && editingCoverImage && !removeCover && !coverFile;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h3 className="text-xl font-bold text-white mb-1">Blog</h3>
          <p className="text-sm text-gray-400">Stories and notes about {sectionTitle.toLowerCase()}</p>
        </div>

        {isLoggedIn && (
          <button
            onClick={openCreateForm}
            className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-hover transition-colors flex items-center gap-2 self-start"
          >
            <Plus size={16} />
            {showForm && !isEditing ? "Cancel" : "Write Blog"}
          </button>
        )}
      </div>

      {error && (
        <p className="mb-4 text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3">
          {error}
        </p>
      )}

      <AnimatePresence>
        {showForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSubmit}
            className="mb-8 bg-black border border-surface-border rounded-2xl p-6 space-y-4 overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-bold text-white">
                {isEditing ? "Edit Blog" : "New Blog"}
              </h4>
              <button
                type="button"
                onClick={closeForm}
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full bg-surface border border-surface-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary"
                placeholder="My weekend hiking adventure"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Content</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                rows={6}
                className="w-full bg-surface border border-surface-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary resize-none"
                placeholder="Write your blog post here..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Cover image (optional)
              </label>

              {showExistingCover && (
                <div className="mb-3 flex items-center gap-4">
                  <img
                    src={editingCoverImage}
                    alt="Current cover"
                    className="w-24 h-16 object-cover rounded-lg border border-surface-border"
                  />
                  <button
                    type="button"
                    onClick={() => setRemoveCover(true)}
                    className="text-sm text-red-400 hover:text-red-300 transition-colors"
                  >
                    Remove cover
                  </button>
                </div>
              )}

              <input
                ref={coverInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={(e) => {
                  setCoverFile(e.target.files?.[0] || null);
                  if (e.target.files?.[0]) setRemoveCover(false);
                }}
                className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary file:text-white file:cursor-pointer"
              />
              {isEditing && (
                <p className="mt-2 text-xs text-gray-500">
                  Leave empty to keep the current cover image.
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary-hover transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  {isEditing ? "Saving..." : "Publishing..."}
                </>
              ) : isEditing ? (
                "Save Changes"
              ) : (
                "Publish Blog"
              )}
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {blogs.map((blog, index) => (
          <motion.article
            key={blog.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => setSelectedBlog(blog)}
            className="group bg-surface border border-surface-border rounded-2xl overflow-hidden hover:border-primary transition-colors cursor-pointer relative"
          >
            <div className="aspect-video bg-black overflow-hidden">
              {blog.coverImage ? (
                <img
                  src={blog.coverImage}
                  alt={blog.title}
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-primary/10">
                  <BookOpen size={40} className="text-primary/50" />
                </div>
              )}
            </div>

            <div className="p-5">
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                <Calendar size={12} />
                {formatDate(blog.createdAt)}
              </div>
              <h4 className="text-lg font-bold text-white mb-2 line-clamp-2">{blog.title}</h4>
              <p className="text-sm text-gray-400 line-clamp-3">{blog.content}</p>
            </div>

            {isLoggedIn && (
              <div className="absolute top-3 right-3 flex gap-2 z-10">
                <button
                  onClick={(e) => startEdit(blog, e)}
                  className="w-9 h-9 rounded-full bg-black/80 border border-surface-border flex items-center justify-center text-gray-300 hover:bg-primary hover:text-white transition-colors"
                  aria-label={`Edit ${blog.title}`}
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={(e) => handleDelete(blog, e)}
                  disabled={deletingId === blog.id}
                  className="w-9 h-9 rounded-full bg-black/80 border border-surface-border flex items-center justify-center text-gray-300 hover:bg-primary hover:text-white transition-colors disabled:opacity-60"
                  aria-label={`Delete ${blog.title}`}
                >
                  {deletingId === blog.id ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Trash2 size={16} />
                  )}
                </button>
              </div>
            )}
          </motion.article>
        ))}
      </div>

      {blogs.length === 0 && (
        <div className="text-center py-12 text-gray-500 border border-dashed border-surface-border rounded-xl">
          No blog posts yet.
          {isLoggedIn && " Click Write Blog to publish your first story."}
        </div>
      )}

      <AnimatePresence>
        {selectedBlog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 md:p-8 overflow-y-auto"
            onClick={() => setSelectedBlog(null)}
          >
            <button
              onClick={() => setSelectedBlog(null)}
              className="fixed top-6 right-6 w-10 h-10 rounded-full bg-surface border border-surface-border flex items-center justify-center text-white hover:bg-primary transition-colors z-[101]"
              aria-label="Close"
            >
              <X size={20} />
            </button>

            <motion.article
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="max-w-3xl w-full bg-surface border border-surface-border rounded-2xl overflow-hidden my-8"
              onClick={(e) => e.stopPropagation()}
            >
              {selectedBlog.coverImage && (
                <img
                  src={selectedBlog.coverImage}
                  alt={selectedBlog.title}
                  className="w-full max-h-[40vh] object-cover"
                />
              )}
              <div className="p-8">
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div>
                    <p className="text-sm text-gray-500 mb-3">{formatDate(selectedBlog.createdAt)}</p>
                    <h2 className="text-3xl font-bold text-white">{selectedBlog.title}</h2>
                  </div>
                  {isLoggedIn && (
                    <button
                      onClick={() => startEdit(selectedBlog)}
                      className="shrink-0 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-hover transition-colors flex items-center gap-2"
                    >
                      <Pencil size={16} />
                      Edit
                    </button>
                  )}
                </div>
                <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{selectedBlog.content}</p>
              </div>
            </motion.article>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
