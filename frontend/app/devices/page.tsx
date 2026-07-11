"use client";

import { useRouter } from "next/navigation";

export default function DevicesPage() {
  const router = useRouter();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
      {/* Desktop illustration */}
      <div className="h-24 w-24 rounded-2xl bg-muted flex items-center justify-center mb-6">
        <svg className="h-12 w-12 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      </div>
      <h1 className="text-2xl font-bold text-foreground mb-2">Linked Devices</h1>
      <p className="text-muted-foreground max-w-sm mb-1">
        Link a desktop device to use SignalX on your computer without your phone.
      </p>
      <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
        Coming Soon
      </span>
      <button
        onClick={() => router.back()}
        className="mt-8 flex items-center gap-2 text-sm text-primary hover:underline"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>
    </div>
  );
}
