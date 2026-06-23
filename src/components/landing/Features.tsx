import { Mic, FileText, Brain, BarChart2, Phone, Clock, Globe, Shield, Zap, MessageSquare, Calendar, Users } from "lucide-react";

const FEATURES = [
  { icon: Phone, title: "Outbound calling", desc: "AI dials your contacts and speaks naturally using text-to-speech." },
  { icon: Mic, title: "Speech-to-text", desc: "Every word your contact says is captured in real time using Whisper." },
  { icon: Brain, title: "GPT-4o conversations", desc: "The AI understands context, handles objections, and follows your script." },
  { icon: FileText, title: "Auto transcripts", desc: "Full conversation transcripts saved automatically to every call record." },
  { icon: BarChart2, title: "AI summaries", desc: "Each call ends with a summary, sentiment score, outcome, and next step." },
  { icon: Users, title: "Contact management", desc: "Import thousands of contacts from CSV or Excel in seconds." },
  { icon: Calendar, title: "Callback scheduling", desc: "AI detects interest and logs callback requests for your team to follow up." },
  { icon: Clock, title: "24/7 availability", desc: "Your AI agent works nights, weekends, and holidays without extra cost." },
  { icon: Shield, title: "TCPA-ready design", desc: "Built-in opt-out handling and compliance hooks from day one." },
  { icon: MessageSquare, title: "Knowledge base", desc: "Paste FAQs and product details — the AI references them mid-call." },
  { icon: Zap, title: "Campaign analytics", desc: "Track call volume, answer rates, outcomes, and lead quality over time." },
  { icon: Globe, title: "Multi-language (soon)", desc: "Support for Spanish, French, Portuguese, and more is on the roadmap." },
];

export default function Features() {
  return (
    <section id="features" className="py-24 px-6 border-t border-white/5">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-xl mx-auto mb-16">
          <p className="text-xs font-medium text-violet-400 uppercase tracking-widest mb-3">Features</p>
          <h2 className="text-3xl md:text-4xl font-bold">Everything you need to run voice campaigns at scale</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="group flex gap-4 p-5 rounded-2xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 hover:border-white/10 transition-all">
              <div className="w-9 h-9 rounded-xl bg-violet-500/10 flex items-center justify-center shrink-0 mt-0.5">
                <Icon size={18} className="text-violet-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm mb-1">{title}</h3>
                <p className="text-xs text-white/50 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
