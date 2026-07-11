"use client";

import type { Message } from "@/types/message";

interface Props {
  message: Message;
  isOwn: boolean;
  showSenderName: boolean; // true for group conversations
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
  if (sameDay) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return d.toLocaleDateString([], { day: "numeric", month: "short" }) +
    " " + d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function AttachmentChip({ mime, name, size }: { mime: string; name: string; size: number }) {
  const isImage = mime.startsWith("image/");
  return (
    <div className="flex items-center gap-2 mt-1 px-2 py-1.5 rounded-md bg-black/10 dark:bg-white/10 text-xs">
      {isImage ? (
        <svg className="h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ) : (
        <svg className="h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
        </svg>
      )}
      <span className="truncate max-w-[160px]">{name}</span>
      <span className="flex-shrink-0 opacity-70">{formatBytes(size)}</span>
    </div>
  );
}

export function MessageBubble({ message, isOwn, showSenderName }: Props) {
  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"} px-4 py-0.5 group`}>
      <div className={`max-w-[70%] min-w-0 ${isOwn ? "items-end" : "items-start"} flex flex-col`}>
        {/* Sender name — groups only, non-own messages */}
        {showSenderName && !isOwn && (
          <span className="text-xs font-semibold text-primary mb-1 px-1">
            {message.sender_name}
          </span>
        )}

        <div
          className={`rounded-2xl px-3 py-2 text-sm break-words ${
            isOwn
              ? "bg-primary text-primary-foreground rounded-br-sm"
              : "bg-muted text-foreground rounded-bl-sm"
          }`}
        >
          {/* Reply indicator */}
          {message.reply_to && (
            <div
              className={`mb-1.5 px-2 py-1 rounded-md border-l-2 text-xs opacity-80 ${
                isOwn
                  ? "border-primary-foreground/50 bg-black/10"
                  : "border-primary bg-background/50"
              }`}
            >
              <p className="font-semibold truncate">{message.reply_to.sender_name}</p>
              <p className="truncate opacity-90">{message.reply_to.content_preview}</p>
            </div>
          )}

          {/* Message text */}
          {message.content && (
            <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
          )}

          {/* Attachments */}
          {message.attachments.map((att) => (
            <AttachmentChip
              key={att.id}
              mime={att.mime_type}
              name={att.file_name}
              size={att.file_size_bytes}
            />
          ))}
        </div>

        {/* Timestamp */}
        <span className="text-[10px] text-muted-foreground mt-0.5 px-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {formatTime(message.created_at)}
        </span>
      </div>
    </div>
  );
}
