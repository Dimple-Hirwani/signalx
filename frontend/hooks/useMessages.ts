"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { conversationApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import type { Message } from "@/types/message";

export function useMessages(conversationId: string | null) {
  const token = useAuthStore((s) => s.token);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Maps tempId → realId for in-flight optimistic messages.
  // Populated by replaceMessage (when REST returns) so that appendIncoming
  // can recognise the WS echo that races with the HTTP response.
  const tempToReal = useRef<Map<string, string>>(new Map());

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

  const addMessage = useCallback((msg: Message) => {
    setMessages((prev) => [...prev, msg]);
  }, []);

  // Called when REST 201 returns.
  // Registers tempId→realId BEFORE updating state so that any concurrent
  // appendIncoming call (WS echo) can find the mapping.
  const replaceMessage = useCallback((tempId: string, confirmed: Message) => {
    tempToReal.current.set(tempId, confirmed.id);
    setMessages((prev) => {
      // If the WS echo already appended the real message, just remove the temp
      const hasReal = prev.some((m) => m.id === confirmed.id);
      if (hasReal) {
        return prev.filter((m) => m.id !== tempId);
      }
      // Normal case: swap temp → confirmed
      return prev.map((m) => (m.id === tempId ? confirmed : m));
    });
  }, []);

  const removeMessage = useCallback((id: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== id));
  }, []);

  // Called for every incoming WS message frame.
  // Three cases:
  //   A) id already in state (own echo arrived after replaceMessage) → skip
  //   B) id matches a pending real id (own echo arrived before replaceMessage)
  //      → replace the temp entry in-place
  //   C) genuinely new message from another user → append
  const appendIncoming = useCallback((msg: Message) => {
    setMessages((prev) => {
      // Case A: already present (replaceMessage ran first)
      if (prev.some((m) => m.id === msg.id)) return prev;

      // Case B: WS echo arrived before replaceMessage — find the temp entry
      // by scanning tempToReal values for this real id
      for (const [tempId, realId] of tempToReal.current.entries()) {
        if (realId === msg.id) {
          // Replace temp with the WS-delivered confirmed message
          tempToReal.current.delete(tempId);
          return prev.map((m) => (m.id === tempId ? msg : m));
        }
      }

      // Case C: message from another user
      return [...prev, msg];
    });
  }, []);

  // Update receipt_status of an existing message in-place (for receipt frames)
  const updateReceiptStatus = useCallback(
    (messageId: string, receiptStatus: Message["receipt_status"]) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId ? (Object.assign({}, m, { receipt_status: receiptStatus }) as Message) : m
        )
      );
    },
    []
  );

  return {
    messages,
    isLoading,
    error,
    addMessage,
    replaceMessage,
    removeMessage,
    appendIncoming,
    updateReceiptStatus,
  };
}
