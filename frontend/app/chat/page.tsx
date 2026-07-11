"use client";

import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth";

export default function ChatPage() {
  const { user, token, clearAuth } = useAuthStore();
  const router = useRouter();

  async function handleLogout() {
    if (token) {
      await authApi.logout(token).catch(() => {});
    }
    clearAuth();
    router.replace("/login");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background">
      <div className="rounded-xl border border-border bg-card p-8 text-center shadow-sm">
        <p className="text-lg font-semibold text-foreground">
          Welcome, {user?.display_name} 👋
        </p>
        <p className="mt-1 text-sm text-muted-foreground">{user?.phone}</p>
        <button
          onClick={handleLogout}
          className="mt-6 rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:opacity-90 transition-opacity"
        >
          Log out
        </button>
      </div>
    </div>
  );
}
