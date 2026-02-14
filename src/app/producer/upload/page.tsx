// "use client";

// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";

// export default function ProducerUploadPage() {
//   const router = useRouter();
//   const [file, setFile] = useState<File | null>(null);
//   const [status, setStatus] = useState<string | null>(null);

//   useEffect(() => {
//     const role = localStorage.getItem("hydrosync_role");
//     const userId = localStorage.getItem("hydrosync_userId");

//     // Must be logged in + producer
//     if (!userId) router.replace("/login");
//     if (role !== "producer") router.replace("/dashboard");
//   }, [router]);

//   async function handleUpload() {
//     if (!file) {
//       setStatus("Please select a PDF first.");
//       return;
//     }

//     setStatus("Uploading...");

//     const userId = localStorage.getItem("hydrosync_userId");

//     const formData = new FormData();
//     formData.append("file", file);
//     formData.append("userId", userId || "");

//     const res = await fetch("/api/producer/upload-report", {
//       method: "POST",
//       body: formData,
//     });

//     const data = await res.json();

//     if (!res.ok) {
//       setStatus(data?.error || "Upload failed");
//       return;
//     }

//     setStatus("Uploaded successfully ✅");
//     // Later: router.push(`/producer/reports/${data.reportId}`)
//   }

//   return (
//     <div className="mx-auto max-w-xl p-6 space-y-6">
//       <div>
//         <h1 className="text-2xl font-semibold">Upload Water Quality Lab Report</h1>
//         <p className="text-sm text-muted-foreground">
//           Upload a PDF report. We’ll extract key metrics and store it in HydroSync.
//         </p>
//       </div>

//       <div className="space-y-2">
//         <Label htmlFor="pdf">Lab report (PDF)</Label>
//         <Input
//           id="pdf"
//           type="file"
//           accept="application/pdf"
//           onChange={(e) => setFile(e.target.files?.[0] || null)}
//         />
//       </div>

//       <Button onClick={handleUpload} disabled={!file}>
//         Upload report
//       </Button>

//       {status && <p className="text-sm">{status}</p>}
//     </div>
//   );
// }


"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function bytesToMB(bytes: number) {
  return Math.round((bytes / (1024 * 1024)) * 10) / 10;
}

