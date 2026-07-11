"use client";

import { useEffect, useRef } from "react";
import { MessageBubble } from "./MessageBubble";
import type { Message } from "@/types/message";

interface Props {
  messages: Message[];
  currentUserId: string;
  isGroup: boolean;
  isLoading: boolean;
  error: string | null;
}

function DateDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 px-4 py-2">
      <div className="flex-1 h-px bg-border" />
      <span className="text-xs text-muted-foreground flex-shrink-0">{label}</span>
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}

function formatDateLabel(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor(
    (now.setHours(0, 0, 0, 0) - d.setHours(0, 0, 0, 0)) / 86_400_000
  );
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return new Date(iso).toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" });
}

function SkeletonBubble({ own }: { own: boolean }) {
  return (
    <div className={`flex ${own ? "justify-end" : "justify-start"} px-4 py-1 animate-pulse`}>
      <div className={`h-8 rounded-2xl bg-muted ${own ? "w-48" : "w-40"}`} />
    </div>
  );
}

export function MessageList({ messages, currentUserId, isGroup, isLoading, error }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom only when user is already near the bottom
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
    if (nearBottom) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (isLoading) {
    return (
      <div className="flex-1 overflow-y-auto py-2 space-y-1">
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonBubble key={i} own={i % 3 === 0} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center px-8">
        <div className="text-center">
          <p className="text-sm text-destructive">{error}</p>
          <p className="text-xs text-muted-foreground mt-1">Try refreshing the page</p>
        </div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center px-8">
        <div className="text-center">
          <p className="text-sm font-medium text-foreground">No messages yet</p>
          <p className="text-xs text-muted-foreground mt-1">Be the first to say something!</p>
        </div>
      </div>
    );
  }

  // Group messages by date for date dividers
  const items: Array<{ type: "date"; label: string } | { type: "message"; message: Message }> = [];
  let lastDateLabel = "";
  for (const msg of messages) {
    const label = formatDateLabel(msg.created_at);
    if (label !== lastDateLabel) {
      items.push({ type: "date", label });
      lastDateLabel = label;
    }
    items.push({ type: "message", message: msg });
  }

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto py-2">
      {items.map((item, idx) =>
        item.type === "date" ? (
          <DateDivider key={`date-${idx}`} label={item.label} />
        ) : (
          <MessageBubble
            key={item.message.id}
            message={item.message}
            isOwn={item.message.sender_id === currentUserId}
            showSenderName={isGroup}
          />
        )
      )}
      <div ref={bottomRef} />
    </div>
  );
}
