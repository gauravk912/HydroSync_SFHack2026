// "use client";

// {/* <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-emerald-50"></div> */}
// import { useEffect, useMemo, useRef, useState } from "react";
// import { useRouter } from "next/navigation";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";

// type ChatMsg = {
//   role: "user" | "assistant";
//   text: string;
//   ts: number;
// };

// type DemandProfile = {
//   quantity?: number;
//   quantityUnit?: "gallons/day" | "m3/day";
//   industryType?: string;
// };

// export default function ConsumerDashboardPage() {
//   const router = useRouter();
//   const [user, setUser] = useState<any>(null);

//   // 1 = ask quantity, 2 = ask industry/use-case, 3 = ready to view matches
//   const [step, setStep] = useState<1 | 2 | 3>(1);

//   const [demand, setDemand] = useState<DemandProfile>({
//     quantityUnit: "gallons/day",
//   });

//   const [messages, setMessages] = useState<ChatMsg[]>([
//     {
//       role: "assistant",
//       text: "How much quantity of water do you need? (Enter a number)",
//       ts: Date.now(),
//     },
//   ]);

//   const [text, setText] = useState("");
//   const [status, setStatus] = useState<string | null>(null);
//   const endRef = useRef<HTMLDivElement | null>(null);

//   // ✅ Keep your existing session logic (hydrosync_user)
//   useEffect(() => {
//     const stored = localStorage.getItem("hydrosync_user");

//     if (!stored) {
//       router.replace("/login");
//       return;
//     }

//     try {
//       const parsed = JSON.parse(stored);

//       if (parsed?.role !== "consumer") {
//         router.replace("/dashboard");
//         return;
//       }

//       setUser(parsed);
//     } catch {
//       localStorage.removeItem("hydrosync_user");
//       router.replace("/login");
//     }
//   }, [router]);

//   useEffect(() => {
//     endRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   const canSend = useMemo(() => text.trim().length > 0, [text]);

//   async function createDemandAndGoToOptions() {
//     try {
//         // session
//         const stored = localStorage.getItem("hydrosync_user");
//         if (!stored) {
//         router.replace("/login");
//         return;
//         }
//         const u = JSON.parse(stored);

//         // make sure intake finished
//         if (step !== 3 || !demand.quantity || !demand.industryType) {
//         alert("Please complete intake first.");
//         return;
//         }

//         // call backend: save into consumer_demands
//         const res = await fetch("/api/consumer/demand", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//             consumerUserId: u.userId || u._id || u.id, // whichever exists in your session
//             consumerName: u.orgName || u.username,
//             location: {
//             city: u.city,
//             state: u.state,
//             lat: u.lat ?? null,  // ok if not present
//             lng: u.lng ?? null,
//             },
//             industryNeed: demand.industryType,
//             quantityNeededGallonsPerDay: Number(demand.quantity),
//         }),
//         });

//         const data = await res.json();

//         if (!res.ok) {
//         console.error("Demand save failed:", data);
//         alert(data?.error || "Failed to save demand");
//         return;
//         }

//         // store demandId for /consumer/options page
//         localStorage.setItem("hydrosync_last_demand_id", data.demandId);

//         // go to options page
//         router.push("/consumer/options");
//     } catch (e) {
//         console.error(e);
//         alert("Something went wrong while saving demand.");
//     }
//     }

//   async function send() {
//     const trimmed = text.trim();
//     if (!trimmed) return;

//     setStatus(null);

//     // show user message
//     setMessages((prev) => [
//       ...prev,
//       { role: "user", text: trimmed, ts: Date.now() },
//     ]);
//     setText("");

//     // STEP 1: Quantity
//     if (step === 1) {
//       const num = Number(trimmed.replace(/,/g, ""));
//       if (!Number.isFinite(num) || num <= 0) {
//         setMessages((prev) => [
//           ...prev,
//           {
//             role: "assistant",
//             text: "Please enter a valid number (example: 50000).",
//             ts: Date.now(),
//           },
//         ]);
//         return;
//       }

