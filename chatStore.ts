import { create } from "zustand";
import type { MessageOut, ConversationOut, UserOut } from "@/lib/api";

interface TypingState {
  [userId: string]: boolean;
}

interface ChatState {
  // Auth
  token: string | null;
  currentUser: UserOut | null;
  setAuth: (token: string, user: UserOut) => void;
  clearAuth: () => void;

  // Conversations
  conversations: ConversationOut[];
  activeConversationId: string | null;
  setConversations: (convs: ConversationOut[]) => void;
  setActiveConversation: (id: string | null) => void;

  // Messages (keyed by conversation_id)
  messages: Record<string, MessageOut[]>;
  setMessages: (conversationId: string, msgs: MessageOut[]) => void;
  appendMessage: (msg: MessageOut) => void;
  prependMessages: (conversationId: string, msgs: MessageOut[]) => void;

  // Typing
  typing: Record<string, TypingState>;
  setTyping: (conversationId: string, userId: string, isTyping: boolean) => void;

  // Online presence (userId → online)
  presence: Record<string, boolean>;
  setPresence: (userId: string, online: boolean) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  // ── Auth ────────────────────────────────────────────────────────────────
  token: typeof window !== "undefined" ? localStorage.getItem("access_token") : null,
  currentUser: null,

  setAuth: (token, user) => {
    if (typeof window !== "undefined") localStorage.setItem("access_token", token);
    set({ token, currentUser: user });
  },

  clearAuth: () => {
    if (typeof window !== "undefined") localStorage.removeItem("access_token");
    set({ token: null, currentUser: null });
  },

  // ── Conversations ───────────────────────────────────────────────────────
  conversations: [],
  activeConversationId: null,
  setConversations: (conversations) => set({ conversations }),
  setActiveConversation: (id) => set({ activeConversationId: id }),

  // ── Messages ────────────────────────────────────────────────────────────
  messages: {},

  setMessages: (conversationId, msgs) =>
    set((s) => ({ messages: { ...s.messages, [conversationId]: msgs } })),

  appendMessage: (msg) =>
    set((s) => {
      const prev = s.messages[msg.conversation_id] ?? [];
      // Deduplicate
      if (prev.some((m) => m.id === msg.id)) return s;
      return { messages: { ...s.messages, [msg.conversation_id]: [...prev, msg] } };
    }),

  prependMessages: (conversationId, msgs) =>
    set((s) => {
      const existing = s.messages[conversationId] ?? [];
      const existingIds = new Set(existing.map((m) => m.id));
      const fresh = msgs.filter((m) => !existingIds.has(m.id));
      return {
        messages: {
          ...s.messages,
          [conversationId]: [...fresh, ...existing],
        },
      };
    }),

  // ── Typing ───────────────────────────────────────────────────────────────
  typing: {},

  setTyping: (conversationId, userId, isTyping) =>
    set((s) => ({
      typing: {
        ...s.typing,
        [conversationId]: {
          ...(s.typing[conversationId] ?? {}),
          [userId]: isTyping,
        },
      },
    })),

  // ── Presence ─────────────────────────────────────────────────────────────
  presence: {},
  setPresence: (userId, online) =>
    set((s) => ({ presence: { ...s.presence, [userId]: online } })),
}));
