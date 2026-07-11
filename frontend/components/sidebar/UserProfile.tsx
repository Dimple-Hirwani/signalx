"use client";

import { useRouter } from "next/navigation";
import { Avatar } from "@/components/shared/Avatar";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth";

export function UserProfile() {
  const { user, token, clearAuth } = useAuthStore();
  const router = useRouter();

  async function handleLogout() {
    if (token) await authApi.logout(token).catch(() => {});
    clearAuth();
    router.replace("/login");
  }

  if (!user) return null;

  return (
    <div className="flex items-center gap-3 px-3 py-3 border-t border-border">
      <Avatar name={user.display_name} src={user.avatar_url} size="sm" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground truncate">{user.display_name}</p>
        <p className="text-xs text-muted-foreground truncate">{user.phone}</p>
      </div>
      <button
        onClick={handleLogout}
        title="Log out"
        className="flex-shrink-0 p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1"
          />
        </svg>
      </button>
    </div>
  );
}
