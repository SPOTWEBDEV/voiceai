import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function CTA() {
  return (
    <section className="py-24 px-6 border-t border-white/5">
      <div className="max-w-3xl mx-auto text-center">
        <div className="relative inline-block mb-8">
          <div className="absolute inset-0 bg-violet-500/20 blur-3xl rounded-full" />
          <h2 className="relative text-4xl md:text-5xl font-bold leading-tight">Start your first AI calling campaign today</h2>
        </div>
        <p className="text-white/50 text-lg mb-10 max-w-lg mx-auto">Join teams already using VoiceAI to turn contact lists into qualified pipeline — without lifting the phone.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/register" className="group inline-flex items-center justify-center gap-2 bg-violet-500 hover:bg-violet-400 text-white px-8 py-4 rounded-xl font-semibold transition-all">
            Get started free
            <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <a href="mailto:hello@voiceai.app" className="inline-flex items-center justify-center gap-2 text-white/60 hover:text-white border border-white/10 hover:border-white/20 px-8 py-4 rounded-xl text-sm font-medium transition-all">
            Talk to the team
          </a>
        </div>
        <p className="text-xs text-white/30 mt-6">14-day free trial · No credit card required · Cancel anytime</p>
      </div>
    </section>
  );
}
