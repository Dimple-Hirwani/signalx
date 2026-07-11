"use client";

import { useRef, useState } from "react";
import { Avatar } from "@/components/shared/Avatar";
import { authApi, avatarApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth";

// A–Z palette: generates avatars for every letter A through Z
const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const PALETTE = [
  "3b82f6","10b981","8b5cf6","f59e0b","ef4444","06b6d4",
  "ec4899","6366f1","14b8a6","f97316","84cc16","a855f7",
  "0ea5e9","d946ef","22c55e","eab308","64748b","fb923c",
  "4ade80","38bdf8","c084fc","f87171","34d399","fbbf24",
  "60a5fa","e879f9",
];

function letterAvatarUrl(letter: string, idx: number): string {
  const color = PALETTE[idx % PALETTE.length] ?? "3b82f6";
  return `https://ui-avatars.com/api/?name=${letter}&background=${color}&color=fff&size=128&bold=true`;
}

interface Props {
  onClose: () => void;
}

export function ProfileModal({ onClose }: Props) {
  const { user, token, updateUser } = useAuthStore();
  const [name, setName] = useState(user?.display_name ?? "");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url ?? "");
  const [letterSearch, setLetterSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Filter A–Z grid by search
  const filteredLetters = letterSearch
    ? LETTERS.filter((l) => l.toLowerCase().startsWith(letterSearch.toLowerCase()))
    : LETTERS;

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !token) return;
    setUploading(true);
    setError(null);
    try {
      const updated = await avatarApi.upload(token, file);
      updateUser(updated);
      setAvatarUrl(updated.avatar_url ?? "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      // Reset file input so same file can be re-selected
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function handleSave() {
    if (!token || !name.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const updated = await authApi.updateProfile(token, {
        display_name: name.trim(),
        avatar_url: avatarUrl || undefined,
      });
      updateUser(updated);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-md bg-card rounded-2xl shadow-2xl border border-border overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-base font-semibold text-foreground">Edit Profile</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Avatar preview + upload button */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <Avatar name={name || "?"} src={avatarUrl || null} size="lg" />
              {uploading && (
                <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
                  <svg className="h-5 w-5 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                </div>
              )}
            </div>
            {/* Hidden file input */}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted text-sm text-foreground hover:bg-accent transition-colors disabled:opacity-50"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              {uploading ? "Uploading…" : "Upload Photo"}
            </button>
          </div>

          {/* Display name */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
              Display Name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={64}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Your name"
            />
          </div>

          {/* A–Z avatar grid */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Choose Letter Avatar</p>
            <input
              type="text"
              value={letterSearch}
              onChange={(e) => setLetterSearch(e.target.value)}
              maxLength={1}
              placeholder="Search A–Z…"
              className="w-full mb-3 rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <div className="grid grid-cols-7 gap-1.5 max-h-36 overflow-y-auto pr-1">
              {filteredLetters.map((letter, idx) => {
                const url = letterAvatarUrl(letter, LETTERS.indexOf(letter));
                const isSelected = avatarUrl === url;
                return (
                  <button
                    key={letter}
                    onClick={() => setAvatarUrl(url)}
                    title={`Letter ${letter}`}
                    className={`rounded-full ring-2 transition-all focus:outline-none ${
                      isSelected ? "ring-primary scale-110" : "ring-transparent hover:ring-border"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt={letter}
                      className="h-9 w-9 rounded-full object-cover"
                    />
                  </button>
                );
              })}
              {/* Initials fallback */}
              <button
                onClick={() => setAvatarUrl("")}
                title="Use initials"
                className={`h-9 w-9 rounded-full ring-2 transition-all flex items-center justify-center bg-muted text-xs font-bold text-muted-foreground ${
                  !avatarUrl ? "ring-primary" : "ring-transparent hover:ring-border"
                }`}
              >
                {name ? name.trim().split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase() : "AB"}
              </button>
            </div>
          </div>

          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-border">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-lg border border-border text-sm text-foreground hover:bg-muted transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !name.trim()}
            className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
