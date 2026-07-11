import type { LoginResponse, User } from "@/types/auth";
import type { Conversation } from "@/types/conversation";

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    headers: { "Content-Type": "application/json", ...init?.headers },
    ...init,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { detail?: string }).detail ?? `HTTP ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const authApi = {
  requestOtp: (phone: string) =>
    apiFetch<{ message: string }>("/api/auth/request-otp", {
      method: "POST",
      body: JSON.stringify({ phone }),
    }),

  verifyOtp: (phone: string, otp: string) =>
    apiFetch<LoginResponse>("/api/auth/verify-otp", {
      method: "POST",
      body: JSON.stringify({ phone, otp }),
    }),

  me: (token: string) =>
    apiFetch<User>("/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    }),

  logout: (token: string) =>
    apiFetch<void>("/api/auth/logout", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    }),
};

export const conversationApi = {
  list: (token: string) =>
    apiFetch<Conversation[]>("/api/conversations", {
      headers: { Authorization: `Bearer ${token}` },
    }),
};
