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
}));
