"use client";

import { useRef, useState } from "react";
import type { Message } from "@/types/message";

interface Props {
  conversationId: string;
  currentUserId: string;
  currentUserName: string;
  onOptimisticAdd: (msg: Message) => void;
  onConfirmed: (tempId: string, confirmed: Message) => void;
  onRollback: (tempId: string) => void;
  onSendRequest: (content: string) => Promise<Message>;
}

export function MessageComposer({
  conversationId,
  currentUserId,
  currentUserName,
  onOptimisticAdd,
  onConfirmed,
  onRollback,
  onSendRequest,
}: Props) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const trimmed = text.trim();
  const canSend = trimmed.length > 0 && trimmed.length <= 2000 && !sending;

  function autoResize() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }

  async function handleSend() {
    if (!canSend) return;
    const content = trimmed;
    setText("");
    setError(null);
    // Reset textarea height
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    // Build optimistic message with a temp id
    const tempId = `temp-${Date.now()}`;
    const optimistic: Message = {
      id: tempId,
      conversation_id: conversationId,
      sender_id: currentUserId,
      sender_name: currentUserName,
      content,
      message_type: "text",
      reply_to: null,
      attachments: [],
      created_at: new Date().toISOString(),
      receipt_status: "sending",
    };

    onOptimisticAdd(optimistic);
    setSending(true);

    try {
      const confirmed = await onSendRequest(content);
      onConfirmed(tempId, confirmed);
    } catch (e) {
      onRollback(tempId);
      const msg = e instanceof Error ? e.message : "Failed to send";
      setError(msg);
      // Restore the text so the user can retry
      setText(content);
    } finally {
      setSending(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="flex-shrink-0 border-t border-border bg-card px-4 py-3">
      {error && (
        <p className="text-xs text-destructive mb-2 px-1">{error}</p>
      )}
      <div className="flex items-end gap-2">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            autoResize();
          }}
          onKeyDown={handleKeyDown}
          placeholder="Message…"
          rows={1}
          disabled={sending}
          className="flex-1 resize-none rounded-2xl border border-input bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60 transition-opacity"
          style={{ minHeight: "42px", maxHeight: "160px" }}
        />
        <button
          onClick={handleSend}
          disabled={!canSend}
          aria-label="Send message"
          className="flex-shrink-0 h-10 w-10 rounded-full bg-primary flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
        >
          {sending ? (
            <div className="h-4 w-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
          ) : (
            <svg className="h-5 w-5 text-primary-foreground" fill="currentColor" viewBox="0 0 24 24">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          )}
        </button>
      </div>
      {trimmed.length > 1800 && (
        <p className={`text-xs mt-1 px-1 ${trimmed.length > 2000 ? "text-destructive" : "text-muted-foreground"}`}>
          {trimmed.length}/2000
        </p>
      )}
    </div>
  );
}
