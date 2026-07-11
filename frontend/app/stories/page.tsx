"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/shared/Avatar";
import { useAuthStore } from "@/store/auth";

const STORIES = [
  { name: "Bob Smith",    avatar: "https://ui-avatars.com/api/?name=Bob+Smith&background=random&size=128" },
  { name: "Charlie Brown",avatar: "https://ui-avatars.com/api/?name=Charlie+Brown&background=random&size=128" },
  { name: "Diana Prince", avatar: "https://ui-avatars.com/api/?name=Diana+Prince&background=random&size=128" },
  { name: "Ethan Hunt",   avatar: "https://ui-avatars.com/api/?name=Ethan+Hunt&background=random&size=128" },
];

export default function StoriesPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [viewed, setViewed] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-border bg-card">
        <button
          onClick={() => router.back()}
          className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-lg font-bold text-foreground">Stories</h1>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Your story */}
        <section>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">My Story</p>
          <button
            onClick={() => setViewed("me")}
            className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-muted transition-colors"
          >
            <div className="relative">
              <Avatar name={user?.display_name ?? "Me"} src={user?.avatar_url} size="lg" />
              <span className="absolute -bottom-0.5 -right-0.5 h-5 w-5 rounded-full bg-primary flex items-center justify-center border-2 border-background">
                <svg className="h-3 w-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                </svg>
              </span>
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-foreground">My Story</p>
              <p className="text-xs text-muted-foreground">Add to your story</p>
            </div>
          </button>
        </section>

        {/* Recent stories */}
        <section>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Recent</p>
          <div className="space-y-1">
            {STORIES.map((s) => (
              <button
                key={s.name}
                onClick={() => setViewed(s.name)}
                className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-muted transition-colors"
              >
                <div className="rounded-full ring-2 ring-primary p-0.5">
                  <Avatar name={s.name} src={s.avatar} size="lg" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-foreground">{s.name}</p>
                  <p className="text-xs text-muted-foreground">Today</p>
                </div>
              </button>
            ))}
          </div>
        </section>
      </div>

      {/* Story viewer modal */}
      {viewed && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          onClick={() => setViewed(null)}
        >
          <div className="bg-card rounded-2xl p-8 max-w-sm w-full mx-4 text-center shadow-2xl border border-border">
            <p className="text-sm text-muted-foreground">
              Stories are mocked for this assignment.
            </p>
            <button
              className="mt-4 text-xs text-primary hover:underline"
              onClick={() => setViewed(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
