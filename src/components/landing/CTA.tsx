import Link from "next/link";
import { ArrowRight, Phone, MessageSquare, Mail } from "lucide-react";

export default function CTA() {
  return (
    <section className="py-28 px-6 border-t border-white/5 bg-white/[0.01]">
      <div className="max-w-4xl mx-auto text-center">
        <div className="relative bg-gradient-to-br from-violet-600/15 via-purple-600/10 to-blue-600/15 border border-violet-500/20 rounded-3xl p-14 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/4 w-64 h-64 bg-violet-600/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl" />
          </div>
          <div className="relative">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-10 h-10 bg-violet-500/20 rounded-xl flex items-center justify-center"><Phone size={18} className="text-violet-400" /></div>
              <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center"><MessageSquare size={18} className="text-green-400" /></div>
              <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center"><Mail size={18} className="text-blue-400" /></div>
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
              Start reaching customers <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-purple-400 to-blue-400">in three powerful ways</span>
            </h2>
            <p className="text-white/50 text-lg font-light mb-8 max-w-xl mx-auto">
              Voice calls that convert. SMS that gets read. Emails that land. All from one platform — free to start.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/register" className="group inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white px-8 py-4 rounded-xl font-bold text-sm transition-all shadow-xl shadow-violet-500/25">
                Get Started Free — No Card Needed
                <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link href="/login" className="inline-flex items-center gap-2 text-white/50 hover:text-white text-sm px-6 py-4 rounded-xl border border-white/10 hover:border-white/20 transition-all font-medium">
                Already have an account? Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
