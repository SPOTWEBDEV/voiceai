const CASES = [
  { industry: "Recruiting", headline: "Screen 500 candidates before your morning coffee", detail: "AI calls applicants, asks qualifying questions, and flags the top 20% for your team to interview.", metric: "4× faster shortlisting" },
  { industry: "Sales", headline: "Turn cold lists into warm pipeline, automatically", detail: "AI introduces your product, handles initial objections, and schedules discovery calls with interested leads.", metric: "3× more qualified meetings" },
  { industry: "Real Estate", headline: "Follow up with every buyer lead, every time", detail: "AI checks in on viewing feedback, gauges interest, and keeps your CRM current without your agents lifting a finger.", metric: "Zero leads fall through the cracks" },
  { industry: "Collections", headline: "Consistent, compliant payment reminders at scale", detail: "AI makes polite follow-up calls, captures payment intentions, and escalates to a human when needed.", metric: "2× recovery rate vs email alone" },
  { industry: "Market Research", headline: "Run surveys by phone without a survey team", detail: "AI calls your sample, asks structured questions, and delivers structured response data ready for analysis.", metric: "10× cheaper than traditional phone surveys" },
  { industry: "Customer Success", headline: "Check in with every customer, not just the loud ones", detail: "AI calls customers post-purchase, collects satisfaction scores, and flags at-risk accounts for your CS team.", metric: "Proactive churn prevention" },
];

export default function UseCases() {
  return (
    <section id="use-cases" className="py-24 px-6 border-t border-white/5">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-xl mx-auto mb-16">
          <p className="text-xs font-medium text-violet-400 uppercase tracking-widest mb-3">Use cases</p>
          <h2 className="text-3xl md:text-4xl font-bold">One platform, six ways to grow</h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {CASES.map(({ industry, headline, detail, metric }) => (
            <div key={industry} className="bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 hover:border-white/10 rounded-2xl p-6 flex flex-col gap-4 transition-all">
              <span className="text-xs font-semibold text-violet-400 uppercase tracking-widest">{industry}</span>
              <h3 className="font-semibold text-white leading-snug">{headline}</h3>
              <p className="text-sm text-white/50 leading-relaxed flex-1">{detail}</p>
              <div className="pt-3 border-t border-white/5 text-xs font-medium text-white/40">→ {metric}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