//       setDemand((d) => ({ ...d, quantity: num }));
//       setStep(2);

//       setMessages((prev) => [
//         ...prev,
//         {
//           role: "assistant",
//           text:
//             "Great. What is the need (industry type)? Example: Data Center cooling, Agriculture irrigation, Manufacturing process.",
//           ts: Date.now(),
//         },
//       ]);

//       return;
//     }

//     // STEP 2: Industry type
//     if (step === 2) {
//       if (trimmed.length < 2) {
//         setMessages((prev) => [
//           ...prev,
//           {
//             role: "assistant",
//             text: "Please enter a valid industry type.",
//             ts: Date.now(),
//           },
//         ]);
//         return;
//       }

//       setDemand((d) => ({ ...d, industryType: trimmed }));
//       setStep(3);

//       setMessages((prev) => [
//         ...prev,
//         {
//           role: "assistant",
//           text:
//             "Perfect. I’ve created your Water Demand Profile. Click “See Matches” to view available producer options.",
//           ts: Date.now(),
//         },
//       ]);

//       return;
//     }

//     // STEP 3: optional
//     setMessages((prev) => [
//       ...prev,
//       {
//         role: "assistant",
//         text: "You can proceed to matches now.",
//         ts: Date.now(),
//       },
//     ]);
//   }

//   // avoid flash while session loads
//   if (!user) return null;

//   return (
//     <div className="min-h-screen bg-slate-50">
//       <div className="flex">
//         {/* Sidebar */}
//         <aside className="hidden w-64 border-r bg-white lg:block">
//           <div className="px-6 py-5">
//             <div className="text-xs text-muted-foreground">HydroSync</div>
//             <div className="text-lg font-semibold">Consumer Console</div>
//           </div>

//           <nav className="px-3 pb-6">
//             <SidebarItem
//               active
//               title="Matches & Requests"
//               subtitle="Guided intake"
//             />
//           </nav>
//         </aside>

//         {/* Main */}
//         <main className="flex-1">
//           {/* Top bar */}
//           <div className="sticky top-0 z-10 border-b bg-white/80 backdrop-blur">
//             <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
//               <div>
//                 <p className="text-xs font-medium text-muted-foreground">
//                   Consumer Console
//                 </p>
//                 <h1 className="text-xl font-semibold tracking-tight">
//                   Matches & Requests
//                 </h1>
//                 <p className="text-sm text-muted-foreground">
//                   Answer 2 quick questions. Then we’ll show producer options.
//                 </p>
//               </div>

//               <div className="flex items-center gap-3">
//                 <div className="hidden text-right sm:block">
//                   <p className="text-sm font-medium">{user.orgName}</p>
//                   <p className="text-xs text-muted-foreground">
//                     {user.city ? `${user.city}, ${user.state ?? ""}` : "Consumer"}
//                   </p>
//                 </div>

//                 <Button
//                   variant="outline"
//                   onClick={() => {
//                     localStorage.removeItem("hydrosync_user");
//                     router.replace("/login");
//                   }}
//                 >
//                   Logout
//                 </Button>
//               </div>
//             </div>
//           </div>

//           {/* Content */}
//           <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-6 py-8 lg:grid-cols-3">
//             {/* Chat panel */}
//             <div className="lg:col-span-2">
//               <div className="rounded-2xl border bg-white/70 backdrop-blur-xl border border-white/40 shadow-xl">
//                 <div className="border-b px-6 py-4">
//                   <div className="text-sm font-semibold">
//                     Water Requirement Intake
//                   </div>
//                   <div className="text-xs text-muted-foreground">
//                     Step {step}/3 • Quantity → Need → Matches
//                   </div>
//                 </div>

//                 {/* messages */}
//                 <div className="h-[520px] overflow-y-auto px-6 py-5">
//                   <div className="space-y-4">
//                     {messages.map((m, idx) => (
//                       <ChatBubble key={idx} role={m.role} text={m.text} />
//                     ))}
//                     <div ref={endRef} />
//                   </div>
//                 </div>

