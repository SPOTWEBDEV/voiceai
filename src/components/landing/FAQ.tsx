"use client";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

const FAQS = [
  { q: "How does the AI actually make phone calls?", a: "VoiceAI integrates with Twilio to dial contacts. When the call connects, OpenAI's text-to-speech reads your script, and Whisper transcribes what the contact says. GPT-4o then generates the AI's next response in real time — creating a natural, two-way voice conversation." },
  { q: "Can I upload a CSV file with my contacts?", a: "Yes. Upload a CSV or Excel file and we'll extract name, phone number, email, company, and any notes. The only required column is a phone number. Everything else is optional but improves the AI's context." },
  { q: "Can I customise what the AI says?", a: "Completely. You write the opening script (what the AI says first), and the system prompt (how the AI should behave, what information it has, what it should collect). You can also paste a knowledge base — product FAQs, pricing, objection handling — that the AI references mid-call." },
  { q: "Can I review what happened on each call?", a: "Every call produces a full transcript, an AI-generated summary, a sentiment score, an outcome label (interested / not interested / callback requested), and a suggested next action. All of this is visible in your dashboard immediately after the call ends." },
  { q: "Does it support languages other than English?", a: "English is fully supported today. Multi-language support — including Spanish, French, and Portuguese — is on the near-term roadmap." },
  { q: "What happens if the contact doesn't answer?", a: "If the call goes to voicemail or isn't answered, the contact's status is updated accordingly. You can configure re-attempt logic in your campaign settings." },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section id="faq" className="py-24 px-6 border-t border-white/5">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-xs font-medium text-violet-400 uppercase tracking-widest mb-3">FAQ</p>
          <h2 className="text-3xl md:text-4xl font-bold">Common questions</h2>
        </div>
        <div className="space-y-2">
          {FAQS.map(({ q, a }, i) => (
            <div key={i} className="border border-white/5 rounded-2xl overflow-hidden">
              <button onClick={() => setOpen(open === i ? null : i)} className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-white/[0.02] transition-colors">
                <span className="text-sm font-medium text-white pr-4">{q}</span>
                <ChevronDown size={18} className={`text-white/40 shrink-0 transition-transform ${open === i ? "rotate-180" : ""}`} />
              </button>
              {open === i && <div className="px-6 pb-5 text-sm text-white/50 leading-relaxed border-t border-white/5 pt-4">{a}</div>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
