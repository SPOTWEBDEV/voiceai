import Link from "next/link";
import { Check } from "lucide-react";

const PLANS = [
  { name: "Starter", price: "$49", period: "/mo", desc: "For individuals and small teams getting started with AI outreach.", calls: "1,000 calls/month", features: ["CSV & Excel import", "1 active campaign", "Basic analytics", "Call transcripts", "AI call summaries", "Email support"], cta: "Start free trial", highlight: false },
  { name: "Growth", price: "$149", period: "/mo", desc: "For growing teams that need volume, reporting, and customisation.", calls: "10,000 calls/month", features: ["Everything in Starter", "Unlimited campaigns", "Advanced analytics", "Custom AI voices", "Knowledge base per campaign", "Priority support"], cta: "Start free trial", highlight: true },
  { name: "Enterprise", price: "Custom", period: "", desc: "For organisations that need unlimited scale and dedicated support.", calls: "Unlimited calls", features: ["Everything in Growth", "Dedicated account manager", "Custom integrations", "SLA guarantee", "GDPR & TCPA compliance pack", "Team accounts"], cta: "Contact us", highlight: false },
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-24 px-6 border-t border-white/5">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-xl mx-auto mb-16">
          <p className="text-xs font-medium text-violet-400 uppercase tracking-widest mb-3">Pricing</p>
          <h2 className="text-3xl md:text-4xl font-bold">Straightforward pricing, no surprises</h2>
          <p className="text-white/50 mt-4 text-sm">14-day free trial on all plans. No credit card required.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-4 items-start">
          {PLANS.map(({ name, price, period, desc, calls, features, cta, highlight }) => (
            <div key={name} className={`relative rounded-2xl p-6 border flex flex-col gap-6 ${highlight ? "bg-violet-600/10 border-violet-500/40 shadow-lg shadow-violet-500/10" : "bg-white/[0.02] border-white/5"}`}>
              {highlight && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-violet-500 text-white text-xs font-semibold px-3 py-1 rounded-full">Most popular</div>}
              <div>
                <div className="text-sm font-semibold text-white/60 mb-1">{name}</div>
                <div className="flex items-end gap-1 mb-2">
                  <span className="text-4xl font-bold text-white">{price}</span>
                  <span className="text-white/40 text-sm mb-1">{period}</span>
                </div>
                <p className="text-xs text-white/40 leading-relaxed">{desc}</p>
              </div>
              <div className="bg-white/5 rounded-xl px-4 py-2.5 text-sm font-medium text-white/70">{calls}</div>
              <ul className="space-y-2.5 flex-1">
                {features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-white/60">
                    <Check size={15} className="text-violet-400 mt-0.5 shrink-0" />{f}
                  </li>
                ))}
              </ul>
              <Link href="/register" className={`text-center py-3 rounded-xl text-sm font-semibold transition-all ${highlight ? "bg-violet-500 hover:bg-violet-400 text-white" : "bg-white/5 hover:bg-white/10 text-white/80 border border-white/10"}`}>{cta}</Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
