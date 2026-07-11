"use client";

import { useState } from "react";
import { SearchBar } from "./SearchBar";
import { ConversationList } from "./ConversationList";
import { UserProfile } from "./UserProfile";
import { useConversations } from "@/hooks/useConversations";

export function Sidebar() {
  const [query, setQuery] = useState("");
  const { conversations, isLoading, error } = useConversations();

  return (
    <aside className="flex flex-col w-80 flex-shrink-0 border-r border-border bg-card h-screen">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-border">
        <h1 className="text-lg font-bold text-foreground">SignalX</h1>
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
