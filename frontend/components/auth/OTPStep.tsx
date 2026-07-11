"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth";

interface Props {
  phone: string;
  onBack: () => void;
}

export function OTPStep({ phone, onBack }: Props) {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!/^\d{4,8}$/.test(otp.trim())) {
      setError("Enter the 6-digit OTP");
      return;
    }
    setLoading(true);
    try {
      const data = await authApi.verifyOtp(phone, otp.trim());
      setAuth(data.user, data.access_token);
      router.replace("/chat");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid OTP");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        Enter the OTP sent to <span className="font-medium text-foreground">{phone}</span>
      </p>
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">
          One-time password
        </label>
        <input
          type="text"
          inputMode="numeric"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          placeholder="123456"
          maxLength={8}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm tracking-widest focus:outline-none focus:ring-2 focus:ring-ring"
          autoFocus
        />
        {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-opacity"
      >
        {loading ? "Verifying…" : "Verify OTP"}
      </button>
      <button
        type="button"
        onClick={onBack}
        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        ← Change number
      </button>
    </form>
  );
}
