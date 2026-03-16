"use client";

import { motion } from "framer-motion";
import { Bot } from "lucide-react";
import clsx from "clsx";

interface Props {
  name: string;
  size?: "sm" | "md" | "lg";
  active?: boolean;
  className?: string;
}

const sizes = {
  sm: { outer: "w-8 h-8",   inner: "w-6 h-6",   icon: 12, text: "text-[11px]" },
  md: { outer: "w-12 h-12", inner: "w-10 h-10",  icon: 16, text: "text-[14px]" },
  lg: { outer: "w-16 h-16", inner: "w-14 h-14",  icon: 20, text: "text-[18px]" },
};

export function CloneAvatar({ name, size = "md", active = false, className }: Props) {
  const s = sizes[size];

  return (
    <div className={clsx("relative flex items-center justify-center", s.outer, className)}>
      {/* Animated glow ring */}
      {active && (
        <motion.div
          className={clsx("absolute inset-0 rounded-full border-2 border-clone/60")}
          animate={{ scale: [1, 1.12, 1], opacity: [0.8, 0.3, 0.8] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
      {/* Avatar circle */}
      <div
        className={clsx(
          s.inner,
          "rounded-full flex items-center justify-center",
          "bg-gradient-to-br from-pink-500 via-rose-500 to-pink-700",
          active && "shadow-clone-glow"
        )}
      >
        <Bot size={s.icon} className="text-white" />
      </div>
      {/* Active indicator */}
      {active && (
        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-cyan border-2 border-void" />
      )}
    </div>
  );
}
