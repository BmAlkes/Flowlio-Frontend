import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { io, type Socket } from "socket.io-client";
import { backendURL } from "@/configs/axios.config";
import { useUser } from "@/providers/user.provider";

let shared: { socket: Socket; sessionId: string; users: number } | null = null;

/**
 * Keeps one socket per signed-in session and refreshes conversations when the server says something changed.
 * The server authenticates the socket with the session cookie plus this session id.
 */
export function useConversationSocket() {
  const cache = useQueryClient();
  const { data } = useUser();
  const sessionId = (data as { session?: { id?: string } } | undefined)?.session?.id;

  useEffect(() => {
    if (!sessionId || typeof window === "undefined") return;
    if (!shared || shared.sessionId !== sessionId) {
      shared?.socket.disconnect();
      shared = { socket: io(backendURL, { withCredentials: true, auth: { sessionId }, transports: ["websocket", "polling"] }), sessionId, users: 0 };
    }
    const current = shared;
    current.users++;
    const refresh = (payload?: { conversationId?: string }) => {
      void cache.invalidateQueries({ queryKey: ["conversations"] });
      void cache.invalidateQueries({ queryKey: ["conversation-thread"] });
      void cache.invalidateQueries({ queryKey: ["conversation-messages"], predicate: query => !payload?.conversationId || query.queryKey[2] === payload.conversationId });
    };
    current.socket.on("conversation:message", refresh);
    current.socket.on("conversation:changed", refresh);
    return () => {
      current.socket.off("conversation:message", refresh);
      current.socket.off("conversation:changed", refresh);
      current.users--;
      if (current.users <= 0 && shared === current) { current.socket.disconnect(); shared = null; }
    };
  }, [cache, sessionId]);
}
