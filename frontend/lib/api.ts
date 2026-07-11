import type { LoginResponse, User } from "@/types/auth";

const BASE = "/api/auth";

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
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
    apiFetch<{ message: string }>("/request-otp", {
      method: "POST",
      body: JSON.stringify({ phone }),
    }),

  verifyOtp: (phone: string, otp: string) =>
    apiFetch<LoginResponse>("/verify-otp", {
      method: "POST",
      body: JSON.stringify({ phone, otp }),
    }),

  me: (token: string) =>
    apiFetch<User>("/me", {
      headers: { Authorization: `Bearer ${token}` },
    }),

  logout: (token: string) =>
    apiFetch<void>("/logout", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    }),
};