//                 {/* input */}
//                 <div className="border-t px-6 py-4">
//                   <div className="flex gap-2">
//                     <Input
//                       value={text}
//                       onChange={(e) => setText(e.target.value)}
//                       placeholder={
//                         step === 1
//                           ? "Enter quantity (e.g., 50000)"
//                           : step === 2
//                           ? "Enter need / industry type (e.g., Data Center cooling)"
//                           : "Optional notes…"
//                       }
//                       onKeyDown={(e) => {
//                         if (e.key === "Enter") send();
//                       }}
//                     />
//                     <Button onClick={send} disabled={!canSend}>
//                       Send
//                     </Button>
//                   </div>
//                   {status && (
//                     <p className="mt-2 text-xs text-muted-foreground">{status}</p>
//                   )}
//                 </div>
//               </div>
//             </div>

//             {/* Right column */}
//             <div className="space-y-6">
//               <InfoCard
//                 title="What we will collect"
//                 items={[
//                   "Quantity needed (per day)",
//                   "Need / industry type",
//                   "Location (from your profile)",
//                 ]}
//               />

//               <div className="rounded-2xl border bg-white p-6 shadow-sm">
//                 <h3 className="text-sm font-semibold">Structured Demand (preview)</h3>
//                 <p className="mt-1 text-xs text-muted-foreground">
//                   This updates as you answer.
//                 </p>

//                 <div className="mt-4 grid gap-3">
//                   <KV label="Industry / Need" value={demand.industryType ?? "—"} />
//                   <KV
//                     label="Quantity"
//                     value={demand.quantity ? `${demand.quantity}` : "—"}
//                   />
//                   <KV label="Unit" value={demand.quantityUnit ?? "—"} />
//                   <KV
//                     label="Location"
//                     value={user.city ? `${user.city}, ${user.state ?? ""}` : "—"}
//                   />
//                 </div>
//               </div>

//               <div className="rounded-2xl border bg-white p-6 shadow-sm">
//                 <h3 className="text-sm font-semibold">Next</h3>
//                 <p className="mt-1 text-xs text-muted-foreground">
//                   Once intake is complete, you can view producer options.
//                 </p>

//                 <div className="mt-4 space-y-3">
//                   <Button
//                     className="w-full"
//                     disabled={step !== 3}
//                     // onClick={() => {
//                     //   localStorage.setItem(
//                     //     "hydrosync_demand",
//                     //     JSON.stringify(demand)
//                     //   );
//                     //   router.push("/consumer/options");
//                     // }}
//                     onClick={createDemandAndGoToOptions}
//                   >
//                     See Matches
//                   </Button>

//                   {step !== 3 && (
//                     <p className="text-xs text-muted-foreground">
//                       Answer both questions to enable matches.
//                     </p>
//                   )}
//                 </div>
//               </div>
//             </div>
//           </div>
//         </main>
//       </div>
//     </div>
//   );
// }

// /* ---------- UI Components ---------- */

// function SidebarItem({
//   title,
//   subtitle,
//   active,
// }: {
//   title: string;
//   subtitle: string;
//   active?: boolean;
// }) {
//   return (
//     <div
//       className={[
//         "mb-2 rounded-xl px-4 py-3 text-sm transition",
//         active
//           ? "bg-slate-100 font-medium"
//           : "hover:bg-slate-50 text-muted-foreground",
//       ].join(" ")}
//     >
//       <div className="text-sm">{title}</div>
//       <div className="text-xs text-muted-foreground">{subtitle}</div>
//     </div>
//   );
// }

// function ChatBubble({ role, text }: { role: "user" | "assistant"; text: string }) {
//   const isUser = role === "user";
//   return (
//     <div className={["flex", isUser ? "justify-end" : "justify-start"].join(" ")}>
//       <div
//         className={[
//           "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
//           isUser ? "bg-black text-white" : "bg-slate-100 text-slate-900",
//         ].join(" ")}
//       >
//         {text}
//       </div>
//     </div>
//   );
// }

