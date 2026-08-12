"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import {
  Settings,
  FileText,
  ImageIcon,
  LayoutGrid,
  Shield,
  Mail,
  Loader2,
  Upload,
  Trash2,
  Pencil,
  ExternalLink,
} from "lucide-react";
import type { SiteContent } from "@/lib/site-content-shared";
import type { SiteConfig } from "@/lib/site-config-shared";
import type { Review } from "@/lib/reviews-shared";

type SettingsTab = "content" | "images" | "sections" | "account" | "site";

type AccountInfo = {
  username: string;
  recoveryEmail: string;
  createdAt: string;
};

type EmailProviders = {
  smtpConfigured: boolean;
  web3formsConfigured: boolean;
  envReceiverEmail: string | null;
};

type SettingsContentProps = {
  initialContent: SiteContent;
  initialConfig: SiteConfig;
  initialReviews: Review[];
  initialAccount: AccountInfo;
  emailProviders: EmailProviders;
  effectiveContactEmail: string | null;
  emailConfigured: boolean;
};

const tabs: { id: SettingsTab; label: string; icon: React.ReactNode; description: string }[] = [
  {
    id: "content",
    label: "Content & Bio",
    icon: <FileText size={18} />,
    description: "Edit taglines, bio snippets, and contact details.",
  },
  {
    id: "images",
    label: "Images & Assets",
    icon: <ImageIcon size={18} />,
    description: "Upload profile pictures and manage visual assets.",
  },
  {
    id: "sections",
    label: "Section Data",
    icon: <LayoutGrid size={18} />,
    description: "Manage reviews and jump to editable page sections.",
  },
  {
    id: "account",
    label: "Account & Security",
    icon: <Shield size={18} />,
    description: "Update login credentials and recovery email.",
  },
  {
    id: "site",
    label: "Site & Forms",
    icon: <Mail size={18} />,
    description: "Configure contact delivery, SEO, and site preferences.",
  },
];

const sectionLinks = [
  { name: "Family", href: "/family", note: "Edit member bios, blogs, and media on the page." },
  { name: "Portfolio", href: "/portfolio", note: "Edit career sections and project images on the page." },
  { name: "About Lifestyle", href: "/about/hobbies", note: "Manage hobbies, sports, and travel content." },
  { name: "Reviews", href: "/reviews", note: "Preview client reviews after editing them here." },
];

