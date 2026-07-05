"use client";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

const FAQS = [
  { q: "What channels does VoiceAI support?", a: "VoiceAI supports three outreach channels: AI Voice Calls (powered by Twilio + OpenRouter AI), SMS messages (via Twilio), and Email campaigns (via your own SMTP server like Gmail or Outlook). You can create separate campaigns for each channel and target the same or different contact groups." },
  { q: "How do AI voice calls work?", a: "When you start a voice campaign, VoiceAI uses Twilio to dial each contact. When connected, OpenRouter's free AI models handle the conversation in real time using your script and instructions. Every word is transcribed, and after the call ends, an AI summary, sentiment score, and outcome are automatically generated." },
  { q: "Do I need a paid AI subscription?", a: "No. VoiceAI uses OpenRouter which offers genuinely free AI models including Llama 3.1, Mistral 7B, Gemma 2, and more. You just need a free OpenRouter account — no credit card required. Add your free API key in Settings." },
  { q: "How do SMS campaigns work?", a: "Create an SMS campaign, write your message using template variables like {{name}} and {{company}}, select your contact groups, and hit Start. VoiceAI sends personalized SMS to every contact's phone number via Twilio. Delivery status is tracked per contact." },
  { q: "How do email campaigns work?", a: "Create an email campaign, write your subject and HTML body with personalization variables, select your contact groups, and hit Start. VoiceAI sends emails via your configured SMTP server (Gmail, Outlook, SendGrid, etc.). Contacts without email addresses are automatically skipped." },
  { q: "Can I import contacts from a file?", a: "Yes. Upload CSV, Excel (.xlsx), PDF, or TXT files — or paste contact data directly. VoiceAI extracts names, phones, emails, and company info automatically. Organize contacts into named groups so different campaigns can target different audiences." },
  { q: "What happens if a call doesn't connect?", a: "If a call goes to voicemail or isn't answered, the contact status is updated and the campaign continues with the next contact. Every outcome including error messages is visible in the campaign detail page." },
  { q: "Do I need Twilio for SMS and calls?", a: "Yes. Twilio is required for Voice Calls and SMS. They offer a free trial with approximately $15 credit — enough for hundreds of calls and thousands of SMS messages. Add your Twilio credentials in the .env.local file or Settings page." },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section id="faq" className="py-28 px-6 border-t border-white/5">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-xs font-semibold text-violet-400 uppercase tracking-widest mb-3">FAQ</p>
          <h2 className="text-4xl md:text-5xl font-extrabold leading-tight mb-4">Common questions</h2>
          <p className="text-white/50 font-light">Everything you need to know about Voice Calls, SMS, and Email campaigns.</p>
        </div>
        <div className="space-y-2">
          {FAQS.map(({ q, a }, i) => (
            <div key={i} className="border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 transition-colors">
              <button onClick={() => setOpen(open === i ? null : i)} className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-white/[0.02] transition-colors gap-4">
                <span className="text-sm font-semibold text-white leading-relaxed">{q}</span>
                <ChevronDown size={18} className={`text-white/40 shrink-0 transition-transform duration-200 ${open === i ? "rotate-180" : ""}`} />
              </button>
              {open === i && (
                <div className="px-6 pb-5 border-t border-white/5 pt-4 text-sm text-white/50 leading-relaxed font-light">{a}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
