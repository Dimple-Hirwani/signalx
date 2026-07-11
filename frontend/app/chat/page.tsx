"use client";

import { useCallback } from "react";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { ConversationHeader } from "@/components/conversation/ConversationHeader";
import { MessageList } from "@/components/conversation/MessageList";
import { MessageComposer } from "@/components/conversation/MessageComposer";
import { useConversationStore } from "@/store/conversation";
import { useAuthStore } from "@/store/auth";
import { useMessages } from "@/hooks/useMessages";
import { useWebSocket } from "@/hooks/useWebSocket";
import { conversationApi } from "@/lib/api";
import type { Message } from "@/types/message";

function EmptyState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-background px-8">
      <div className="flex flex-col items-center gap-4 text-center">
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
    </div>
  );
}

function ConversationPanel() {
  const { selectedId, conversations, updatePreview } = useConversationStore();
  const { user, token } = useAuthStore();
  const {
    messages,
    isLoading,
    error,
    addMessage,
    replaceMessage,
    removeMessage,
    appendIncoming,
    updateReceiptStatus,
  } = useMessages(selectedId);

  useWebSocket(
    selectedId,
    token,
    useCallback(
      (msg: Message) => {
        appendIncoming(msg);
        // Update sidebar preview for messages from other users
        if (selectedId) {
          updatePreview(selectedId, msg.content, msg.created_at);
        }
      },
      [appendIncoming, selectedId, updatePreview]
    ),
    updateReceiptStatus
  );

  const conversation = conversations.find((c) => c.id === selectedId);

  const handleSendRequest = useCallback(
    async (content: string): Promise<Message> => {
      if (!token || !selectedId) throw new Error("Not connected");
      const confirmed = await conversationApi.sendMessage(token, selectedId, content);
      updatePreview(selectedId, confirmed.content, confirmed.created_at);
      return confirmed;
    },
    [token, selectedId, updatePreview]
  );

  if (!conversation || !user) return <EmptyState />;

  return (
    <div className="flex flex-col h-full bg-background">
      <ConversationHeader conversation={conversation} />
      <MessageList
        messages={messages}
        currentUserId={user.id}
        isGroup={conversation.type === "GROUP"}
        isLoading={isLoading}
        error={error}
      />
      <MessageComposer
        conversationId={conversation.id}
        currentUserId={user.id}
        currentUserName={user.display_name}
        onOptimisticAdd={addMessage}
        onConfirmed={replaceMessage}
        onRollback={removeMessage}
        onSendRequest={handleSendRequest}
      />
    </div>
  );
}

export default function ChatPage() {
  const selectedId = useConversationStore((s) => s.selectedId);

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar: full width on mobile when no chat open, fixed width on desktop */}
      <div
        className={`flex-shrink-0 w-80 flex-col ${selectedId ? "hidden md:flex" : "flex"}`}
      >
        <Sidebar />
      </div>

      {/* Main panel */}
      <main
        className={`flex-1 min-w-0 flex-col ${selectedId ? "flex" : "hidden md:flex"}`}
      >
        <ConversationPanel />
      </main>
    </div>
  );
}
