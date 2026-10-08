"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { X, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDialogFocus } from "@/lib/useDialogFocus";
import { logout } from "@/lib/auth/client";

interface Profile {
  uid: string;
  displayName: string;
  email: string;
  role: string;
  emailVerified: boolean;
  phoneNumber: string;
  createdAt: string;
}

export function AccountPopup({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const dialogRef = useDialogFocus(true, onClose);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const response = await fetch("/api/auth/profile", { cache: "no-store", signal: controller.signal });
        if (!response.ok) throw new Error(response.status === 401 ? "Please log in again." : "Unable to load your profile. Please try again.");
        const data: Profile = await response.json();
        setProfile(data);
        setName(data.displayName);
      } catch (err) {
        if (!controller.signal.aborted) setError((err as Error).message);
      }
    }
    void load();
    return () => controller.abort();
  }, []);

  async function saveName(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch("/api/auth/profile", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName: name.trim() }),
      });
      if (!response.ok) throw new Error("Unable to save your name. Please try again.");
      setProfile(current => current ? { ...current, displayName: name.trim() } : current);
      setName(name.trim());
      setMessage("Your name has been updated.");
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function handleLogout() {
    setBusy(true);
    setError("");
    try { await logout(); }
    catch { setError("Unable to log out. Please try again."); setBusy(false); }
  }

  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/45 backdrop-blur-sm p-4" onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="account-popup-title" tabIndex={-1} className="relative w-full max-w-lg max-h-[85dvh] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 text-slate-900 shadow-2xl">
        <button type="button" onClick={onClose} aria-label="Close profile" className="absolute right-4 top-4 rounded-full p-2 text-slate-500 hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-indigo-500"><X className="h-5 w-5" /></button>
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-full bg-indigo-50 p-3 text-indigo-600"><UserRound className="h-6 w-6" /></div>
          <div><h2 id="account-popup-title" className="text-xl font-semibold">My Account</h2><p className="text-sm text-slate-500">Your profile details</p></div>
        </div>
        {error && <p role="alert" className="mb-4 text-sm text-red-600">{error}</p>}
        {message && <p role="status" className="mb-4 text-sm text-green-700">{message}</p>}
        {!profile && !error && <p role="status" className="py-6 text-sm text-slate-500">Loading your profile…</p>}
        {profile && <>
          <form onSubmit={saveName} className="mb-6 space-y-2">
            <label htmlFor="profile-name" className="text-sm font-medium text-slate-600">Full name</label>
            <div className="flex gap-2">
              <Input id="profile-name" value={name} onChange={event => setName(event.target.value)} required maxLength={80} disabled={busy} className="min-w-0 bg-white" />
              <Button type="submit" disabled={busy || !name.trim() || name.trim() === profile.displayName}>Save</Button>
            </div>
          </form>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-5 text-sm">
            <div className="sm:col-span-2"><dt className="text-slate-500">Email address</dt><dd className="mt-1 break-all">{profile.email}</dd></div>
            <div><dt className="text-slate-500">Role</dt><dd className="mt-1 capitalize">{profile.role.replaceAll("_", " ")}</dd></div>
            <div><dt className="text-slate-500">Status</dt><dd className="mt-1">{profile.emailVerified ? "Verified" : "Unverified"}</dd></div>
            <div><dt className="text-slate-500">Phone number</dt><dd className="mt-1">{profile.phoneNumber || "Not added"}</dd></div>
            <div><dt className="text-slate-500">Member since</dt><dd className="mt-1">{new Date(profile.createdAt).toLocaleDateString()}</dd></div>
            <div className="sm:col-span-2"><dt className="text-slate-500">Account ID</dt><dd className="mt-1 break-all text-xs">{profile.uid}</dd></div>
          </dl>
          <div className="mt-6 flex items-center justify-end border-t border-slate-200 pt-5">
            <Button type="button" variant="destructive" disabled={busy} onClick={handleLogout}>Logout</Button>
          </div>
        </>}
      </div>
    </div>, document.body
  );
}
