"use client";

import { ConversationItem } from "./ConversationItem";
import type { Conversation } from "@/types/conversation";

interface Props {
  conversations: Conversation[];
  isLoading: boolean;
  error: string | null;
  query: string;
}

function Skeleton() {
  return (
    <div className="flex items-center gap-3 px-3 py-3 animate-pulse">
      <div className="h-10 w-10 rounded-full bg-muted flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3 bg-muted rounded w-2/3" />
        <div className="h-3 bg-muted rounded w-1/2" />
      </div>
    </div>
  );
}

export function ConversationList({ conversations, isLoading, error, query }: Props) {
  if (isLoading) {
    return (
      <div className="flex-1 overflow-y-auto px-2 py-1">
        {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} />)}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center px-4">
        <p className="text-sm text-destructive text-center">{error}</p>
      </div>
    );
  }

  const filtered = query
    ? conversations.filter((c) =>
        c.name.toLowerCase().includes(query.toLowerCase())
      )
    : conversations;

  if (filtered.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center px-4">
        <p className="text-sm text-muted-foreground text-center">
          {query ? "No conversations match your search" : "No conversations yet"}
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-2 py-1">
      {filtered.map((conv) => (
        <ConversationItem key={conv.id} conv={conv} />
      ))}
    </div>
  );
}
