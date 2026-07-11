import { create } from "zustand";
import type { Conversation } from "@/types/conversation";

interface ConversationState {
  conversations: Conversation[];
  selectedId: string | null;
  isLoading: boolean;
  error: string | null;
  setConversations: (list: Conversation[]) => void;
  setSelected: (id: string | null) => void;
  setLoading: (v: boolean) => void;
  setError: (msg: string | null) => void;
  updatePreview: (id: string, lastMessage: string, lastMessageAt: string) => void;
}

export const useConversationStore = create<ConversationState>((set) => ({
  conversations: [],
  selectedId: null,
  isLoading: false,
  error: null,
  setConversations: (list) => set({ conversations: list, isLoading: false, error: null }),
  setSelected: (id) => set({ selectedId: id }),
  setLoading: (v) => set({ isLoading: v }),
  setError: (msg) => set({ error: msg, isLoading: false }),
  updatePreview: (id, lastMessage, lastMessageAt) =>
    set((state) => ({
      conversations: state.conversations
        .map((c) =>
          c.id === id ? { ...c, last_message: lastMessage, last_message_at: lastMessageAt } : c
        )
        .sort((a, b) => {
          const ta = a.last_message_at ? new Date(a.last_message_at).getTime() : 0;
          const tb = b.last_message_at ? new Date(b.last_message_at).getTime() : 0;
          return tb - ta;
        }),
    })),
}));
