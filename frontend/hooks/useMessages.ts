"use client";

import { useEffect, useState } from "react";
import { conversationApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import type { Message } from "@/types/message";

export function useMessages(conversationId: string | null) {
  const token = useAuthStore((s) => s.token);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!conversationId || !token) {
      setMessages([]);
      return;
    }
    setIsLoading(true);
    setError(null);
    conversationApi
      .messages(token, conversationId)
      .then((msgs) => {
        setMessages(msgs);
        setIsLoading(false);
      })
      .catch((e: unknown) => {
        setError(e instanceof Error ? e.message : "Failed to load messages");
        setIsLoading(false);
      });
  }, [conversationId, token]);

  return { messages, isLoading, error };
}