// function InfoCard({ title, items }: { title: string; items: string[] }) {
//   return (
//     <div className="rounded-2xl border bg-white p-6 shadow-sm">
//       <h3 className="text-sm font-semibold">{title}</h3>
//       <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
//         {items.map((t) => (
//           <li key={t}>• {t}</li>
//         ))}
//       </ul>
//     </div>
//   );
// }

// function KV({ label, value }: { label: string; value: string }) {
//   return (
//     <div className="flex items-center justify-between rounded-xl border bg-slate-50 px-4 py-3">
//       <div className="text-xs text-muted-foreground">{label}</div>
//       <div className="text-sm font-semibold">{value}</div>
//     </div>
//   );
// }








"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme/theme-toggle";

type ChatMsg = {
  role: "user" | "assistant";
  text: string;
  ts: number;
};

type DemandProfile = {
  quantity?: number;
  quantityUnit?: "gallons/day" | "m3/day";
  industryType?: string;
};

function fmt(v: any) {
  return v === null || v === undefined || v === "" ? "—" : String(v);
}

/* ---------------- UI helpers (match Producer theme) ---------------- */

function SectionTitle({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h2 className="text-base font-semibold tracking-tight">{title}</h2>
        {subtitle ? (
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        ) : null}
      </div>
      {right ? <div className="shrink-0">{right}</div> : null}
    </div>
  );
}

function GradientCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={[
        "relative rounded-3xl p-[1px]",
        "dark:bg-gradient-to-r dark:from-emerald-500/60 dark:via-sky-500/60 dark:to-indigo-500/60",
        className ?? "",
      ].join(" ")}
    >
      <div className="relative overflow-hidden rounded-3xl border bg-card p-6 shadow-sm dark:border-transparent md:p-8">
        {/* subtle outer glow (dark only) */}
        <div
          className="
            pointer-events-none absolute -inset-1 -z-10 hidden dark:block
            blur-2xl opacity-60
            bg-gradient-to-r from-emerald-500/20 via-sky-500/20 to-indigo-500/20
          "
        />

        {/* subtle water wave tint */}
        <div className="pointer-events-none absolute inset-0 -z-10 opacity-60">
          <div className="absolute -top-24 left-1/2 h-48 w-[900px] -translate-x-1/2 rounded-full bg-gradient-to-r from-emerald-400/10 via-sky-400/10 to-indigo-400/10 blur-3xl" />
          <svg
            className="absolute bottom-0 left-0 right-0 w-full opacity-30"
            viewBox="0 0 1440 120"
            preserveAspectRatio="none"
          >
            <path
              d="M0,64 C120,32 240,32 360,64 C480,96 600,96 720,64 C840,32 960,32 1080,64 C1200,96 1320,96 1440,64 L1440,120 L0,120 Z"
              fill="currentColor"
              className="text-sky-500/20"
            />
          </svg>
        </div>

        {children}
      </div>
    </div>
  );
}

function Card({
  title,
  subtitle,
  children,
  right,
}: {
  title?: string;
  subtitle?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border bg-card p-6 shadow-sm md:p-8">
      {title ? (
        <div className="mb-5">
          <SectionTitle title={title} subtitle={subtitle} right={right} />
        </div>
      ) : null}
      {children}
    </div>
  );
}

function BadgePill({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center rounded-full border bg-background/60 px-3 py-1 text-xs font-semibold text-muted-foreground">
      {children}
    </div>
  );
}

function KV({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border bg-background/50 px-4 py-3">
      <div className="text-xs font-semibold text-muted-foreground">{label}</div>
      <div className="text-sm font-semibold">{value}</div>
    </div>
  );
}

function SidebarItem({
  title,
  subtitle,
  active,
}: {
  title: string;
  subtitle: string;
  active?: boolean;
}) {
  return (
    <div
      className={[
        "mb-2 rounded-2xl px-4 py-3 text-sm transition",
        active ? "bg-muted font-semibold" : "hover:bg-muted/50 text-muted-foreground",
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
          "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm border",
          isUser
            ? "bg-foreground text-background border-foreground/20"
            : "bg-background/50 text-foreground border-border",
        ].join(" ")}
      >
        {text}
      </div>
    </div>
  );
}

