"use client";

import { Avatar } from "@/components/shared/Avatar";
import { useConversationStore } from "@/store/conversation";
import type { Conversation } from "@/types/conversation";

interface Props {
  conversation: Conversation;
}

export function ConversationHeader({ conversation }: Props) {
  const setSelected = useConversationStore((s) => s.setSelected);

  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card flex-shrink-0">
      {/* Mobile back button */}
      <button
        onClick={() => setSelected(null)}
        className="md:hidden p-1 -ml-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        aria-label="Back to conversations"
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <Avatar name={conversation.name} src={conversation.avatar_url} size="md" />

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground truncate">{conversation.name}</p>
        <div className="flex items-center gap-1.5 mt-0.5">
          {/* Online placeholder — always shows "Online" for demo */}
          <span className="h-2 w-2 rounded-full bg-emerald-500 flex-shrink-0" />
          <span className="text-xs text-muted-foreground">Online</span>
        </div>
      </div>

      {/* 🔒 E2EE badge */}
      <span className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground flex-shrink-0">
        <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
            clipRule="evenodd"
          />
        </svg>
        End-to-end encrypted
      </span>
    </div>
  );
}