export default function SettingsContent({
  initialContent,
  initialConfig,
  initialReviews,
  initialAccount,
  emailProviders,
  effectiveContactEmail,
  emailConfigured,
}: SettingsContentProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>("content");
  const [content, setContent] = useState(initialContent);
  const [config, setConfig] = useState(initialConfig);
  const [reviews, setReviews] = useState(initialReviews);
  const [account, setAccount] = useState(initialAccount);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const profileInputRef = useRef<HTMLInputElement>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [reviewForm, setReviewForm] = useState<{
    id: string | null;
    name: string;
    role: string;
    company: string;
    content: string;
    imageUrl: string;
    imageFile: File | null;
  }>({
    id: null,
    name: "",
    role: "",
    company: "",
    content: "",
    imageUrl: "",
    imageFile: null,
  });

  const resetMessages = () => {
    setError(null);
    setSuccess(null);
  };

  const saveContent = async () => {
    setSaving(true);
    resetMessages();

    try {
      const response = await fetch("/api/settings/content", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(content),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to save content.");

      setContent(data.content);
      setSuccess("Content and bio updated successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save content.");
    } finally {
      setSaving(false);
    }
  };

  const saveConfig = async () => {
    setSaving(true);
    resetMessages();

    try {
      const response = await fetch("/api/settings/config", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to save site configuration.");

      setConfig(data.config);
      setSuccess("Site and form settings updated successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save site configuration.");
    } finally {
      setSaving(false);
    }
  };

  const saveAccount = async () => {
    setSaving(true);
    resetMessages();

    try {
      const response = await fetch("/api/settings/account", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: account.username,
          recoveryEmail: account.recoveryEmail,
          currentPassword: currentPassword || undefined,
          newPassword: newPassword || undefined,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to update account.");

      setAccount(data.account);
      setCurrentPassword("");
      setNewPassword("");
      setSuccess("Account settings updated successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update account.");
    } finally {
      setSaving(false);
    }
  };

  const uploadProfileImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSaving(true);
    resetMessages();

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/settings/profile-image", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Upload failed.");

      setContent(data.content);
      setSuccess("Profile image updated successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setSaving(false);
      if (profileInputRef.current) profileInputRef.current.value = "";
    }
  };

  const resetReviewForm = () => {
    setReviewForm({
      id: null,
      name: "",
      role: "",
      company: "",
      content: "",
      imageUrl: "",
      imageFile: null,
    });
  };

  const saveReview = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    resetMessages();

    const formData = new FormData();
    formData.append("name", reviewForm.name);
    formData.append("role", reviewForm.role);
    formData.append("company", reviewForm.company);
    formData.append("content", reviewForm.content);
    if (reviewForm.imageFile) formData.append("image", reviewForm.imageFile);
    if (reviewForm.imageUrl) formData.append("imageUrl", reviewForm.imageUrl);
    if (reviewForm.id) formData.append("reviewId", reviewForm.id);

    try {
      const response = await fetch("/api/settings/reviews", {
        method: reviewForm.id ? "PATCH" : "POST",
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to save review.");

      setReviews(data.reviews);
      resetReviewForm();
      setSuccess(reviewForm.id ? "Review updated." : "Review added.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save review.");
    } finally {
      setSaving(false);
    }
  };

  const deleteReview = async (reviewId: string) => {
    if (!confirm("Delete this review?")) return;

    setSaving(true);
    resetMessages();

    try {
      const response = await fetch("/api/settings/reviews", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewId }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Delete failed.");

      setReviews(data.reviews);
      if (reviewForm.id === reviewId) resetReviewForm();
      setSuccess("Review deleted.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed.");
    } finally {
      setSaving(false);
    }
  };

  const updateStat = (index: number, field: "title" | "desc", value: string) => {
    setContent((prev) => ({
      ...prev,
      about: {
        ...prev.about,
        stats: prev.about.stats.map((stat, statIndex) =>
          statIndex === index ? { ...stat, [field]: value } : stat
        ),
      },
    }));
  };

  return (
    <section className="py-24">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mb-10">
          <div className="flex items-center gap-5 mb-4">
            <div className="relative">
              <div className="absolute inset-0 rounded-2xl bg-primary/20 blur-xl" />
              <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-white flex items-center justify-center shadow-xl shadow-primary/20 ring-1 ring-white/80">
                <Settings size={42} className="text-black" strokeWidth={2.5} />
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-primary uppercase tracking-[0.2em] mb-2">Admin</p>
              <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight">Settings</h1>
            </div>
          </div>
          <p className="text-gray-400 text-lg max-w-2xl">
            Manage content, images, permissions, and site configuration from one place.
          </p>
        </div>

        {(error || success) && (
          <div className="mb-6">
            {error && (
              <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3">
                {error}
              </p>
            )}
            {success && (
              <p className="text-sm text-green-400 bg-green-400/10 border border-green-400/20 rounded-lg px-4 py-3">
                {success}
              </p>
            )}
          </div>
        )}

        <div className="grid lg:grid-cols-[280px_1fr] gap-8">
          <aside className="space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  resetMessages();
                }}
                className={`w-full text-left px-4 py-4 rounded-xl border transition-colors ${
                  activeTab === tab.id
                    ? "bg-primary/10 border-primary text-white"
                    : "bg-surface border-surface-border text-gray-300 hover:border-primary/40"
                }`}
              >
                <div className="flex items-center gap-3 mb-1">
                  {tab.icon}
                  <span className="font-medium">{tab.label}</span>
                </div>
                <p className="text-xs text-gray-500 pl-7">{tab.description}</p>
              </button>
            ))}
          </aside>

          <div className="bg-surface border border-surface-border rounded-2xl p-6 md:p-8">
            {activeTab === "content" && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6">Hero & Home</h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    <Field label="Role badge" value={content.hero.roleBadge} onChange={(value) => setContent((prev) => ({ ...prev, hero: { ...prev.hero, roleBadge: value } }))} />
                    <Field label="Name" value={content.hero.name} onChange={(value) => setContent((prev) => ({ ...prev, hero: { ...prev.hero, name: value } }))} />
                    <Field label="Headline" value={content.hero.headline} onChange={(value) => setContent((prev) => ({ ...prev, hero: { ...prev.hero, headline: value } }))} />
                    <Field label="Location" value={content.hero.location} onChange={(value) => setContent((prev) => ({ ...prev, hero: { ...prev.hero, location: value } }))} />
                    <Field label="Badge value" value={content.hero.badgeValue} onChange={(value) => setContent((prev) => ({ ...prev, hero: { ...prev.hero, badgeValue: value } }))} />
                    <Field label="Badge label" value={content.hero.badgeLabel} onChange={(value) => setContent((prev) => ({ ...prev, hero: { ...prev.hero, badgeLabel: value } }))} />
                  </div>
                  <TextArea label="Hero bio" value={content.hero.bio} onChange={(value) => setContent((prev) => ({ ...prev, hero: { ...prev.hero, bio: value } }))} />
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-white mb-6">About</h2>
                  <TextArea label="About intro" value={content.about.intro} onChange={(value) => setContent((prev) => ({ ...prev, about: { ...prev.about, intro: value } }))} />
                  <div className="grid md:grid-cols-2 gap-4 mt-4">
                    {content.about.stats.map((stat, index) => (
                      <div key={index} className="bg-black border border-surface-border rounded-xl p-4 space-y-3">
                        <Field label={`Stat ${index + 1} title`} value={stat.title} onChange={(value) => updateStat(index, "title", value)} />
                        <Field label={`Stat ${index + 1} description`} value={stat.desc} onChange={(value) => updateStat(index, "desc", value)} />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-white mb-6">Contact Details</h2>
                  <TextArea label="Contact intro" value={content.contact.intro} onChange={(value) => setContent((prev) => ({ ...prev, contact: { ...prev.contact, intro: value } }))} />
                  <div className="grid md:grid-cols-2 gap-4 mt-4">
                    <Field label="Phone" value={content.contact.phone} onChange={(value) => setContent((prev) => ({ ...prev, contact: { ...prev.contact, phone: value } }))} />
                    <Field label="Office name" value={content.contact.officeName} onChange={(value) => setContent((prev) => ({ ...prev, contact: { ...prev.contact, officeName: value } }))} />
                  </div>
                  <TextArea label="Address lines (one per line)" value={content.contact.addressLines.join("\n")} onChange={(value) => setContent((prev) => ({ ...prev, contact: { ...prev.contact, addressLines: value.split("\n").filter(Boolean) } }))} />
                </div>

                <SaveButton saving={saving} onClick={saveContent} label="Save Content & Bio" />
              </div>
            )}

            {activeTab === "images" && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">Profile Picture</h2>
                  <p className="text-gray-400 mb-6">Upload a new hero profile image, such as your sketch portrait.</p>
                  <div className="flex flex-col md:flex-row gap-6 items-start">
                    <img src={content.hero.profileImage} alt="Profile" className="w-40 h-40 rounded-2xl object-cover border border-surface-border" />
                    <div>
                      <input ref={profileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={uploadProfileImage} />
                      <button onClick={() => profileInputRef.current?.click()} disabled={saving} className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-hover transition-colors flex items-center gap-2 disabled:opacity-60">
                        {saving ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                        Upload Profile Image
                      </button>
                      <p className="text-xs text-gray-500 mt-3">Current path: {content.hero.profileImage}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-white mb-4">Section Asset Management</h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    {sectionLinks.map((link) => (
                      <Link key={link.href} href={link.href} className="block bg-black border border-surface-border rounded-xl p-5 hover:border-primary transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-bold text-white">{link.name}</h3>
                          <ExternalLink size={16} className="text-primary" />
                        </div>
                        <p className="text-sm text-gray-400">{link.note}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "sections" && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">Client Reviews</h2>
                  <p className="text-gray-400 mb-6">Add, edit, or remove review cards shown on the Reviews page.</p>

                  <form onSubmit={saveReview} className="bg-black border border-surface-border rounded-xl p-5 space-y-4 mb-6">
                    <h3 className="font-bold text-white">{reviewForm.id ? "Edit Review" : "Add Review"}</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <Field label="Name" value={reviewForm.name} onChange={(value) => setReviewForm((prev) => ({ ...prev, name: value }))} />
                      <Field label="Role" value={reviewForm.role} onChange={(value) => setReviewForm((prev) => ({ ...prev, role: value }))} />
                      <Field label="Company" value={reviewForm.company} onChange={(value) => setReviewForm((prev) => ({ ...prev, company: value }))} />
                      <Field label="Image URL (optional if uploading)" value={reviewForm.imageUrl} onChange={(value) => setReviewForm((prev) => ({ ...prev, imageUrl: value }))} />
                    </div>
                    <TextArea label="Review content" value={reviewForm.content} onChange={(value) => setReviewForm((prev) => ({ ...prev, content: value }))} />
                    <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(e) => setReviewForm((prev) => ({ ...prev, imageFile: e.target.files?.[0] || null }))} className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary file:text-white file:cursor-pointer" />
                    <div className="flex gap-3">
                      <SaveButton saving={saving} label={reviewForm.id ? "Update Review" : "Add Review"} />
                      {reviewForm.id && (
                        <button type="button" onClick={resetReviewForm} className="px-6 py-3 border border-surface-border text-white rounded-lg hover:bg-black transition-colors">
                          Cancel
                        </button>
                      )}
                    </div>
                  </form>

                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div key={review.id} className="flex gap-4 bg-black border border-surface-border rounded-xl p-4">
                        <img src={review.image} alt={review.name} className="w-16 h-16 rounded-full object-cover border border-surface-border" />
                        <div className="flex-1">
                          <h4 className="font-bold text-white">{review.name}</h4>
                          <p className="text-sm text-gray-400">{review.role} at {review.company}</p>
                          <p className="text-sm text-gray-300 mt-2 line-clamp-2">{review.content}</p>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => setReviewForm({ id: review.id, name: review.name, role: review.role, company: review.company, content: review.content, imageUrl: review.image, imageFile: null })} className="w-9 h-9 rounded-full border border-surface-border flex items-center justify-center text-gray-300 hover:text-white hover:border-primary">
                            <Pencil size={16} />
                          </button>
                          <button onClick={() => deleteReview(review.id)} className="w-9 h-9 rounded-full border border-surface-border flex items-center justify-center text-gray-300 hover:text-white hover:border-primary">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-white mb-4">Other Editable Sections</h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    {sectionLinks.map((link) => (
                      <Link key={link.href} href={link.href} className="block bg-black border border-surface-border rounded-xl p-5 hover:border-primary transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-bold text-white">{link.name}</h3>
                          <ExternalLink size={16} className="text-primary" />
                        </div>
                        <p className="text-sm text-gray-400">{link.note}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "account" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white">Account & Security</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <Field label="Username" value={account.username} onChange={(value) => setAccount((prev) => ({ ...prev, username: value }))} />
                  <Field label="Recovery email" value={account.recoveryEmail} onChange={(value) => setAccount((prev) => ({ ...prev, recoveryEmail: value }))} />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <Field label="Current password" type="password" value={currentPassword} onChange={setCurrentPassword} />
                  <Field label="New password" type="password" value={newPassword} onChange={setNewPassword} />
                </div>
                <p className="text-sm text-gray-500">Account created: {new Date(account.createdAt).toLocaleDateString("en-AU")}</p>
                <SaveButton saving={saving} onClick={saveAccount} label="Save Account Settings" />
              </div>
            )}

            {activeTab === "site" && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6">SEO Metadata</h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    <Field label="Site title" value={content.seo.siteTitle} onChange={(value) => setContent((prev) => ({ ...prev, seo: { ...prev.seo, siteTitle: value } }))} />
                    <Field label="Brand name" value={content.seo.brandName} onChange={(value) => setContent((prev) => ({ ...prev, seo: { ...prev.seo, brandName: value }, footer: { copyrightName: value } }))} />
                  </div>
                  <TextArea label="Site description" value={content.seo.siteDescription} onChange={(value) => setContent((prev) => ({ ...prev, seo: { ...prev.seo, siteDescription: value } }))} />
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-white mb-6">Contact Form</h2>
                  <Field label="Contact receiver email" value={config.contactReceiverEmail} onChange={(value) => setConfig((prev) => ({ ...prev, contactReceiverEmail: value }))} />
                  <p className="text-sm text-gray-500 mt-2">
                    Effective delivery email: {effectiveContactEmail || "Not configured"}
                    {emailConfigured ? " (active)" : " (inactive)"}
                  </p>
                  <div className="mt-4 space-y-2 text-sm text-gray-400">
                    <p>SMTP configured: {emailProviders.smtpConfigured ? "Yes" : "No"}</p>
                    <p>Web3Forms configured: {emailProviders.web3formsConfigured ? "Yes" : "No"}</p>
                    <p>Env fallback email: {emailProviders.envReceiverEmail || "None"}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <Toggle label="Save contact messages to site archive" checked={config.saveContactMessages} onChange={(checked) => setConfig((prev) => ({ ...prev, saveContactMessages: checked }))} />
                  <Toggle label="Allow new account registration from login page" checked={config.allowRegistration} onChange={(checked) => setConfig((prev) => ({ ...prev, allowRegistration: checked }))} />
                </div>

                <div className="flex flex-wrap gap-3">
                  <SaveButton saving={saving} onClick={async () => { await saveContent(); await saveConfig(); }} label="Save Site Settings" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-400 mb-2">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-black border border-surface-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary"
      />
    </div>
  );
}

function TextArea({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-400 mb-2">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
        className="w-full bg-black border border-surface-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary resize-none"
      />
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-4 bg-black border border-surface-border rounded-xl px-4 py-3 cursor-pointer">
      <span className="text-sm text-gray-300">{label}</span>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="w-4 h-4 accent-primary" />
    </label>
  );
}

function SaveButton({
  saving,
  onClick,
  label,
}: {
  saving: boolean;
  onClick?: () => void;
  label: string;
}) {
  if (onClick) {
    return (
      <button type="button" onClick={onClick} disabled={saving} className="px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary-hover transition-colors flex items-center gap-2 disabled:opacity-60">
        {saving ? <Loader2 size={16} className="animate-spin" /> : null}
        {label}
      </button>
    );
  }

  return (
    <button type="submit" disabled={saving} className="px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary-hover transition-colors flex items-center gap-2 disabled:opacity-60">
      {saving ? <Loader2 size={16} className="animate-spin" /> : null}
      {label}
    </button>
  );
}
