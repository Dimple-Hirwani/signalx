"use client";

import { Sidebar } from "@/components/sidebar/Sidebar";

export default function ChatPage() {
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />

      {/* Main panel */}
      <main className="flex-1 flex flex-col items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4 text-center px-8">
          <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center">
            <svg
              className="h-10 w-10 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
          <div>
            <p className="text-xl font-semibold text-foreground">Select a conversation</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Choose from your existing conversations on the left
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
