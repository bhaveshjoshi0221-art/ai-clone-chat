"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { MessageCircle, Users, Brain, Settings, Zap } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import clsx from "clsx";
import { useChatStore } from "@/store/chatStore";
import { api } from "@/lib/api";

export function Sidebar() {
  const pathname = usePathname();
  const { conversations, setConversations, currentUser, presence } = useChatStore();

  useEffect(() => {
    api.listConversations().then(setConversations).catch(() => {});
  }, []);

  const navItems = [
    { icon: MessageCircle, label: "Chats",    href: "/chats",    key: "chats"    },
    { icon: Users,         label: "Groups",   href: "/groups",   key: "groups"   },
    { icon: Brain,         label: "Training", href: "/training", key: "training" },
    { icon: Settings,      label: "Settings", href: "/settings", key: "settings" },
  ];

  return (
    <aside className="w-[72px] md:w-[260px] h-full glass flex flex-col border-r border-border/50 flex-shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-5 border-b border-border/40">
        <div className="w-8 h-8 rounded-xl bg-bubble-me flex items-center justify-center shadow-violet-glow/50 flex-shrink-0">
          <Zap size={15} className="text-white" fill="white" />
        </div>
        <span className="hidden md:block font-bold text-[15px] tracking-tight text-light">
          Clone<span className="text-violet">Chat</span>
        </span>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-0.5 p-2 border-b border-border/40">
        {navItems.map(({ icon: Icon, label, href }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 group",
                active
                  ? "nav-item-active text-violet-light"
                  : "text-dim hover:text-soft hover:bg-surface"
              )}
            >
              <Icon size={18} strokeWidth={active ? 2.5 : 1.8} className="flex-shrink-0" />
              <span className="hidden md:block text-[13.5px] font-[500]">{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Conversations list */}
      <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
        <p className="hidden md:block text-[10px] uppercase tracking-widest text-muted px-3 py-2 font-semibold">
          Recent
        </p>
        {conversations.map((conv, i) => {
          const active = pathname.includes(conv.id);
          const label = conv.name ?? `Chat ${i + 1}`;
          const initial = label[0]?.toUpperCase() ?? "?";

          return (
            <motion.div
              key={conv.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04, duration: 0.18 }}
            >
              <Link
                href={`/chats/${conv.id}`}
                className={clsx(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 group",
                  active
                    ? "bg-violet/10 border border-violet/20"
                    : "hover:bg-surface"
                )}
              >
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <div className={clsx(
                    "w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-bold",
                    conv.type === "group"
                      ? "bg-gradient-to-br from-cyan/60 to-teal-600"
                      : "bg-gradient-to-br from-violet-500 to-violet-800"
                  )}>
                    {initial}
                  </div>
                  {/* Online dot */}
                  <span className={clsx(
                    "absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-void",
                    presence[conv.id] ? "bg-cyan" : "bg-muted"
                  )} />
                </div>
                {/* Name + time */}
                <div className="hidden md:flex flex-col min-w-0">
                  <span className={clsx(
                    "text-[13px] font-[550] truncate",
                    active ? "text-violet-light" : "text-light"
                  )}>
                    {label}
                  </span>
                  <span className="text-[11px] text-dim truncate">
                    {formatDistanceToNow(new Date(conv.created_at), { addSuffix: true })}
                  </span>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* Current user */}
      {currentUser && (
        <div className="flex items-center gap-3 px-4 py-3 border-t border-border/40">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-violet-800 flex items-center justify-center text-[12px] font-bold flex-shrink-0">
            {currentUser.username[0].toUpperCase()}
          </div>
          <div className="hidden md:flex flex-col min-w-0">
            <span className="text-[12.5px] font-[550] text-light truncate">{currentUser.username}</span>
            <span className="text-[10px] text-cyan font-medium">● Online</span>
          </div>
        </div>
      )}
    </aside>
  );
}
