"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Phone, MapPin, Mail, Loader2, CheckCircle2 } from "lucide-react";
import { sendContactEmailFromBrowser } from "@/lib/contact-email-client";

// Inline SVGs for social icons since Lucide removed brand icons
const GithubIcon = ({ size = 20 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const LinkedinIcon = ({ size = 20 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const TwitterIcon = ({ size = 20 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

export default function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    website: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send message.");
      }

      if (data.clientEmailDelivery?.receiverEmail) {
        await sendContactEmailFromBrowser(
          {
            name: form.name.trim(),
            email: form.email.trim(),
            subject: form.subject.trim(),
            message: form.message.trim(),
          },
          data.clientEmailDelivery.receiverEmail
        );
      }

      setStatus("success");
      setForm({ name: "", email: "", subject: "", message: "", website: "" });
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Failed to send message.");
    }
  };

  return (
    <section id="contact" className="py-24 relative">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Let&apos;s <span className="text-primary">Connect</span>
            </h2>
            <p className="text-gray-400 text-lg mb-12 max-w-md">
              Whether you have a project in mind or just want to chat about quality engineering, I&apos;d love to hear from you.
            </p>

            <div className="space-y-8 mb-12">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-surface rounded-xl flex items-center justify-center text-primary shrink-0 border border-surface-border">
                  <Phone size={24} />
                </div>
                <div>
                  <h4 className="text-white font-bold mb-1">Phone</h4>
                  <a href="tel:0432000111" className="text-gray-400 hover:text-primary transition-colors">
                    0432 000 111
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-surface rounded-xl flex items-center justify-center text-primary shrink-0 border border-surface-border">
                  <MapPin size={24} />
                </div>
                <div className="flex-1">
                  <h4 className="text-white font-bold mb-1">Office</h4>
                  <p className="text-gray-400 mb-1">
                    One Middle Road (OMR)
                  </p>
                  <p className="text-gray-400">
                    Level 5, 1 Middle Road<br />
                    Chadstone VIC 3148<br />
                    Melbourne, Australia
                  </p>
                  <a
                    href="https://www.google.com/maps/search/?api=1&query=1+Middle+Road,+Chadstone,+VIC+3148"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-2 text-sm text-primary hover:underline"
                  >
                    Open in Google Maps
                  </a>

                  <div className="mt-4 rounded-xl overflow-hidden border border-surface-border aspect-video max-w-md">
                    <iframe
                      title="One Middle Road (OMR) office location"
                      src="https://maps.google.com/maps?q=1+Middle+Road,+Chadstone,+VIC+3148&hl=en&z=16&output=embed"
                      className="w-full h-full min-h-[200px] grayscale hover:grayscale-0 transition-all duration-500"
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      allowFullScreen
                    />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-white font-bold mb-4">Follow Me</h4>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 bg-surface rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-primary transition-all border border-surface-border">
                  <LinkedinIcon size={20} />
                </a>
                <a href="#" className="w-10 h-10 bg-surface rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-primary transition-all border border-surface-border">
                  <GithubIcon size={20} />
                </a>
                <a href="#" className="w-10 h-10 bg-surface rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-primary transition-all border border-surface-border">
                  <TwitterIcon size={20} />
                </a>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-surface border border-surface-border p-8 rounded-2xl"
          >
            <h3 className="text-2xl font-bold text-white mb-6">Send a Message</h3>

            {status === "success" ? (
              <div className="text-center py-12">
                <CheckCircle2 size={48} className="text-primary mx-auto mb-4" />
                <h4 className="text-xl font-bold text-white mb-2">Message Sent!</h4>
                <p className="text-gray-400 mb-6">
                  Thank you for reaching out. I&apos;ll get back to you as soon as possible.
                </p>
                <button
                  onClick={() => setStatus("idle")}
                  className="px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary-hover transition-colors"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <input
                type="text"
                name="website"
                value={form.website}
                onChange={handleChange}
                className="hidden"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
              />
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-400 mb-2">Your Name</label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={form.name}
                    onChange={handleChange}
                    className="w-full bg-black border border-surface-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-2">Your Email</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={handleChange}
                    className="w-full bg-black border border-surface-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                    placeholder="john@example.com"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-400 mb-2">Subject</label>
                <input
                  id="subject"
                  name="subject"
                  type="text"
                  required
                  value={form.subject}
                  onChange={handleChange}
                  className="w-full bg-black border border-surface-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                  placeholder="Project Inquiry"
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-400 mb-2">Message</label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  required
                  value={form.message}
                  onChange={handleChange}
                  className="w-full bg-black border border-surface-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors resize-none"
                  placeholder="Hello Fahreza, I would like to discuss..."
                />
              </div>

              {status === "error" && (
                <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3">
                  {errorMessage}
                </p>
              )}

              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full py-4 bg-primary text-white font-bold rounded-lg hover:bg-primary-hover transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {status === "loading" ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    Send Message
                    <Mail size={18} />
                  </>
                )}
              </button>
            </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
