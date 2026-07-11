"use client";

import { useRouter } from "next/navigation";
import { Avatar } from "@/components/shared/Avatar";
import { useConversationStore } from "@/store/conversation";
import type { Conversation } from "@/types/conversation";

interface Props {
  conversation: Conversation;
}

export function ConversationHeader({ conversation }: Props) {
  const setSelected = useConversationStore((s) => s.setSelected);
  const router = useRouter();

  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card flex-shrink-0">
      {/* Mobile back */}
      <button
        onClick={() => setSelected(null)}
        className="md:hidden p-1 -ml-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        aria-label="Back"
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <Avatar name={conversation.name} src={conversation.avatar_url} size="md" />

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground truncate">{conversation.name}</p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="h-2 w-2 rounded-full bg-emerald-500 flex-shrink-0" />
          <span className="text-xs text-muted-foreground">Online</span>
        </div>
      </div>

      {/* Action icons */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => router.push("/voice")}
          title="Voice call"
          className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
        </button>

        <button
          onClick={() => router.push("/video")}
          title="Video call"
          className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </button>

        <button
          onClick={() => router.push(`/chat/details?id=${conversation.id}`)}
          title="Conversation info"
          className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      </div>

      {/* E2EE badge */}
      <span className="hidden lg:flex items-center gap-1 text-xs text-muted-foreground flex-shrink-0">
        <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd"
            d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
            clipRule="evenodd" />
        </svg>
        End-to-end encrypted
      </span>
    </div>
  );
}
