"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Avatar } from "@/components/shared/Avatar";
import { useConversationStore } from "@/store/conversation";
import { useAuthStore } from "@/store/auth";
import { conversationApi } from "@/lib/api";
import type { Member } from "@/types/conversation";

// ── helpers ───────────────────────────────────────────────────────────────────

function formatLastSeen(isoOrNull: string | null, isOnline: boolean): string {
  if (isOnline) return "Online";
  if (!isoOrNull) return "Last seen: unknown";
  const d = new Date(/[Zz]|[+-]\d{2}:?\d{2}$/.test(isoOrNull) ? isoOrNull : isoOrNull + "Z");
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  if (diffMins < 1) return "Last seen just now";
  if (diffMins < 60) return `Last seen ${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `Last seen ${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "Last seen yesterday";
  return `Last seen ${diffDays} days ago`;
}

function PlaceholderRow({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border last:border-0">
      <span className="text-muted-foreground">{icon}</span>
      <span className="flex-1 text-sm text-foreground">{label}</span>
      <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">Coming Soon</span>
    </div>
  );
}

// ── member row ────────────────────────────────────────────────────────────────

function MemberRow({ member }: { member: Member }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-border last:border-0">
      <div className="relative flex-shrink-0">
        <Avatar name={member.display_name} src={member.avatar_url} size="sm" />
        {member.is_online && (
          <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-card" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{member.display_name}</p>
        <p className="text-xs text-muted-foreground truncate">
          {formatLastSeen(member.last_seen_at, member.is_online)}
        </p>
      </div>
      {member.is_admin && (
        <span className="text-xs text-primary bg-primary/10 rounded-full px-2 py-0.5 flex-shrink-0">
          Admin
        </span>
      )}
    </div>
  );
}

// ── icons (inline SVG helpers) ────────────────────────────────────────────────

const MediaIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);
const MuteIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
  </svg>
);
const BlockIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
  </svg>
);
const PhoneIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
);
const LeaveIcon = () => (
  <svg className="h-5 w-5 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" />
  </svg>
);

// ── main component ────────────────────────────────────────────────────────────

function DetailsContent() {
  const router = useRouter();
  const params = useSearchParams();
  const id = params.get("id");
  const conversations = useConversationStore((s) => s.conversations);
  const conversation = conversations.find((c) => c.id === id);
  const { token } = useAuthStore();

  const [members, setMembers] = useState<Member[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [membersError, setMembersError] = useState<string | null>(null);

  useEffect(() => {
    if (!id || !token) return;
    setLoadingMembers(true);
    conversationApi
      .members(token, id)
      .then(setMembers)
      .catch((e) => setMembersError(e instanceof Error ? e.message : "Failed to load members"))
      .finally(() => setLoadingMembers(false));
  }, [id, token]);

  if (!conversation) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground text-sm">Conversation not found.</p>
      </div>
    );
  }

  const isDirect = conversation.type === "DIRECT";
  const peer = isDirect ? members.find(() => true) : null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-border bg-card sticky top-0 z-10">
        <button
          onClick={() => router.back()}
          className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-lg font-bold text-foreground">
          {isDirect ? "Contact Info" : "Group Info"}
        </h1>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Avatar + name */}
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="relative">
            <Avatar name={conversation.name} src={conversation.avatar_url} size="lg" />
            {isDirect && peer?.is_online && (
              <span className="absolute bottom-1 right-1 h-3.5 w-3.5 rounded-full bg-emerald-500 ring-2 ring-background" />
            )}
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-foreground">{conversation.name}</p>
            {isDirect && peer && (
              <p className="text-sm text-muted-foreground mt-0.5">
                {formatLastSeen(peer.last_seen_at, peer.is_online)}
              </p>
            )}
            {!isDirect && (
              <p className="text-sm text-muted-foreground mt-0.5">
                {loadingMembers ? "Loading…" : `${members.length} member${members.length !== 1 ? "s" : ""}`}
              </p>
            )}
          </div>
        </div>

        {isDirect ? (
          <>
            {/* Direct: phone + last seen */}
            <div className="rounded-xl border border-border bg-card overflow-hidden divide-y divide-border mb-6">
              {peer && (
                <div className="flex items-center gap-3 px-4 py-3.5">
                  <PhoneIcon />
                  <div>
                    <p className="text-xs text-muted-foreground">Phone</p>
                    <p className="text-sm text-foreground">{peer.display_name}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3 px-4 py-3.5">
                <svg className="h-5 w-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <p className="text-sm text-foreground">
                    {peer ? formatLastSeen(peer.last_seen_at, peer.is_online) : "—"}
                  </p>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-border bg-card overflow-hidden divide-y divide-border">
              <PlaceholderRow icon={<MediaIcon />} label="Media, Links and Docs" />
              <PlaceholderRow icon={<MuteIcon />} label="Mute Notifications" />
              <PlaceholderRow icon={<BlockIcon />} label="Block" />
            </div>
          </>
        ) : (
          <>
            {/* Group: real member list */}
            <div className="rounded-xl border border-border bg-card overflow-hidden mb-6">
              {loadingMembers && (
                <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                  Loading members…
                </div>
              )}
              {membersError && (
                <div className="px-4 py-6 text-center text-sm text-destructive">
                  {membersError}
                </div>
              )}
              {!loadingMembers && !membersError && members.map((m) => (
                <MemberRow key={m.user_id} member={m} />
              ))}
            </div>
            <div className="rounded-xl border border-border bg-card overflow-hidden divide-y divide-border">
              <PlaceholderRow icon={<MediaIcon />} label="Media, Links and Docs" />
              <PlaceholderRow icon={<MuteIcon />} label="Mute Notifications" />
              <div className="flex items-center gap-3 px-4 py-3.5">
                <LeaveIcon />
                <span className="flex-1 text-sm text-destructive">Leave Group</span>
                <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">Coming Soon</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function DetailsPage() {
  return (
    <Suspense>
      <DetailsContent />
    </Suspense>
  );
}
