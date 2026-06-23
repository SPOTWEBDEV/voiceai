import { Upload, Settings, PhoneCall, BarChart3 } from "lucide-react";

const STEPS = [
  { icon: Upload, step: "1", title: "Upload your contacts", desc: "Drop a CSV or Excel file. We extract names, phone numbers, emails, and notes automatically." },
  { icon: Settings, step: "2", title: "Configure your AI agent", desc: "Write your objective, opening script, and instructions. Choose a voice. Done in under 5 minutes." },
  { icon: PhoneCall, step: "3", title: "AI makes the calls", desc: "Your AI agent calls each contact, speaks naturally, handles questions, and collects outcomes." },
  { icon: BarChart3, step: "4", title: "Review and act", desc: "Every call lands in your dashboard with a full transcript, AI summary, and next-step suggestion." },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 px-6 border-t border-white/5">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-xl mx-auto mb-16">
          <p className="text-xs font-medium text-violet-400 uppercase tracking-widest mb-3">How it works</p>
          <h2 className="text-3xl md:text-4xl font-bold">Your AI voice team, live in minutes</h2>
        </div>
        <div className="grid md:grid-cols-4 gap-6 relative">
          <div className="hidden md:block absolute top-8 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-transparent via-violet-500/30 to-transparent" />
          {STEPS.map(({ icon: Icon, step, title, desc }) => (
            <div key={step} className="relative text-center">
              <div className="w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mx-auto mb-5 relative z-10">
                <Icon size={24} className="text-violet-400" />
              </div>
              <div className="text-xs font-bold text-violet-500/60 uppercase tracking-widest mb-2">Step {step}</div>
              <h3 className="font-semibold text-white mb-2">{title}</h3>
              <p className="text-sm text-white/50 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
