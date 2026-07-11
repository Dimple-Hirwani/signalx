"use client";

import { Avatar } from "@/components/shared/Avatar";
import { useConversationStore } from "@/store/conversation";
import type { Conversation } from "@/types/conversation";

function formatTime(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86_400_000);
  if (diffDays === 0) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return d.toLocaleDateString([], { weekday: "short" });
  return d.toLocaleDateString([], { day: "numeric", month: "short" });
}

export function ConversationItem({ conv }: { conv: Conversation }) {
  const { selectedId, setSelected } = useConversationStore();
  const isActive = selectedId === conv.id;

  return (
    <button
      onClick={() => setSelected(conv.id)}
      className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-colors ${
        isActive
          ? "bg-primary/10 dark:bg-primary/20"
          : "hover:bg-muted"
      }`}
    >
      <Avatar name={conv.name} src={conv.avatar_url} size="md" />

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-semibold text-foreground truncate">{conv.name}</span>
          <span className="text-xs text-muted-foreground flex-shrink-0">
            {formatTime(conv.last_message_at)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2 mt-0.5">
          <span className="text-xs text-muted-foreground truncate">
            {conv.last_message ?? "No messages yet"}
          </span>
          {conv.unread_count > 0 && (
            <span className="flex-shrink-0 h-5 min-w-5 px-1 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
              {conv.unread_count > 99 ? "99+" : conv.unread_count}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
