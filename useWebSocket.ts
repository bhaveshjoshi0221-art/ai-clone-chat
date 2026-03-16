"use client";

import { useEffect, useRef } from "react";
import { chatSocket, type WsEvent } from "@/lib/socket";
import { useChatStore } from "@/store/chatStore";
import type { MessageOut } from "@/lib/api";

export function useWebSocket(conversationId: string | null) {
  const token = useChatStore((s) => s.token);
  const appendMessage = useChatStore((s) => s.appendMessage);
  const setTyping = useChatStore((s) => s.setTyping);
  const setPresence = useChatStore((s) => s.setPresence);

  const typingTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  useEffect(() => {
    if (!conversationId || !token) return;

    chatSocket.connect(conversationId, token);

    const onMessage = (e: WsEvent) => {
      const msg = e as unknown as MessageOut & { type: string };
      appendMessage({
        id: msg.id,
        conversation_id: msg.conversation_id,
        sender_user_id: msg.sender_user_id,
        sender_clone_id: msg.sender_clone_id,
        sender_username: msg.sender_username,
        content: msg.content,
        is_ai_generated: msg.is_ai_generated ?? false,
        reply_to_id: msg.reply_to_id,
        seen_by: msg.seen_by ?? [],
        created_at: msg.created_at,
      });
    };

    const onTyping = (e: WsEvent) => {
      const userId = e.user_id as string;
      if (!userId) return;
      setTyping(conversationId, userId, true);
      // Auto-clear after 4 s
      clearTimeout(typingTimers.current[userId]);
      typingTimers.current[userId] = setTimeout(() => {
        setTyping(conversationId, userId, false);
      }, 4000);
    };

    const onStopTyping = (e: WsEvent) => {
      const userId = e.user_id as string;
      if (!userId) return;
      clearTimeout(typingTimers.current[userId]);
      setTyping(conversationId, userId, false);
    };

    const onPresence = (e: WsEvent) => {
      setPresence(e.user_id as string, e.online as boolean);
    };

    chatSocket.on("message", onMessage);
    chatSocket.on("clone_message", onMessage);
    chatSocket.on("typing", onTyping);
    chatSocket.on("stop_typing", onStopTyping);
    chatSocket.on("presence", onPresence);

    return () => {
      chatSocket.off("message", onMessage);
      chatSocket.off("clone_message", onMessage);
      chatSocket.off("typing", onTyping);
      chatSocket.off("stop_typing", onStopTyping);
      chatSocket.off("presence", onPresence);
      chatSocket.disconnect();
    };
  }, [conversationId, token]);
}
