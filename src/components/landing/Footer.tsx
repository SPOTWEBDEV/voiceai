import Link from "next/link";
import { Zap } from "lucide-react";

const LINKS: Record<string, string[]> = {
  Product: ["Features", "Pricing", "Changelog", "Roadmap"],
  Resources: ["Documentation", "API Reference", "Status", "Support"],
  Company: ["About", "Blog", "Careers", "Contact"],
  Legal: ["Privacy Policy", "Terms of Service", "Cookie Policy", "GDPR"],
};

export default function Footer() {
  return (
    <footer className="border-t border-white/5 py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 font-bold text-white mb-4">
              <div className="w-7 h-7 rounded-lg bg-violet-500 flex items-center justify-center"><Zap size={15} className="text-white" /></div>
              VoiceAI
            </Link>
            <p className="text-xs text-white/30 leading-relaxed">AI voice campaigns that call your contacts, qualify leads, and report back.</p>
          </div>
          {Object.entries(LINKS).map(([heading, items]) => (
            <div key={heading}>
              <h4 className="text-xs font-semibold text-white/50 uppercase tracking-widest mb-4">{heading}</h4>
              <ul className="space-y-2.5">
                {items.map((item) => (
                  <li key={item}><Link href="#" className="text-xs text-white/30 hover:text-white/70 transition-colors">{item}</Link></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-white/5 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/20">© 2025 VoiceAI. All rights reserved.</p>
          <p className="text-xs text-white/20">Built with Next.js · Powered by OpenAI & Twilio</p>
        </div>
      </div>
    </footer>
  );
}