export default function ProducerUploadPage() {
  const router = useRouter();

  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [status, setStatus] = useState<
    | { type: "idle" }
    | { type: "loading"; message: string }
    | { type: "success"; message: string }
    | { type: "error"; message: string }
  >({ type: "idle" });

  const canUpload = useMemo(() => !!file && status.type !== "loading", [file, status.type]);

  useEffect(() => {
    const role = localStorage.getItem("hydrosync_role");
    const userId = localStorage.getItem("hydrosync_userId");

    if (!userId) {
      router.replace("/login");
      return;
    }
    if (role !== "producer") {
      router.replace("/dashboard");
      return;
    }
  }, [router]);

  function onPickFile(f: File | null) {
    if (!f) return;

    if (f.type !== "application/pdf") {
      setStatus({ type: "error", message: "Only PDF files are allowed." });
      return;
    }

    // Keep it hackathon-safe: limit size (adjust as needed)
    if (f.size > 15 * 1024 * 1024) {
      setStatus({ type: "error", message: "PDF is too large. Please upload a file under 15MB." });
      return;
    }

    setFile(f);
    setStatus({ type: "idle" });
  }

  async function handleUpload() {
    if (!file) {
      setStatus({ type: "error", message: "Please select a PDF first." });
      return;
    }

    setStatus({ type: "loading", message: "Uploading report..." });

    try {
      const userId = localStorage.getItem("hydrosync_userId") || "";

      const formData = new FormData();
      formData.append("file", file);
      formData.append("userId", userId);

      const res = await fetch("/api/producer/upload-report", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus({ type: "error", message: data?.error || "Upload failed." });
        return;
      }

      setStatus({ type: "success", message: "Uploaded. Next: Extracting key water metrics..." });

      // Next step later: redirect to review page:
      // router.push(`/producer/reports/${data.reportId}`);
    } catch (e: any) {
      setStatus({ type: "error", message: e?.message || "Network error." });
    }
  }

  return (
  <div className="min-h-screen bg-slate-50">
    <div className="flex">
      {/* Sidebar */}
      <aside className="hidden w-64 border-r bg-white lg:block">
        <div className="px-6 py-5">
          <div className="text-xs text-muted-foreground">HydroSync</div>
          <div className="text-lg font-semibold">Producer Console</div>
        </div>

        <nav className="px-3 pb-6">
          <SidebarItem active title="Lab Report Intake" subtitle="Upload & extract" />
          {/* <SidebarItem title="Water Passports" subtitle="Review & publish" />
          <SidebarItem title="My Facilities" subtitle="Sites & metadata" />
          <SidebarItem title="Settings" subtitle="Profile & security" /> */}
        </nav>

        <div className="mt-auto px-6 pb-6">
          <div className="rounded-xl border bg-slate-50 p-4 text-xs text-muted-foreground">
            Tip: Upload the latest report for faster verification.
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1">
        {/* Top bar */}
        <div className="sticky top-0 z-10 border-b bg-white/80 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Producer Console</p>
              <h1 className="text-xl font-semibold tracking-tight">Lab Report Intake</h1>
              <p className="text-sm text-muted-foreground">
                Upload a water quality PDF and generate a verified “Water Passport”.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-medium">Acme Manufacturing</p>
                <p className="text-xs text-muted-foreground">San Francisco, CA</p>
              </div>

              <Button variant="outline" onClick={() => {
                localStorage.removeItem("hydrosync_userId");
                localStorage.removeItem("hydrosync_role");
                localStorage.removeItem("hydrosync_username");
                router.replace("/login");
              }}>
                Logout
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-6 py-8 lg:grid-cols-3">
          {/* Main card */}
          <div className="lg:col-span-2 space-y-6">
            {/* Facility context (mock) */}
            {/* <div className="rounded-2xl border bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="text-sm font-semibold">Facility Context</div>
                  <div className="text-xs text-muted-foreground">
                    (UI-only) We’ll attach the report to the selected facility.
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline">Select Facility</Button>
                  <Button variant="outline">Add Facility</Button>
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <MetricPill label="Facility ID" value="SF-ACME-001" />
                <MetricPill label="Sampling Window" value="24–72 hours" />
                <MetricPill label="Verification" value="Pending" />
              </div>
            </div> */}

            {/* Upload card */}
            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <div className="mb-6 grid grid-cols-3 gap-3">
                <StepCard title="1) Upload" active />
                <StepCard title="2) Extract" />
                <StepCard title="3) Review & Submit" />
              </div>

              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold">Upload Water Quality Report (PDF)</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Supported: standard lab PDFs. We’ll extract pH, TDS, turbidity, COD/BOD (if present),
                    timestamps, and facility metadata.
                  </p>
                </div>

                {/* UI-only actions */}
                {/* <div className="flex gap-2">
                  <Button variant="outline">Download Template</Button>
                  <Button variant="outline">View Example</Button>
                </div> */}
              </div>

              {/* Dropzone */}
              <div
                className={[
                  "mt-6 rounded-xl border-2 border-dashed p-6 transition",
                  dragOver ? "border-black bg-slate-50" : "border-slate-200 bg-white",
                ].join(" ")}
                onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); setDragOver(true); }}
                onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setDragOver(true); }}
                onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setDragOver(false); }}
                onDrop={(e) => {
                  e.preventDefault(); e.stopPropagation(); setDragOver(false);
                  const f = e.dataTransfer.files?.[0];
                  onPickFile(f || null);
                }}
              >
                <div className="flex flex-col items-center justify-center gap-2 text-center">
                  <div className="text-sm font-medium">Drag & drop your PDF here</div>
                  <div className="text-xs text-muted-foreground">or choose a file from your computer</div>

                  <div className="mt-2 w-full max-w-sm">
                    <Label htmlFor="pdf" className="sr-only">Lab report PDF</Label>
                    <Input
                      id="pdf"
                      type="file"
                      accept="application/pdf"
                      onChange={(e) => onPickFile(e.target.files?.[0] || null)}
                    />
                  </div>
                </div>
              </div>

              {/* File preview */}
              <div className="mt-4 rounded-xl border bg-slate-50 p-4">
                {!file ? (
                  <p className="text-sm text-muted-foreground">No file selected yet.</p>
                ) : (
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        PDF • {bytesToMB(file.size)} MB • Ready to upload
                      </p>
                    </div>

                    <Button variant="outline" onClick={() => { setFile(null); setStatus({ type: "idle" }); }}>
                      Remove
                    </Button>
                  </div>
                )}
              </div>

              {/* Status + actions */}
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm">
                  {status.type === "idle" && <span className="text-muted-foreground">Ready when you are.</span>}
                  {status.type === "loading" && <span className="text-muted-foreground">{status.message}</span>}
                  {status.type === "success" && <span className="text-emerald-700">{status.message}</span>}
                  {status.type === "error" && <span className="text-red-600">{status.message}</span>}
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => router.push("/dashboard")}>Back</Button>
                  <Button onClick={handleUpload} disabled={!canUpload}>
                    {status.type === "loading" ? "Uploading..." : "Upload & Extract"}
                  </Button>
                </div>
              </div>
            </div>

            {/* Mock “Extraction Preview” card */}
            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold">Extraction Preview</h3>
                  <p className="text-xs text-muted-foreground">
                    (UI-only) After upload, we’ll show extracted values here before you publish.
                  </p>
                </div>
                <Button variant="outline" disabled>Review Draft</Button>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <MetricCard title="pH" value="—" hint="Target: 6.5–8.5" />
                <MetricCard title="TDS" value="—" hint="mg/L" />
                <MetricCard title="Turbidity" value="—" hint="NTU" />
                <MetricCard title="COD" value="—" hint="mg/L" />
                <MetricCard title="BOD" value="—" hint="mg/L" />
                <MetricCard title="Sample Time" value="—" hint="timestamp" />
              </div>
            </div>
          </div>

          {/* Right sidebar cards */}
          <div className="space-y-6">
            <InfoCard
              title="What happens next"
              items={[
                "We store your PDF securely for traceability.",
                "Gemini extracts key water metrics into a “Water Passport”.",
                "You review & confirm before publishing to consumers.",
              ]}
            />

            <InfoCard
              title="Compliance hints"
              items={[
                "Include sampling time, facility ID, and units when possible.",
                "We normalize units automatically.",
                "You can add facility metadata before publishing.",
              ]}
            />

            {/* Fake recent uploads table */}
            {/* <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <h3 className="text-sm font-semibold">Recent uploads</h3>
              <p className="mt-1 text-xs text-muted-foreground">(UI-only) Demo rows for now.</p>

              <div className="mt-4 space-y-3">
                <RecentRow name="Jan_plant_lab_report.pdf" status="Verified" />
                <RecentRow name="CoolingTower_sample.pdf" status="Processing" />
                <RecentRow name="Wastewater_batch_17.pdf" status="Needs Review" />
              </div>
            </div> */}
          </div>
        </div>
      </main>
    </div>
  </div>
);
}

