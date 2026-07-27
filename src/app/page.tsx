import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Portfolio from "@/components/Portfolio";
import Testimonials from "@/components/Testimonials";
import Contact from "@/components/Contact";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white selection:bg-primary selection:text-white">
      <Navbar />
      <Hero />
      <About />
      <Portfolio />
      <Testimonials />
      <Contact />
      
      {/* Footer */}
      <footer className="border-t border-surface-border py-8 text-center text-gray-500 text-sm">
        <p>© {new Date().getFullYear()} Fahreza. All rights reserved.</p>
      </footer>
    </main>
  );
}
