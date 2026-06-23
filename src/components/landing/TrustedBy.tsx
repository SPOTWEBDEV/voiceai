export default function TrustedBy() {
  const logos = ["Sales Teams", "Recruiting Firms", "Real Estate Agencies", "Fintech Startups", "Market Researchers", "Call Centers"];
  return (
    <section className="border-y border-white/5 py-10 px-6">
      <div className="max-w-6xl mx-auto">
        <p className="text-center text-xs text-white/30 uppercase tracking-widest mb-8">Trusted by teams across industries</p>
        <div className="flex flex-wrap justify-center gap-x-12 gap-y-4">
          {logos.map((name) => (
            <span key={name} className="text-white/20 font-semibold text-sm tracking-wide">{name}</span>
          ))}
        </div>
      </div>
    </section>
  );
}
