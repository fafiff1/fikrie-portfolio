"use client";

import { motion } from "framer-motion";
import { Phone, MapPin, Mail, Linkedin, Github, Twitter } from "lucide-react";

export default function Contact() {
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
                <div>
                  <h4 className="text-white font-bold mb-1">Office</h4>
                  <p className="text-gray-400">
                    Chadstone Level 5<br />
                    Melbourne, Australia
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-white font-bold mb-4">Follow Me</h4>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 bg-surface rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-primary transition-all border border-surface-border">
                  <Linkedin size={20} />
                </a>
                <a href="#" className="w-10 h-10 bg-surface rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-primary transition-all border border-surface-border">
                  <Github size={20} />
                </a>
                <a href="#" className="w-10 h-10 bg-surface rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-primary transition-all border border-surface-border">
                  <Twitter size={20} />
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
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Your Name</label>
                  <input 
                    type="text" 
                    className="w-full bg-black border border-surface-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Your Email</label>
                  <input 
                    type="email" 
                    className="w-full bg-black border border-surface-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                    placeholder="john@example.com"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Subject</label>
                <input 
                  type="text" 
                  className="w-full bg-black border border-surface-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                  placeholder="Project Inquiry"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Message</label>
                <textarea 
                  rows={5}
                  className="w-full bg-black border border-surface-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors resize-none"
                  placeholder="Hello Fahreza, I would like to discuss..."
                ></textarea>
              </div>
              <button 
                type="submit"
                className="w-full py-4 bg-primary text-white font-bold rounded-lg hover:bg-primary-hover transition-colors flex items-center justify-center gap-2"
              >
                Send Message
                <Mail size={18} />
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
