"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Zap, Menu, X } from "lucide-react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-[#08090a]/90 backdrop-blur-md border-b border-white/5" : ""}`}>
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg tracking-tight">
          <div className="w-7 h-7 rounded-lg bg-violet-500 flex items-center justify-center">
            <Zap size={15} className="text-white" />
          </div>
          VoiceAI
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm text-white/60">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#use-cases" className="hover:text-white transition-colors">Use Cases</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
        </nav>
        <div className="hidden md:flex items-center gap-3">
          <Link href="/login" className="text-sm text-white/70 hover:text-white transition-colors px-4 py-2">Sign in</Link>
          <Link href="/register" className="text-sm bg-violet-500 hover:bg-violet-400 text-white px-4 py-2 rounded-lg font-medium transition-colors">Start free</Link>
        </div>
        <button className="md:hidden text-white/70" onClick={() => setOpen(!open)}>
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
      {open && (
        <div className="md:hidden bg-[#0d0e10] border-t border-white/5 px-6 py-4 space-y-4">
          {["Features", "Use Cases", "Pricing", "FAQ"].map((item) => (
            <a key={item} href={`#${item.toLowerCase().replace(" ", "-")}`} className="block text-white/60 hover:text-white text-sm" onClick={() => setOpen(false)}>{item}</a>
          ))}
          <div className="pt-2 border-t border-white/10 flex flex-col gap-2">
            <Link href="/login" className="text-sm text-white/70 py-2">Sign in</Link>
            <Link href="/register" className="text-sm bg-violet-500 text-white px-4 py-2 rounded-lg text-center font-medium">Start free</Link>
          </div>
        </div>
      )}
    </header>
  );
}
