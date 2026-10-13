"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useDialogFocus } from "@/lib/useDialogFocus";
import { Trash2, MessageSquare, X, Send } from "lucide-react";

export function CustomerProfileActions({
  userId,
  email,
}: {
  userId: string;
  email: string;
}) {
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();
  const dialogRef = useDialogFocus(showModal, () => {
    if (!loading) setShowModal(false);
  });

  const handleDelete = async () => {
    if (
      !confirm(
        "Are you sure you want to completely delete this user? This cannot be undone.",
      )
    )
      return;

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete user");
      }

      toast.success("User deleted successfully.");
      router.push("/admin/customers");
      router.refresh();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Unable to delete account",
      );
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim())
      return toast.error("Please fill out all fields");

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, message, customerEmail: email }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to send message");

      toast.success("Message sent successfully!");
      setShowModal(false);
      setSubject("");
      setMessage("");
    } catch (err: any) {
      toast.error(err.message || "Error sending message");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex flex-wrap items-center gap-3 ml-auto">
        <Button
          variant="outline"
          onClick={() => setShowModal(true)}
          className="text-slate-600 bg-white border-slate-200 hover:bg-slate-50 shadow-sm"
        >
          <MessageSquare className="w-4 h-4 mr-2" />
          Message
        </Button>
        <Button
          variant="destructive"
          onClick={handleDelete}
          disabled={loading && !showModal}
          className="shadow-sm"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          {loading && !showModal ? "Deleting..." : "Delete Account"}
        </Button>
      </div>

      {showModal && (
        <div
          ref={dialogRef}
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          aria-label="Send Message to Customer"
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[calc(100dvh-32px)] overflow-y-auto flex flex-col">
            <div className="px-6 py-4 border-b flex items-center justify-between bg-slate-50">
              <h2 className="text-lg font-semibold text-slate-800">
                Send Message to Customer
              </h2>
              <button
                aria-label="Close message"
                disabled={loading}
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendMessage} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  To
                </label>
                <Input
                  value={email}
                  disabled
                  className="bg-slate-50 text-slate-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Subject
                </label>
                <Input
                  aria-label="Message subject"
                  placeholder="e.g. Update regarding your recent order"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Message
                </label>
                <Textarea
                  aria-label="Customer message"
                  placeholder="Write your message here..."
                  className="min-h-[150px] resize-none"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                />
              </div>

              <a
                className="admin-text-link inline-flex min-h-11 items-center text-sm"
                href={`mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`}
              >
                Open email app
              </a>
              <div className="pt-4 flex flex-wrap items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowModal(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {loading ? "Sending..." : "Send Message"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
