"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SearchBar } from "./SearchBar";
import { ConversationList } from "./ConversationList";
import { UserProfile } from "./UserProfile";
import { useConversations } from "@/hooks/useConversations";

export function Sidebar() {
  const [query, setQuery] = useState("");
  const { conversations, isLoading, error } = useConversations();
  const router = useRouter();

  return (
    <aside className="flex flex-col w-80 flex-shrink-0 border-r border-border bg-card h-screen">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-border">
        <h1 className="text-lg font-bold text-foreground">SignalX</h1>
        <div className="flex items-center gap-1">
          {/* Stories */}
          <button
            onClick={() => router.push("/stories")}
            title="Stories"
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
          {/* Linked Devices */}
          <button
            onClick={() => router.push("/devices")}
            title="Linked Devices"
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Search */}
      <SearchBar value={query} onChange={setQuery} />

      {/* Conversation list */}
      <ConversationList
        conversations={conversations}
        isLoading={isLoading}
        error={error}
        query={query}
      />

      {/* Current user */}
      <UserProfile />
    </aside>
  );
}
