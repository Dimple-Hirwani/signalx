"use client";

import { useEffect } from "react";
import { conversationApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { useConversationStore } from "@/store/conversation";

export function useConversations() {
  const token = useAuthStore((s) => s.token);
  const { conversations, isLoading, error, setConversations, setLoading, setError } =
    useConversationStore();

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    conversationApi
      .list(token)
      .then(setConversations)
      .catch((e: unknown) =>
        setError(e instanceof Error ? e.message : "Failed to load conversations")
      );
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  return { conversations, isLoading, error };
}
