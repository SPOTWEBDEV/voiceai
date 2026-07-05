import Link from "next/link";
import { Phone, MessageSquare, Mail, ArrowRight, CheckCircle } from "lucide-react";

const CHANNELS = [
  {
    icon: Phone, type: "Voice Call", tagline: "AI that talks. Humans that close.",
    desc: "Your AI agent calls each contact, holds a natural two-way conversation, handles objections, and logs every outcome — automatically.",
    border: "border-violet-500/30", iconBg: "bg-violet-500/20", iconColor: "text-violet-400",
    badge: "bg-violet-500/15 text-violet-300 border-violet-500/20",
    gradient: "from-violet-600/15 to-purple-600/10",
    features: ["GPT-quality conversations via OpenRouter (free)", "Full call transcript saved automatically", "AI summary + sentiment + outcome per call", "Powered by Twilio — no code needed"],
    stat: "3× more qualified leads vs email alone",
  },
  {
    icon: MessageSquare, type: "SMS", tagline: "98% open rate. Instant delivery.",
    desc: "Send personalized SMS messages to thousands of contacts in seconds. Use template variables to make every message feel 1-on-1.",
    border: "border-green-500/30", iconBg: "bg-green-500/20", iconColor: "text-green-400",
    badge: "bg-green-500/15 text-green-300 border-green-500/20",
    gradient: "from-green-600/15 to-emerald-600/10",
    features: ["Personalize with {{name}}, {{company}}, {{phone}}", "Character counter — know your SMS segments", "Delivery status tracked per contact", "Works with any Twilio-supported number"],
    stat: "98% open rate vs 20% for email",
  },
  {
    icon: Mail, type: "Email", tagline: "Professional emails at scale.",
    desc: "Design HTML emails with personalization variables and send them through your own SMTP — Gmail, Outlook, SendGrid, and more.",
    border: "border-blue-500/30", iconBg: "bg-blue-500/20", iconColor: "text-blue-400",
    badge: "bg-blue-500/15 text-blue-300 border-blue-500/20",
    gradient: "from-blue-600/15 to-cyan-600/10",
    features: ["Full HTML email editor with template support", "Personalize subject + body per contact", "Works with Gmail, Outlook, SendGrid & more", "Sent/failed status tracked per contact"],
    stat: "10× cheaper than dedicated email tools",
  },
];

export default function Channels() {
  return (
    <section id="channels" className="py-28 px-6 border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-xs font-semibold text-violet-400 uppercase tracking-widest mb-3">3 Channels. 1 Platform.</p>
          <h2 className="text-4xl md:text-5xl font-extrabold leading-tight mb-5">
            Reach contacts the way<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-purple-400 to-blue-400">they actually respond</span>
          </h2>
          <p className="text-white/50 text-lg font-light">Every contact is different. Some pick up calls, some read texts, some check email. VoiceAI lets you run all three from one place.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {CHANNELS.map(({ icon: Icon, type, tagline, desc, border, iconBg, iconColor, badge, gradient, features, stat }) => (
            <div key={type} className={`bg-gradient-to-br ${gradient} border ${border} rounded-2xl p-7 flex flex-col hover:scale-[1.02] transition-all duration-300`}>
              <div className="flex items-start justify-between mb-5">
                <div className={`w-12 h-12 ${iconBg} rounded-2xl flex items-center justify-center`}>
                  <Icon size={24} className={iconColor} />
                </div>
                <span className={`text-xs font-bold px-3 py-1 rounded-full border ${badge}`}>{type}</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{tagline}</h3>
              <p className="text-sm text-white/55 leading-relaxed mb-6 font-light flex-1">{desc}</p>
              <ul className="space-y-2.5 mb-6">
                {features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-xs text-white/60">
                    <CheckCircle size={13} className={`${iconColor} mt-0.5 shrink-0`} />{f}
                  </li>
                ))}
              </ul>
              <div className={`border-t ${border} pt-4 mb-4`}>
                <p className={`text-xs font-bold ${iconColor}`}>→ {stat}</p>
              </div>
              <Link href="/register" className={`inline-flex items-center gap-2 text-sm font-semibold ${iconColor} hover:gap-3 transition-all`}>
                Get started <ArrowRight size={14} />
              </Link>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-gradient-to-r from-violet-600/10 via-purple-600/10 to-blue-600/10 border border-white/10 rounded-2xl p-7 flex flex-col md:flex-row items-center justify-between gap-5">
          <div>
            <p className="font-bold text-white text-lg mb-1">Combine channels for maximum reach</p>
            <p className="text-white/50 text-sm font-light">Call first → SMS if no answer → Email interested leads. All in separate campaigns, one platform.</p>
          </div>
          <Link href="/register" className="shrink-0 inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white px-6 py-3 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-violet-500/20 whitespace-nowrap">
            Start free <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </section>
  );
}
