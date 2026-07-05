import Link from "next/link";
import { Zap, Phone, MessageSquare, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-white/5 px-6 pt-16 pb-10">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-14">
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2.5 font-bold text-xl mb-4">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                <Zap size={16} className="text-white" />
              </div>
              <span className="font-extrabold">Voice<span className="text-violet-400">AI</span></span>
            </Link>
            <p className="text-white/35 text-sm leading-relaxed max-w-xs font-light">
              The all-in-one outreach platform for AI voice calls, SMS campaigns, and email marketing.
            </p>
            <div className="flex gap-3 mt-5">
              {[{ icon: Phone, color: "text-violet-400 bg-violet-500/10", label: "Voice" }, { icon: MessageSquare, color: "text-green-400 bg-green-500/10", label: "SMS" }, { icon: Mail, color: "text-blue-400 bg-blue-500/10", label: "Email" }].map(({ icon: Icon, color, label }) => (
                <div key={label} className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center`} title={label}>
                  <Icon size={14} className={color.split(" ")[0]} />
                </div>
              ))}
            </div>
          </div>

          {[
            { title: "Product", links: [["#channels", "Channels"], ["#features", "Features"], ["#pricing", "Pricing"], ["#faq", "FAQ"]] },
            { title: "Channels", links: [["#channels", "Voice Call"], ["#channels", "SMS"], ["#channels", "Email"], ["#use-cases", "Use Cases"]] },
            { title: "Account", links: [["/register", "Sign Up Free"], ["/login", "Sign In"], ["/dashboard", "Dashboard"], ["/admin", "Admin Panel"]] },
          ].map(({ title, links }) => (
            <div key={title}>
              <p className="text-xs font-bold text-white/25 uppercase tracking-widest mb-4">{title}</p>
              <ul className="space-y-2.5">
                {links.map(([href, label]) => (
                  <li key={label}>
                    <Link href={href} className="text-sm text-white/40 hover:text-white transition-colors font-light">{label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/25">© {new Date().getFullYear()} VoiceAI. All rights reserved.</p>
          <p className="text-xs text-white/20 font-light">Built with Next.js · Twilio · OpenRouter · Poppins</p>
        </div>
      </div>
    </footer>
  );
}
