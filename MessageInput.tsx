"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp, Smile } from "lucide-react";
import { chatSocket } from "@/lib/socket";
import clsx from "clsx";

interface Props {
  onSend: (content: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function MessageInput({ onSend, disabled = false, placeholder = "Message…" }: Props) {
  const [value, setValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTyping = useRef(false);

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 120) + "px";
  }, [value]);

  // Emit typing indicators
  const handleTypingSignal = useCallback(() => {
    if (!isTyping.current) {
      isTyping.current = true;
      chatSocket.sendTyping(true);
    }
    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      isTyping.current = false;
      chatSocket.sendTyping(false);
    }, 2500);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    if (e.target.value.trim()) handleTypingSignal();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const submit = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    // Stop typing signal
    if (typingTimer.current) clearTimeout(typingTimer.current);
    isTyping.current = false;
    chatSocket.sendTyping(false);
    setValue("");
    onSend(trimmed);
  };

  const hasContent = value.trim().length > 0;

  return (
    <div
      className={clsx(
        "flex items-end gap-3 px-4 py-3 mx-3 mb-3 rounded-[24px] transition-all duration-200",
        "bg-card border",
        isFocused
          ? "border-violet/50 shadow-input-focus"
          : "border-border",
      )}
    >
      {/* Emoji button */}
      <button
        type="button"
        className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full text-dim hover:text-soft transition-colors mb-0.5"
      >
        <Smile size={18} />
      </button>

      {/* Textarea */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        rows={1}
        disabled={disabled}
        placeholder={placeholder}
        className={clsx(
          "flex-1 resize-none bg-transparent text-[14.5px] font-[450]",
          "text-light placeholder:text-muted leading-relaxed",
          "focus:outline-none max-h-[120px] min-h-[24px]",
          "scrollbar-hide overflow-y-auto",
          disabled && "opacity-40 cursor-not-allowed"
        )}
        style={{ scrollbarWidth: "none" }}
      />

      {/* Send button */}
      <AnimatePresence mode="wait">
        {hasContent ? (
          <motion.button
            key="send"
            type="button"
            onClick={submit}
            disabled={disabled}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.6, opacity: 0 }}
            transition={{ duration: 0.15, ease: "backOut" }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            className={clsx(
              "flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center mb-0.5",
              "bg-bubble-me shadow-violet-glow/40",
              "disabled:opacity-40 disabled:cursor-not-allowed"
            )}
          >
            <ArrowUp size={17} strokeWidth={2.5} className="text-white" />
          </motion.button>
        ) : (
          <motion.div
            key="placeholder"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.12 }}
            className="flex-shrink-0 w-9 h-9 rounded-full border border-border flex items-center justify-center mb-0.5"
          >
            <ArrowUp size={17} strokeWidth={2} className="text-muted" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
