import type { LoginResponse, User } from "@/types/auth";
import type { Conversation } from "@/types/conversation";
import type { Message } from "@/types/message";

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const { headers: extraHeaders, ...restInit } = init ?? {};
  const res = await fetch(path, {
    ...restInit,
    headers: { "Content-Type": "application/json", ...extraHeaders },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const detail = (body as { detail?: unknown }).detail;
    const message =
      typeof detail === "string"
        ? detail
        : detail !== undefined
        ? JSON.stringify(detail)
        : `HTTP ${res.status}`;
    throw new Error(message);
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

  updateProfile: (
    token: string,
    body: { display_name?: string; avatar_url?: string }
  ) =>
    apiFetch<User>("/api/auth/profile", {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
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

  messages: (token: string, conversationId: string) =>
    apiFetch<Message[]>(`/api/conversations/${conversationId}/messages`, {
      headers: { Authorization: `Bearer ${token}` },
    }),

  sendMessage: (token: string, conversationId: string, content: string) =>
    apiFetch<Message>(`/api/conversations/${conversationId}/messages`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ content }),
    }),

  members: (token: string, conversationId: string) =>
    apiFetch<import("@/types/conversation").Member[]>(
      `/api/conversations/${conversationId}/members`,
      { headers: { Authorization: `Bearer ${token}` } }
    ),
};

export const avatarApi = {
  upload: async (token: string, file: File): Promise<import("@/types/auth").User> => {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/auth/avatar", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      const detail = (body as { detail?: unknown }).detail;
      throw new Error(typeof detail === "string" ? detail : `HTTP ${res.status}`);
    }
    return res.json() as Promise<import("@/types/auth").User>;
  },
};
