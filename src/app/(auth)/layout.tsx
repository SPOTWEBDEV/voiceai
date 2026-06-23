import Link from "next/link";
import { Zap } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#08090a] flex flex-col">
      <header className="p-6">
        <Link href="/" className="inline-flex items-center gap-2 text-white font-bold">
          <div className="w-7 h-7 rounded-lg bg-violet-500 flex items-center justify-center"><Zap size={15} className="text-white" /></div>
          VoiceAI
        </Link>
      </header>
      <main className="flex-1 flex items-center justify-center px-6 py-12">{children}</main>
    </div>
  );
}
