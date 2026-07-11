"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/shared/Avatar";
import { ProfileModal } from "@/components/shared/ProfileModal";
import { useAuthStore } from "@/store/auth";
import { useUIStore } from "@/store/ui";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1 mb-2">
        {title}
      </p>
      <div className="rounded-xl border border-border bg-card overflow-hidden divide-y divide-border">
        {children}
      </div>
    </div>
  );
}

function Row({ icon, label, right, onClick }: {
  icon: React.ReactNode;
  label: string;
  right?: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      className="flex items-center gap-3 w-full px-4 py-3.5 text-left hover:bg-muted/50 disabled:cursor-default transition-colors"
    >
      <span className="flex-shrink-0 text-muted-foreground">{icon}</span>
      <span className="flex-1 text-sm text-foreground">{label}</span>
      {right && <span className="flex-shrink-0">{right}</span>}
    </button>
  );
}

function ComingSoon() {
  return (
    <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">
      Coming Soon
    </span>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { theme, setTheme } = useUIStore();
  const [showProfile, setShowProfile] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-border bg-card sticky top-0 z-10">
        <button
          onClick={() => router.back()}
          className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-lg font-bold text-foreground">Settings</h1>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6">

        {/* Profile card */}
        <button
          onClick={() => setShowProfile(true)}
          className="flex items-center gap-4 w-full p-4 rounded-xl border border-border bg-card hover:bg-muted/50 transition-colors mb-6"
        >
          <Avatar name={user?.display_name ?? ""} src={user?.avatar_url} size="lg" />
          <div className="flex-1 text-left min-w-0">
            <p className="text-base font-semibold text-foreground truncate">{user?.display_name}</p>
            <p className="text-sm text-muted-foreground">{user?.phone}</p>
          </div>
          <svg className="h-4 w-4 text-muted-foreground flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Appearance */}
        <Section title="Appearance">
          <Row
            icon={<svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" /></svg>}
            label="Light"
            onClick={() => setTheme("light")}
            right={theme === "light" ? <span className="h-2 w-2 rounded-full bg-primary" /> : undefined}
          />
          <Row
            icon={<svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>}
            label="Dark"
            onClick={() => setTheme("dark")}
            right={theme === "dark" ? <span className="h-2 w-2 rounded-full bg-primary" /> : undefined}
          />
        </Section>

        {/* Privacy */}
        <Section title="Privacy">
          <Row
            icon={<svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>}
            label="Privacy"
            right={<ComingSoon />}
          />
        </Section>

        {/* Notifications */}
        <Section title="Notifications">
          <Row
            icon={<svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>}
            label="Notifications"
            right={<ComingSoon />}
          />
        </Section>

        {/* Storage */}
        <Section title="Storage">
          <Row
            icon={<svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" /></svg>}
            label="Storage and Data"
            right={<ComingSoon />}
          />
        </Section>

        {/* About */}
        <Section title="About">
          <Row
            icon={<svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            label="Version"
            right={<span className="text-xs text-muted-foreground">1.0.0</span>}
          />
          <Row
            icon={<svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>}
            label="GitHub"
            onClick={() => window.open("https://github.com", "_blank")}
            right={<svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>}
          />
        </Section>

      </div>

      {showProfile && <ProfileModal onClose={() => setShowProfile(false)} />}
    </div>
  );
}
