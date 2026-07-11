"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/shared/Avatar";
import { ProfileModal } from "@/components/shared/ProfileModal";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth";

export function UserProfile() {
  const { user, token, clearAuth } = useAuthStore();
  const router = useRouter();
  const [showProfile, setShowProfile] = useState(false);

  async function handleLogout() {
    if (token) await authApi.logout(token).catch(() => {});
    clearAuth();
    router.replace("/login");
  }

  if (!user) return null;

  return (
    <>
      <div className="flex items-center gap-2 px-3 py-3 border-t border-border">
        <button
          onClick={() => setShowProfile(true)}
          className="flex-shrink-0"
          title="Edit profile"
        >
          <Avatar name={user.display_name} src={user.avatar_url} size="sm" />
        </button>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">{user.display_name}</p>
          <p className="text-xs text-muted-foreground truncate">{user.phone}</p>
        </div>

        {/* Settings */}
        <button
          onClick={() => router.push("/settings")}
          title="Settings"
          className="flex-shrink-0 p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          title="Log out"
          className="flex-shrink-0 p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" />
          </svg>
        </button>
      </div>

      {showProfile && <ProfileModal onClose={() => setShowProfile(false)} />}
    </>
  );
}
