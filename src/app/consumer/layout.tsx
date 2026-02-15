"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function ConsumerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem("hydrosync_user");
    if (!stored) {
      router.replace("/login");
      return;
    }

    try {
      const u = JSON.parse(stored);
      if (u?.role !== "consumer") {
        router.replace("/dashboard");
        return;
      }
      setUser(u);
    } catch {
      localStorage.removeItem("hydrosync_user");
      router.replace("/login");
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top bar (single) */}
      {/* <div className="sticky top-0 z-10 border-b bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Consumer Console</p>
            <h1 className="text-xl font-semibold tracking-tight">Matches & Requests</h1>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <div className="hidden text-right sm:block">
                <p className="text-sm font-medium">
                  {user.orgName ?? user.industryName ?? "—"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {user.city ?? "—"}, {user.state ?? "—"}
                </p>
              </div>
            ) : null}

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
      </div> */}

      {children}
    </div>
  );
}
