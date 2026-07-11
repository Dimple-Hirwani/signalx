"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PhoneStep } from "@/components/auth/PhoneStep";
import { OTPStep } from "@/components/auth/OTPStep";
import { useAuthStore } from "@/store/auth";

export default function LoginPage() {
  const [phone, setPhone] = useState<string | null>(null);
  const { user, isLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      router.replace("/chat");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-8 shadow-sm">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-foreground">SignalX</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {phone ? "Verify your number" : "Sign in to continue"}
          </p>
        </div>

        {phone ? (
          <OTPStep phone={phone} onBack={() => setPhone(null)} />
        ) : (
          <PhoneStep onSuccess={setPhone} />
        )}
      </div>
    </div>
  );
}
