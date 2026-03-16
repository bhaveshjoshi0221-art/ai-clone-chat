const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = typeof window !== "undefined"
    ? localStorage.getItem("access_token")
    : null;

  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers ?? {}),
    },
  });

  if (!res.ok) {
    const detail = await res.json().catch(() => ({ detail: res.statusText }));
    throw new ApiError(res.status, detail.detail ?? "Request failed");
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

// ── Auth ────────────────────────────────────────────────────────────────

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface UserOut {
  id: string;
  username: string;
  email: string;
  avatar_url: string | null;
  is_online: boolean;
}

export const api = {
  // Auth
  register: (body: { username: string; email: string; password: string }) =>
    request<TokenResponse>("/api/v1/users/register", { method: "POST", body: JSON.stringify(body) }),

  login: (body: { email: string; password: string }) =>
    request<TokenResponse>("/api/v1/users/login", { method: "POST", body: JSON.stringify(body) }),

  refresh: (refresh_token: string) =>
    request<TokenResponse>("/api/v1/auth/refresh", { method: "POST", body: JSON.stringify({ refresh_token }) }),

  // Users
  me: () => request<UserOut>("/api/v1/users/me"),
  listUsers: () => request<UserOut[]>("/api/v1/users/"),
  getUser: (id: string) => request<UserOut>(`/api/v1/users/${id}`),

  // Conversations
  listConversations: () =>
    request<ConversationOut[]>("/api/v1/chats/"),

  createDirect: (target_user_id: string) =>
    request<ConversationOut>("/api/v1/chats/direct", {
      method: "POST",
      body: JSON.stringify({ target_user_id }),
    }),

  getMessages: (conversationId: string, limit = 50, before_id?: string) => {
    const qs = new URLSearchParams({ limit: String(limit) });
    if (before_id) qs.set("before_id", before_id);
    return request<MessageOut[]>(`/api/v1/chats/${conversationId}/messages?${qs}`);
  },

  // Groups
  createGroup: (body: { name: string; member_ids: string[] }) =>
    request<ConversationOut>("/api/v1/groups/", { method: "POST", body: JSON.stringify(body) }),

  // Clones
  myClone: () => request<CloneOut>("/api/v1/clones/me"),
};

// ── Types ────────────────────────────────────────────────────────────────

export interface ConversationOut {
  id: string;
  type: "direct" | "group" | "training";
  name: string | null;
  created_at: string;
}

export interface MessageOut {
  id: string;
  conversation_id: string;
  sender_user_id: string | null;
  sender_clone_id: string | null;
  sender_username: string;
  content: string;
  is_ai_generated: boolean;
  reply_to_id: string | null;
  seen_by: string[];
  created_at: string;
}

export interface CloneOut {
  id: string;
  user_id: string;
  name: string;
  personality_prompt: string;
  style_vector: Record<string, unknown>;
  training_turns: number;
  is_active: boolean;
  updated_at: string;
}

export { ApiError };