function StepCard({ title, active }: { title: string; active?: boolean }) {
  return (
    <div
      className={[
        "rounded-xl border px-3 py-3 text-sm",
        active ? "border-black bg-slate-50" : "border-slate-200 bg-white",
      ].join(" ")}
    >
      <div className={active ? "font-semibold" : "font-medium text-muted-foreground"}>{title}</div>
      <div className="text-xs text-muted-foreground">{active ? "Current step" : "Pending"}</div>
    </div>
  );
}

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

function MetricPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border bg-white px-4 py-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-sm font-semibold">{value}</div>
    </div>
  );
}

function MetricCard({ title, value, hint }: { title: string; value: string; hint: string }) {
  return (
    <div className="rounded-xl border bg-slate-50 p-4">
      <div className="text-xs text-muted-foreground">{title}</div>
      <div className="mt-1 text-lg font-semibold">{value}</div>
      <div className="text-xs text-muted-foreground">{hint}</div>
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

function RecentRow({ name, status }: { name: string; status: "Verified" | "Processing" | "Needs Review" }) {
  const badge =
    status === "Verified"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : status === "Processing"
      ? "bg-slate-50 text-slate-700 border-slate-200"
      : "bg-amber-50 text-amber-700 border-amber-200";

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border bg-white p-3">
      <div className="min-w-0">
        <div className="truncate text-sm font-medium">{name}</div>
        <div className="text-xs text-muted-foreground">Uploaded • Demo</div>
      </div>
      <div className={`shrink-0 rounded-full border px-3 py-1 text-xs ${badge}`}>{status}</div>
    </div>
  );
}