import { Clock, UserX, AlertTriangle, TrendingDown, DollarSign } from "lucide-react";

const PAINS = [
  { icon: Clock, title: "Hours lost dialing", desc: "Sales reps spend 50%+ of their day on manual outreach that could be automated." },
  { icon: UserX, title: "Follow-ups slip through", desc: "64% of leads are never followed up after the first touchpoint. Revenue walks away." },
  { icon: AlertTriangle, title: "Inconsistent conversations", desc: "Every rep says something different. Quality depends on who picked up the phone today." },
  { icon: TrendingDown, title: "Poor lead qualification", desc: "Your best closers are stuck calling cold contacts who were never going to buy." },
  { icon: DollarSign, title: "Call centers are expensive", desc: "Outbound teams cost $50–120k per seat annually. And they don't work nights or weekends." },
];

export default function Problem() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="max-w-xl mb-16">
          <p className="text-xs font-medium text-violet-400 uppercase tracking-widest mb-3">The problem</p>
          <h2 className="text-3xl md:text-4xl font-bold leading-tight">Manual calling doesn&apos;t scale — and it&apos;s costing you deals</h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {PAINS.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="group bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 hover:border-white/10 rounded-2xl p-6 transition-all">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center mb-4">
                <Icon size={20} className="text-red-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">{title}</h3>
              <p className="text-sm text-white/50 leading-relaxed">{desc}</p>
            </div>
          ))}
          <div className="bg-gradient-to-br from-violet-600/20 to-fuchsia-600/10 border border-violet-500/20 rounded-2xl p-6 flex flex-col justify-center">
            <div className="text-5xl font-bold text-white mb-2">78%</div>
            <p className="text-sm text-white/60 leading-relaxed">of outbound calls go unanswered when dialled by a human. AI can retry intelligently.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
