"use client";

export function MessageComposer() {
  return (
    <div className="flex-shrink-0 border-t border-border bg-card px-4 py-3">
      <div className="flex items-end gap-2">
        <textarea
          disabled
          placeholder="Messaging coming soon…"
          rows={1}
          className="flex-1 resize-none rounded-2xl border border-input bg-muted px-4 py-2.5 text-sm text-muted-foreground placeholder:text-muted-foreground/60 focus:outline-none disabled:cursor-not-allowed"
        />
        <button
          disabled
          className="flex-shrink-0 h-10 w-10 rounded-full bg-primary/40 flex items-center justify-center disabled:cursor-not-allowed"
          aria-label="Send message"
        >
          <svg className="h-5 w-5 text-primary-foreground/60" fill="currentColor" viewBox="0 0 24 24">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
