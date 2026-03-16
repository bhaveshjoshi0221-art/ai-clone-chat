"use client";

import { motion, AnimatePresence } from "framer-motion";

interface Props {
  username?: string;
  isClone?: boolean;
}

export function TypingIndicator({ username, isClone = false }: Props) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 6, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 4, scale: 0.95 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
        className="flex items-end gap-2 px-4 py-1"
      >
        {/* Avatar placeholder */}
        <div
          className={`
            w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-semibold
            ${isClone
              ? "bg-gradient-to-br from-pink-500 to-rose-600 text-white"
              : "bg-gradient-to-br from-violet-500 to-violet-700 text-white"
            }
          `}
        >
          {username?.[0]?.toUpperCase() ?? "?"}
        </div>

        <div className="flex flex-col gap-0.5">
          {username && (
            <span className="text-[10px] text-dim font-medium pl-1 mb-0.5">
              {username}
              {isClone && (
                <span className="ml-1 text-clone text-[9px] font-semibold tracking-wide uppercase">
                  clone
                </span>
              )}
            </span>
          )}
          <div
            className={`
              flex items-center gap-1 px-4 py-3 rounded-[20px] rounded-bl-[6px]
              ${isClone
                ? "bg-clone/10 border border-clone/20"
                : "bg-surface border border-border"
              }
            `}
          >
            <span className="w-2 h-2 rounded-full bg-dim animate-pulse-dot inline-block" />
            <span className="w-2 h-2 rounded-full bg-dim animate-pulse-dot-2 inline-block" />
            <span className="w-2 h-2 rounded-full bg-dim animate-pulse-dot-3 inline-block" />
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
