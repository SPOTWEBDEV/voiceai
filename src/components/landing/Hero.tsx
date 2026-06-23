"use client";
import Link from "next/link";
import { ArrowRight, MessageSquare } from "lucide-react";

const LIVE_CALLS = [
  { name: "James O.", company: "Recruit Co", status: "Interested", time: "0:42", color: "bg-green-500" },
  { name: "Amaka B.", company: "Lagos Realty", status: "Callback set", time: "1:18", color: "bg-violet-500" },
  { name: "David K.", company: "FinServe NG", status: "In progress", time: "0:09", color: "bg-amber-500" },
  { name: "Chisom E.", company: "EduTech Ltd", status: "Voicemail", time: "—", color: "bg-zinc-500" },
];

export default function Hero() {
  return (
    <section className="relative pt-32 pb-24 px-6 overflow-hidden">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-violet-600/10 blur-[120px] pointer-events-none" />
      <div className="max-w-6xl mx-auto relative">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-medium px-3 py-1.5 rounded-full mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
            Now in early access — limited spots available
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.05] mb-6">
            AI calls your{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">customers</span>
            <br />so you don&apos;t have to
          </h1>
          <p className="text-lg md:text-xl text-white/50 leading-relaxed max-w-xl mx-auto mb-10">
            Upload contacts, write your brief, and let AI handle real-time voice conversations at any scale. Every call is transcribed, summarised, and ready to act on.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/register" className="group inline-flex items-center gap-2 bg-violet-500 hover:bg-violet-400 text-white px-6 py-3 rounded-xl font-semibold text-sm transition-all">
              Start your first campaign
              <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <a href="#how-it-works" className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm px-6 py-3 rounded-xl border border-white/10 hover:border-white/20 transition-all">
              See how it works
            </a>
          </div>
        </div>

        <div className="relative max-w-4xl mx-auto">
          <div className="bg-[#0f1012] border border-white/10 rounded-2xl overflow-hidden shadow-2xl shadow-black/50">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
              <div className="w-3 h-3 rounded-full bg-red-500/60" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
              <div className="w-3 h-3 rounded-full bg-green-500/60" />
              <span className="ml-3 text-xs text-white/30">voiceai.app — Active campaigns</span>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-4 gap-3 mb-6">
                {[{ label: "Calls today", value: "1,248" }, { label: "Answered", value: "847" }, { label: "Interested", value: "203" }, { label: "Callbacks", value: "64" }].map((s) => (
                  <div key={s.label} className="bg-white/5 rounded-xl p-3">
                    <div className="text-xl font-bold text-white">{s.value}</div>
                    <div className="text-xs text-white/40 mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>
              <div className="text-xs font-medium text-white/40 uppercase tracking-widest mb-3">Live calls</div>
              <div className="space-y-2">
                {LIVE_CALLS.map((call) => (
                  <div key={call.name} className="flex items-center justify-between bg-white/[0.03] border border-white/5 rounded-xl px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${call.color} ${call.status === "In progress" ? "animate-pulse" : ""}`} />
                      <div>
                        <div className="text-sm font-medium text-white">{call.name}</div>
                        <div className="text-xs text-white/40">{call.company}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-white/40 font-mono">{call.time}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${call.status === "Interested" ? "bg-green-500/15 text-green-400" : call.status === "In progress" ? "bg-amber-500/15 text-amber-400" : call.status === "Callback set" ? "bg-violet-500/15 text-violet-400" : "bg-white/5 text-white/40"}`}>
                        {call.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="absolute -bottom-6 -right-6 hidden lg:block w-64 bg-[#0f1012] border border-white/10 rounded-xl p-4 shadow-xl">
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare size={14} className="text-violet-400" />
              <span className="text-xs font-medium text-white/60">Live transcript</span>
              <span className="ml-auto w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            </div>
            <div className="space-y-2">
              <div className="bg-violet-500/10 rounded-lg px-3 py-2 text-xs text-white/70">Hi James, I&apos;m Alex from Recruit Co calling about a senior role…</div>
              <div className="bg-white/5 rounded-lg px-3 py-2 text-xs text-white/50 ml-4">Yes, I&apos;m open to hearing more actually.</div>
              <div className="bg-violet-500/10 rounded-lg px-3 py-2 text-xs text-white/70">Great! Could I grab a time that works for a quick 15-min call?</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
