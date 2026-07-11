"use client";

import type { Message } from "@/types/message";

interface Props {
  message: Message;
  isOwn: boolean;
  showSenderName: boolean;
}

// ── Timestamp ────────────────────────────────────────────────────────────────

// Backend stores UTC naive datetimes without a timezone suffix.
// Appending 'Z' forces correct UTC→local parsing in all browsers.
function parseUTC(iso: string): Date {
  return new Date(/[Zz]|[+-]\d{2}:?\d{2}$/.test(iso) ? iso : iso + "Z");
}

function formatTime(iso: string): string {
  const d = parseUTC(iso);
  const now = new Date();

  const dDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffDays = Math.round(
    (todayDate.getTime() - dDate.getTime()) / 86_400_000
  );

  if (diffDays === 0)
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (diffDays === 1) return "Yesterday";
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

// ── Status ticks (Signal style) ───────────────────────────────────────────────

type ReceiptStatus = "sending" | "sent" | "delivered" | "read";

// Single thin check path
const CHECK =
  "M4.5 12.75l6 6 9-13.5";

function StatusTick({ status }: { status: ReceiptStatus }) {
  if (status === "sending") {
    // Clock icon
    return (
      <svg
        className="h-3.5 w-3.5 opacity-70"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
        aria-label="Sending"
      >
        <circle cx="12" cy="12" r="9" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3 3" />
      </svg>
    );
  }

  if (status === "sent") {
    // Single tick
    return (
      <svg
        className="h-3.5 w-3.5 opacity-70"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
        aria-label="Sent"
      >
        <path d={CHECK} />
      </svg>
    );
  }

  // delivered → double tick grey | read → double tick blue
  const colour = status === "read" ? "text-sky-400" : "opacity-70";
  return (
    <svg
      className={`h-3.5 w-3.5 ${colour}`}
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
      aria-label={status === "read" ? "Read" : "Delivered"}
    >
      {/* first tick shifted left */}
      <path d={CHECK} transform="translate(-3,0)" />
      {/* second tick shifted right */}
      <path d={CHECK} transform="translate(3,0)" />
    </svg>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function AttachmentChip({
  mime,
  name,
  size,
}: {
  mime: string;
  name: string;
  size: number;
}) {
  const isImage = mime.startsWith("image/");
  return (
    <div className="flex items-center gap-2 mt-1 px-2 py-1.5 rounded-md bg-black/10 dark:bg-white/10 text-xs">
      {isImage ? (
        <svg
          className="h-4 w-4 flex-shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      ) : (
        <svg
          className="h-4 w-4 flex-shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
          />
        </svg>
      )}
      <span className="truncate max-w-[160px]">{name}</span>
      <span className="flex-shrink-0 opacity-70">{formatBytes(size)}</span>
    </div>
  );
}

// ── MessageBubble ─────────────────────────────────────────────────────────────

export function MessageBubble({ message, isOwn, showSenderName }: Props) {
  return (
    <div
      className={`flex ${isOwn ? "justify-end" : "justify-start"} px-4 py-0.5 group`}
    >
      <div
        className={`max-w-[70%] min-w-0 ${isOwn ? "items-end" : "items-start"} flex flex-col`}
      >
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
              <p className="font-semibold truncate">
                {message.reply_to.sender_name}
              </p>
              <p className="truncate opacity-90">
                {message.reply_to.content_preview}
              </p>
            </div>
          )}

          {/* Message text */}
          {message.content && (
            <p className="whitespace-pre-wrap leading-relaxed">
              {message.content}
            </p>
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

        {/* Timestamp + status tick row */}
        <div
          className={`flex items-center gap-1 mt-0.5 px-1 opacity-0 group-hover:opacity-100 transition-opacity ${
            isOwn ? "flex-row-reverse" : "flex-row"
          }`}
        >
          <span className="text-[10px] text-muted-foreground">
            {formatTime(message.created_at)}
          </span>
          {isOwn && (
            <StatusTick status={message.receipt_status} />
          )}
        </div>
      </div>
    </div>
  );
}
