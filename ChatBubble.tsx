"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { Bot, CheckCheck } from "lucide-react";
import clsx from "clsx";
import type { MessageOut } from "@/lib/api";

interface Props {
  message: MessageOut;
  isMine: boolean;
  showUsername?: boolean;
  currentUserId?: string;
}

export function ChatBubble({ message, isMine, showUsername = false, currentUserId }: Props) {
  const [swiped, setSwiped] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const isClone = message.is_ai_generated;
  const seenByOthers =
    message.seen_by.filter((id) => id !== currentUserId).length > 0;

  // ── Swipe to reveal timestamp ───────────────────────────────────────────
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 40) setSwiped(true);
    else if (diff < -20) setSwiped(false);
    touchStartX.current = null;
  };

  // Desktop hover to show timestamp
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className={clsx(
        "flex items-end gap-2 px-4 py-0.5 group",
        isMine ? "flex-row-reverse" : "flex-row"
      )}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Avatar (others only) */}
      {!isMine && (
        <div
          className={clsx(
            "w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-[11px] font-bold mb-1",
            isClone
              ? "bg-gradient-to-br from-pink-500 to-rose-700 shadow-clone-glow"
              : "bg-gradient-to-br from-violet-500 to-violet-800"
          )}
        >
          {isClone
            ? <Bot size={13} className="text-white" />
            : message.sender_username?.[0]?.toUpperCase() ?? "?"}
        </div>
      )}

      {/* Bubble column */}
      <div className={clsx("flex flex-col max-w-[72%]", isMine ? "items-end" : "items-start")}>
        {/* Username label */}
        {showUsername && !isMine && (
          <span className={clsx(
            "text-[10px] font-semibold mb-0.5 px-1",
            isClone ? "text-clone" : "text-violet-light"
          )}>
            {message.sender_username}
            {isClone && (
              <span className="ml-1 text-[9px] opacity-70 uppercase tracking-wider">AI</span>
            )}
          </span>
        )}

        {/* Wrapper: swipe + timestamp together */}
        <div className="relative flex items-center gap-2">
          {/* Timestamp — appears on swipe (mobile) or hover (desktop) */}
          {!isMine && (
            <motion.span
              animate={{ opacity: swiped || hovered ? 1 : 0, x: swiped || hovered ? 0 : 8 }}
              transition={{ duration: 0.15 }}
              className="absolute -left-14 text-[10px] text-dim whitespace-nowrap pointer-events-none"
            >
              {format(new Date(message.created_at), "HH:mm")}
            </motion.span>
          )}
          {isMine && (
            <motion.span
              animate={{ opacity: swiped || hovered ? 1 : 0, x: swiped || hovered ? 0 : -8 }}
              transition={{ duration: 0.15 }}
              className="absolute -right-14 text-[10px] text-dim whitespace-nowrap pointer-events-none"
            >
              {format(new Date(message.created_at), "HH:mm")}
            </motion.span>
          )}

          {/* Bubble */}
          <div
            className={clsx(
              "relative px-4 py-2.5 text-[14.5px] leading-relaxed font-[450] select-text",
              "transition-all duration-150",
              // Shape: borderless pill, different tail per side
              isMine
                ? "rounded-[20px] rounded-br-[6px] bg-bubble-me text-white shadow-violet-glow/30"
                : isClone
                ? "rounded-[20px] rounded-bl-[6px] bg-bubble-clone text-white shadow-clone-glow/30"
                : "rounded-[20px] rounded-bl-[6px] bg-card text-light border border-border/60",
              // Subtle press scale
              "active:scale-[0.97]"
            )}
          >
            {message.content}
          </div>
        </div>

        {/* Read receipt (mine only) */}
        {isMine && seenByOthers && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-1 mt-0.5 pr-1"
          >
            <CheckCheck size={11} className="text-cyan" />
            <span className="text-[9px] text-cyan">Seen</span>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
