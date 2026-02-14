"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ChatMsg = {
  role: "user" | "assistant";
  text: string;
  ts: number;
};

export default function ConsumerDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      role: "assistant",
      text:
        "Welcome to HydroSync. Tell me what kind of water you need (quality + quantity + location + time window).",
      ts: Date.now(),
    },
  ]);

  const [text, setText] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);

  // ✅ Proper session check
  useEffect(() => {
    const stored = localStorage.getItem("hydrosync_user");

    if (!stored) {
      router.replace("/login");
      return;
    }

    try {
      const parsed = JSON.parse(stored);

      if (parsed?.role !== "consumer") {
        router.replace("/dashboard");
        return;
      }

      setUser(parsed);
    } catch {
      localStorage.removeItem("hydrosync_user");
      router.replace("/login");
    }
  }, [router]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const canSend = useMemo(() => text.trim().length > 0, [text]);

  async function send() {
    const trimmed = text.trim();
    if (!trimmed) return;

    const userMsg: ChatMsg = { role: "user", text: trimmed, ts: Date.now() };
    setMessages((prev) => [...prev, userMsg]);
    setText("");

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text:
            "Got it. I’ll structure your requirements into a Water Demand Profile and start matching suppliers (demo mode).",
          ts: Date.now(),
        },
      ]);
    }, 600);
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex">
        <aside className="hidden w-64 border-r bg-white lg:block">
          <div className="px-6 py-5">
            <div className="text-xs text-muted-foreground">HydroSync</div>
            <div className="text-lg font-semibold">Consumer Console</div>
          </div>
        </aside>

        <main className="flex-1">
          <div className="border-b bg-white px-6 py-4 flex justify-between">
            <div>
              <h1 className="text-xl font-semibold">Water Requirement Intake</h1>
              <p className="text-sm text-muted-foreground">
                Logged in as {user.username}
              </p>
            </div>

            <Button
              variant="outline"
              onClick={() => {
                localStorage.removeItem("hydrosync_user");
                router.replace("/login");
              }}
            >
              Logout
            </Button>
          </div>

          <div className="p-6">
            <div className="space-y-4">
              {messages.map((m, idx) => (
                <div key={idx} className="text-sm">
                  <strong>{m.role}:</strong> {m.text}
                </div>
              ))}
              <div ref={endRef} />
            </div>

            <div className="mt-4 flex gap-2">
              <Input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type your requirements…"
              />
              <Button onClick={send} disabled={!canSend}>
                Send
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