function InfoCard({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-3xl border bg-card p-6 shadow-sm md:p-8">
      <h3 className="text-sm font-semibold">{title}</h3>
      <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
        {items.map((t) => (
          <li key={t}>• {t}</li>
        ))}
      </ul>
    </div>
  );
}

/* ---------------- Page ---------------- */

export default function ConsumerDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  // 1 = ask quantity, 2 = ask industry/use-case, 3 = ready to view matches
  const [step, setStep] = useState<1 | 2 | 3>(1);

  const [demand, setDemand] = useState<DemandProfile>({
    quantityUnit: "gallons/day",
  });

  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      role: "assistant",
      text: "How much quantity of water do you need? (Enter a number)",
      ts: Date.now(),
    },
  ]);

  const [text, setText] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);

  // ✅ Keep your existing session logic (hydrosync_user)
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

  async function createDemandAndGoToOptions() {
    try {
      // session
      const stored = localStorage.getItem("hydrosync_user");
      if (!stored) {
        router.replace("/login");
        return;
      }
      const u = JSON.parse(stored);

      // make sure intake finished
      if (step !== 3 || !demand.quantity || !demand.industryType) {
        alert("Please complete intake first.");
        return;
      }

      // call backend: save into consumer_demands
      const res = await fetch("/api/consumer/demand", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          consumerUserId: u.userId || u._id || u.id, // whichever exists in your session
          consumerName: u.orgName || u.username,
          location: {
            city: u.city,
            state: u.state,
            lat: u.lat ?? null, // ok if not present
            lng: u.lng ?? null,
          },
          industryNeed: demand.industryType,
          quantityNeededGallonsPerDay: Number(demand.quantity),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("Demand save failed:", data);
        alert(data?.error || "Failed to save demand");
        return;
      }

      // store demandId for /consumer/options page
      localStorage.setItem("hydrosync_last_demand_id", data.demandId);

      // go to options page
      router.push("/consumer/options");
    } catch (e) {
      console.error(e);
      alert("Something went wrong while saving demand.");
    }
  }

  async function send() {
    const trimmed = text.trim();
    if (!trimmed) return;

    setStatus(null);

    // show user message
    setMessages((prev) => [...prev, { role: "user", text: trimmed, ts: Date.now() }]);
    setText("");

    // STEP 1: Quantity
    if (step === 1) {
      const num = Number(trimmed.replace(/,/g, ""));
      if (!Number.isFinite(num) || num <= 0) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            text: "Please enter a valid number (example: 50000).",
            ts: Date.now(),
          },
        ]);
        return;
      }

      setDemand((d) => ({ ...d, quantity: num }));
      setStep(2);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text:
            "Great. What is the need (industry type)? Example: Data Center cooling, Agriculture irrigation, Manufacturing process.",
          ts: Date.now(),
        },
      ]);

      return;
    }

    // STEP 2: Industry type
    if (step === 2) {
      if (trimmed.length < 2) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            text: "Please enter a valid industry type.",
            ts: Date.now(),
          },
        ]);
        return;
      }

      setDemand((d) => ({ ...d, industryType: trimmed }));
      setStep(3);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text:
            "Perfect. I’ve created your Water Demand Profile. Click “See Matches” to view available producer options.",
          ts: Date.now(),
        },
      ]);

      return;
    }

    // STEP 3: optional
    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        text: "You can proceed to matches now.",
        ts: Date.now(),
      },
    ]);
  }

  // avoid flash while session loads
  if (!user) return null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Background glow (same as Producer pages) */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute left-1/2 top-[-140px] h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-gradient-to-b from-emerald-400/20 via-sky-400/15 to-transparent blur-3xl" />
        <div className="absolute bottom-[-220px] right-[-180px] h-[520px] w-[520px] rounded-full bg-gradient-to-tr from-indigo-400/15 via-sky-400/10 to-transparent blur-3xl" />
      </div>

      {/* Top bar (match Producer: logo + ThemeToggle + Logout) */}
      <div className="sticky top-0 z-20 border-b bg-background/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-foreground text-background">
                <span className="text-sm font-black">H</span>
              </div>
              <div className="leading-tight hidden sm:block">
                <div className="text-sm font-extrabold">HydroSync</div>
                <div className="text-[11px] text-muted-foreground">Consumer Console</div>
              </div>
            </Link>

            <div className="ml-2">
              <h1 className="text-xl font-semibold tracking-tight">Matches & Requests</h1>
              <p className="text-sm text-muted-foreground">
                Answer 2 quick questions. Then we’ll show producer options.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium">{user.orgName}</p>
              <p className="text-xs text-muted-foreground">
                {user.city ? `${user.city}, ${user.state ?? ""}` : "Consumer"}
              </p>
            </div>

            <ThemeToggle />

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
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-8 space-y-6">
        {/* HERO (use GradientCard like Producer) */}
        <GradientCard>
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <BadgePill>Water Passport • Consumer Intake</BadgePill>
              <h2 className="mt-3 text-2xl font-black tracking-tight">
                Create your <span className="bg-gradient-to-r from-emerald-600 via-sky-600 to-indigo-600 bg-clip-text text-transparent dark:bg-none dark:text-white dark:text-opacity-95 dark:[-webkit-text-fill-color:unset]">Demand Profile</span>
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <BadgePill>Step {step}/3</BadgePill>
            </div>
          </div>
        </GradientCard>

        {/* Content grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Chat panel */}
          <div className="lg:col-span-2">
            <Card
              title="Water Requirement Intake"
              subtitle={`Step ${step}/3 • Quantity → Need → Matches`}
              right={<BadgePill>Guided</BadgePill>}
            >
              <div className="h-[520px] overflow-y-auto pr-1">
                <div className="space-y-4">
                  {messages.map((m, idx) => (
                    <ChatBubble key={idx} role={m.role} text={m.text} />
                  ))}
                  <div ref={endRef} />
                </div>
              </div>

              <div className="mt-5 border-t pt-4">
                <div className="flex gap-2">
                  <Input
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder={
                      step === 1
                        ? "Enter quantity (e.g., 50000)"
                        : step === 2
                        ? "Enter need / industry type (e.g., Data Center cooling)"
                        : "Optional notes…"
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") send();
                    }}
                  />
                  <Button onClick={send} disabled={!canSend}>
                    Send
                  </Button>
                </div>

                {status ? (
                  <p className="mt-2 text-xs text-muted-foreground">{status}</p>
                ) : null}
              </div>
            </Card>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            <InfoCard
              title="What we will collect"
              items={[
                "Quantity needed (per day)",
                "Need / industry type",
                "Location (from your profile)",
              ]}
            />

            <Card
              title="Structured Demand (preview)"
              subtitle="This updates as you answer."
              right={<BadgePill>Live</BadgePill>}
            >
              <div className="grid gap-3">
                <KV label="Industry / Need" value={demand.industryType ?? "—"} />
                <KV label="Quantity" value={demand.quantity ? `${demand.quantity}` : "—"} />
                <KV label="Unit" value={demand.quantityUnit ?? "—"} />
                <KV
                  label="Location"
                  value={user.city ? `${user.city}, ${user.state ?? ""}` : "—"}
                />
              </div>
            </Card>

            <Card title="Next" subtitle="Once intake is complete, you can view producer options.">
              <div className="space-y-3">
                <Button className="w-full" disabled={step !== 3} onClick={createDemandAndGoToOptions}>
                  See Matches
                </Button>

                {step !== 3 ? (
                  <p className="text-xs text-muted-foreground">
                    Answer both questions to enable matches.
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Your demand profile is ready. Proceed to view compatible producers.
                  </p>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
