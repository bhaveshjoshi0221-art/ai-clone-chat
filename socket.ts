const WS_BASE = (process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:8000").replace(/\/$/, "");

export type WsEventType =
  | "message"
  | "clone_message"
  | "typing"
  | "stop_typing"
  | "presence"
  | "seen"
  | "error";

export interface WsEvent {
  type: WsEventType;
  [key: string]: unknown;
}

type Listener = (event: WsEvent) => void;

class ChatSocket {
  private ws: WebSocket | null = null;
  private listeners: Map<WsEventType | "*", Set<Listener>> = new Map();
  private pingInterval: ReturnType<typeof setInterval> | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private currentRoom: string | null = null;
  private token: string | null = null;
  private destroyed = false;

  connect(conversationId: string, token: string) {
    this.destroyed = false;
    this.currentRoom = conversationId;
    this.token = token;
    this._open();
  }

  private _open() {
    if (!this.currentRoom || !this.token) return;
    const url = `${WS_BASE}/ws/chat/${this.currentRoom}?token=${this.token}`;
    this.ws = new WebSocket(url);

    this.ws.onopen = () => {
      this._startPing();
    };

    this.ws.onmessage = (e) => {
      try {
        const data: WsEvent = JSON.parse(e.data);
        this._dispatch(data);
      } catch {/* ignore malformed */}
    };

    this.ws.onclose = () => {
      this._stopPing();
      if (!this.destroyed) {
        this.reconnectTimer = setTimeout(() => this._open(), 3000);
      }
    };

    this.ws.onerror = () => {
      this.ws?.close();
    };
  }

  disconnect() {
    this.destroyed = true;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this._stopPing();
    this.ws?.close();
    this.ws = null;
    this.currentRoom = null;
  }

  send(payload: object) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(payload));
    }
  }

  sendMessage(content: string, reply_to_id?: string) {
    this.send({ type: "message", content, reply_to_id: reply_to_id ?? null });
  }

  sendTyping(is_typing: boolean) {
    this.send({ type: "typing", is_typing });
  }

  sendSeen(message_id: string) {
    this.send({ type: "seen", message_id });
  }

  on(event: WsEventType | "*", listener: Listener) {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event)!.add(listener);
  }

  off(event: WsEventType | "*", listener: Listener) {
    this.listeners.get(event)?.delete(listener);
  }

  private _dispatch(event: WsEvent) {
    this.listeners.get(event.type as WsEventType)?.forEach((l) => l(event));
    this.listeners.get("*")?.forEach((l) => l(event));
  }

  private _startPing() {
    this.pingInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: "ping" }));
      }
    }, 25_000);
  }

  private _stopPing() {
    if (this.pingInterval) clearInterval(this.pingInterval);
    this.pingInterval = null;
  }

  get connected() {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

// Singleton per browser tab
export const chatSocket = new ChatSocket();
