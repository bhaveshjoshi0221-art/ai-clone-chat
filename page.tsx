"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Zap } from "lucide-react";

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    router.replace(token ? "/chats" : "/login");
  }, []);

  return (
    <div className="min-h-screen bg-void flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-bubble-me flex items-center justify-center shadow-violet-glow animate-pulse">
          <Zap size={24} className="text-white" fill="white" />
        </div>
        <p className="text-dim text-[13px]">Loading…</p>
      </div>
    </div>
  );
}
