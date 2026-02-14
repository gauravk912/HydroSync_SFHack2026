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

  useEffect(() => {
    const role = localStorage.getItem("hydrosync_role");
    const userId = localStorage.getItem("hydrosync_userId");

    if (!userId) {
      router.replace("/login");
      return;
    }

    if (role !== "consumer") {
      router.replace("/dashboard");
      return;
    }
  }, [router]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const canSend = useMemo(() => text.trim().length > 0, [text]);

  async function send() {
    const trimmed = text.trim();
    if (!trimmed) return;

    setStatus(null);

    const userMsg: ChatMsg = { role: "user", text: trimmed, ts: Date.now() };
    setMessages((prev) => [...prev, userMsg]);
    setText("");

    // UI-first: fake assistant response for now
    // Later: call /api/consumer/requirements to store + run matching
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

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden w-64 border-r bg-white lg:block">
          <div className="px-6 py-5">
            <div className="text-xs text-muted-foreground">HydroSync</div>
            <div className="text-lg font-semibold">Consumer Console</div>
          </div>

          <nav className="px-3 pb-6">
            <SidebarItem active title="Request Water" subtitle="Chat intake" />
            <SidebarItem title="Matches" subtitle="Suppliers & routes" />
            <SidebarItem title="Contracts" subtitle="Agreements" />
            <SidebarItem title="Settings" subtitle="Profile & notifications" />
          </nav>

          <div className="mt-auto px-6 pb-6">
            <div className="rounded-xl border bg-slate-50 p-4 text-xs text-muted-foreground">
              Tip: Provide target ranges (pH, TDS, turbidity) for better matches.
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1">
          {/* Top bar */}
          <div className="sticky top-0 z-10 border-b bg-white/80 backdrop-blur">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Consumer Console</p>
                <h1 className="text-xl font-semibold tracking-tight">Water Requirement Intake</h1>
                <p className="text-sm text-muted-foreground">
                  Describe what water you need. HydroSync will match verified producers.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden text-right sm:block">
                  <p className="text-sm font-medium">Demo Consumer Co.</p>
                  <p className="text-xs text-muted-foreground">San Jose, CA</p>
                </div>

                <Button
                  variant="outline"
                  onClick={() => {
                    localStorage.removeItem("hydrosync_userId");
                    localStorage.removeItem("hydrosync_role");
                    localStorage.removeItem("hydrosync_username");
                    router.replace("/login");
                  }}
                >
                  Logout
                </Button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-6 py-8 lg:grid-cols-3">
            {/* Chat */}
            <div className="lg:col-span-2">
              <div className="rounded-2xl border bg-white shadow-sm">
                <div className="border-b px-6 py-4">
                  <div className="text-sm font-semibold">Chat Intake</div>
                  <div className="text-xs text-muted-foreground">
                    Example: “Need cooling-grade water, pH 6.5–8.5, TDS &lt; 1200, turbidity &lt; 5, 50k gallons/day, within 30 miles, next 2 weeks.”
                  </div>
                </div>

                <div className="h-[520px] overflow-y-auto px-6 py-5">
                  <div className="space-y-4">
                    {messages.map((m, idx) => (
                      <ChatBubble key={idx} role={m.role} text={m.text} />
                    ))}
                    <div ref={endRef} />
                  </div>
                </div>

                <div className="border-t px-6 py-4">
                  <div className="flex gap-2">
                    <Input
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      placeholder="Type your requirements…"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") send();
                      }}
                    />
                    <Button onClick={send} disabled={!canSend}>
                      Send
                    </Button>
                  </div>
                  {status && <p className="mt-2 text-xs text-muted-foreground">{status}</p>}
                </div>
              </div>
            </div>

            {/* Right panel */}
            <div className="space-y-6">
              <InfoCard
                title="What to include"
                items={[
                  "Use-case: cooling / irrigation / process / wash",
                  "Quality ranges (pH, TDS, turbidity, COD/BOD if needed)",
                  "Quantity (gallons/day) and time window",
                  "Location + max transport distance",
                ]}
              />

              <div className="rounded-2xl border bg-white p-6 shadow-sm">
                <h3 className="text-sm font-semibold">Structured Demand (preview)</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  (UI-only) We’ll auto-generate this from chat.
                </p>

                <div className="mt-4 grid gap-3">
                  <KV label="Use-case" value="—" />
                  <KV label="pH" value="—" />
                  <KV label="TDS" value="—" />
                  <KV label="Turbidity" value="—" />
                  <KV label="Quantity" value="—" />
                  <KV label="Radius" value="—" />
                </div>
              </div>

              <div className="rounded-2xl border bg-white p-6 shadow-sm">
                <h3 className="text-sm font-semibold">Matches</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  (UI-only) Matches will appear here after mapping.
                </p>

                <div className="mt-4 space-y-3">
                  <MatchCard title="No matches yet" subtitle="Send your requirements to start matching." />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

/* ---------- Components ---------- */

function SidebarItem({ title, subtitle, active }: { title: string; subtitle: string; active?: boolean }) {
  return (
    <div
      className={[
        "mb-2 rounded-xl px-4 py-3 text-sm transition",
        active ? "bg-slate-100 font-medium" : "hover:bg-slate-50 text-muted-foreground",
      ].join(" ")}
    >
      <div className="text-sm">{title}</div>
      <div className="text-xs text-muted-foreground">{subtitle}</div>
    </div>
  );
}

function ChatBubble({ role, text }: { role: "user" | "assistant"; text: string }) {
  const isUser = role === "user";

  return (
    <div className={["flex", isUser ? "justify-end" : "justify-start"].join(" ")}>
      <div
        className={[
          "max-w-[85%] rounded-2xl px-4 py-3 text-sm",
          isUser ? "bg-black text-white" : "bg-slate-100 text-slate-900",
        ].join(" ")}
      >
        {text}
      </div>
    </div>
  );
}

function InfoCard({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <h3 className="text-sm font-semibold">{title}</h3>
      <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
        {items.map((t) => (
          <li key={t}>• {t}</li>
        ))}
      </ul>
    </div>
  );
}

function KV({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl border bg-slate-50 px-4 py-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-sm font-semibold">{value}</div>
    </div>
  );
}

function MatchCard({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="rounded-xl border bg-slate-50 p-4">
      <div className="text-sm font-medium">{title}</div>
      <div className="mt-1 text-xs text-muted-foreground">{subtitle}</div>
    </div>
  );
}