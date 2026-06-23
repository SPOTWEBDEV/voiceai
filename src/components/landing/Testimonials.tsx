const TESTIMONIALS = [
  { quote: "We used to have two SDRs doing nothing but cold calls. Now VoiceAI handles the first touch for our entire prospect list and surfaces only the interested ones. Pipeline quality went up immediately.", name: "Tunde Adeyemi", role: "Head of Sales, Stackline NG", initials: "TA", color: "bg-violet-500" },
  { quote: "I was sceptical that AI could do recruiting calls. Then I watched a transcript where it handled a tricky question about salary range better than some of my junior recruiters. Genuinely impressed.", name: "Nneka Okafor", role: "Talent Director, TalentBridge Africa", initials: "NO", color: "bg-fuchsia-500" },
  { quote: "Our agents were spending 40% of their time chasing buyers who had already gone cold. VoiceAI re-qualifies the whole list overnight and we just deal with the ones that responded positively.", name: "Emeka Chukwu", role: "CEO, Prime Properties Abuja", initials: "EC", color: "bg-blue-500" },
];

export default function Testimonials() {
  return (
    <section className="py-24 px-6 border-t border-white/5">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-xl mx-auto mb-16">
          <p className="text-xs font-medium text-violet-400 uppercase tracking-widest mb-3">Testimonials</p>
          <h2 className="text-3xl md:text-4xl font-bold">Teams that switched don&apos;t go back</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {TESTIMONIALS.map(({ quote, name, role, initials, color }) => (
            <div key={name} className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 flex flex-col gap-5">
              <div className="flex gap-1">{[...Array(5)].map((_, i) => <span key={i} className="text-violet-400 text-sm">★</span>)}</div>
              <p className="text-sm text-white/60 leading-relaxed flex-1">&ldquo;{quote}&rdquo;</p>
              <div className="flex items-center gap-3 pt-3 border-t border-white/5">
                <div className={`w-9 h-9 rounded-full ${color} flex items-center justify-center text-xs font-bold text-white`}>{initials}</div>
                <div>
                  <div className="text-sm font-semibold text-white">{name}</div>
                  <div className="text-xs text-white/40">{role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
