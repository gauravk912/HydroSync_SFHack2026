"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

type Status =
  | { type: "idle" }
  | { type: "loading"; message: string }
  | { type: "success"; message: string }
  | { type: "error"; message: string };

function bytesToMB(bytes: number) {
  return Math.round((bytes / (1024 * 1024)) * 10) / 10;
}

export default function ProducerUploadPage() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [status, setStatus] = useState<Status>({ type: "idle" });
  const [loading, setLoading] = useState(false);

  const canUpload = useMemo(
    () => !!file && status.type !== "loading" && !loading,
    [file, status.type, loading]
  );

  useEffect(() => {
    const stored = localStorage.getItem("hydrosync_user");
    if (!stored) {
      router.replace("/login");
      return;
    }

    try {
      const u = JSON.parse(stored);
      if (u?.role !== "producer") {
        router.replace("/dashboard");
        return;
      }
      setUser(u);
    } catch {
      localStorage.removeItem("hydrosync_user");
      router.replace("/login");
    }
  }, [router]);

  function onPickFile(f: File | null) {
    if (!f) return;

    if (f.type !== "application/pdf") {
      setStatus({ type: "error", message: "Only PDF files are allowed." });
      return;
    }

    if (f.size > 15 * 1024 * 1024) {
      setStatus({
        type: "error",
        message: "PDF is too large. Please upload a file under 15MB.",
      });
      return;
    }

    setFile(f);
    setStatus({ type: "idle" });
  }

  async function handleUploadExtract() {
    if (!file) {
      setStatus({ type: "error", message: "Please select a PDF first." });
      return;
    }
    if (!user?.id) {
      setStatus({
        type: "error",
        message: "Missing user session. Please login again.",
      });
      localStorage.removeItem("hydrosync_user");
      router.replace("/login");
      return;
    }

    setLoading(true);
    setStatus({ type: "loading", message: "Uploading & extracting via Gemini..." });

    try {
      const fd = new FormData();
      // IMPORTANT: must match your backend route.ts -> form.get("pdf")
      fd.append("pdf", file);
      // Optional: attach userId if you want to associate producer with report
      fd.append("userId", user.id);

      const res = await fetch("/api/reports", {
        method: "POST",
        body: fd,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Extraction failed");
      }

      setStatus({ type: "success", message: "Extraction complete. Redirecting to review..." });

      router.push(`/producer/review/${data.reportId}`);
    } catch (err: any) {
      setStatus({ type: "error", message: err?.message || "Network error." });
    } finally {
      setLoading(false);
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
                  <p className="text-sm font-medium">
                    {user?.orgName ?? user?.industryName ?? "—"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {user?.city ?? "—"}, {user?.state ?? "—"}
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
            </div>
          </div>

          {/* Content */}
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-6 py-8 lg:grid-cols-3">
            {/* Main card */}
            <div className="lg:col-span-2 space-y-6">
              {/* Upload card */}
              <div className="rounded-2xl border bg-white p-6 shadow-sm">
              

                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold">Upload Water Quality Report (PDF)</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Supported: standard lab PDFs. We’ll extract pH, TDS, turbidity, COD/BOD (if present),
                      timestamps, and facility metadata.
                    </p>
                  </div>
                </div>

                {/* Dropzone */}
                <div
                  className={[
                    "mt-6 rounded-xl border-2 border-dashed p-6 transition",
                    dragOver ? "border-black bg-slate-50" : "border-slate-200 bg-white",
                  ].join(" ")}
                  onDragEnter={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setDragOver(true);
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setDragOver(true);
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setDragOver(false);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setDragOver(false);
                    const f = e.dataTransfer.files?.[0];
                    onPickFile(f || null);
                  }}
                >
                  <div className="flex flex-col items-center justify-center gap-2 text-center">
                    <div className="text-sm font-medium">Drag & drop your PDF here</div>
                    <div className="text-xs text-muted-foreground">or choose a file from your computer</div>

                    <div className="mt-2 w-full max-w-sm">
                      <Label htmlFor="pdf" className="sr-only">
                        Lab report PDF
                      </Label>
                      <input
                        id="pdf"
                        type="file"
                        accept="application/pdf"
                        onChange={(e) => onPickFile(e.target.files?.[0] ?? null)}
                        disabled={loading || status.type === "loading"}
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

                      <Button
                        variant="outline"
                        onClick={() => {
                          setFile(null);
                          setStatus({ type: "idle" });
                        }}
                        disabled={loading || status.type === "loading"}
                      >
                        Remove
                      </Button>
                    </div>
                  )}
                </div>

                {/* Status + actions */}
                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="text-sm">
                    {status.type === "idle" && (
                      <span className="text-muted-foreground">Ready when you are.</span>
                    )}
                    {status.type === "loading" && (
                      <span className="text-muted-foreground">{status.message}</span>
                    )}
                    {status.type === "success" && (
                      <span className="text-emerald-700">{status.message}</span>
                    )}
                    {status.type === "error" && (
                      <span className="text-red-600">{status.message}</span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => router.push("/dashboard")}>
                      Back
                    </Button>

                    <Button onClick={handleUploadExtract} disabled={!canUpload}>
                      {loading ? "Extracting..." : "Upload & Extract"}
                    </Button>
                  </div>
                </div>
              </div>

            </div>

            {/* Right sidebar */}
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
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

/* ---------- Components ---------- */

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
        "mb-2 rounded-xl px-4 py-3 text-sm transition",
        active ? "bg-slate-100 font-medium" : "hover:bg-slate-50 text-muted-foreground",
      ].join(" ")}
    >
      <div className="text-sm">{title}</div>
      <div className="text-xs text-muted-foreground">{subtitle}</div>
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
