"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem("hydrosync_user");

    if (!stored) {
      router.push("/login");
      return;
    }

    try {
      setUser(JSON.parse(stored));
    } catch {
      localStorage.removeItem("hydrosync_user");
      router.push("/login");
    }
  }, [router]);

  if (!user) {
    return (
      <div className="min-h-screen p-8">
        <div className="mx-auto max-w-4xl">
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">HydroSync Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Signed in as <span className="text-foreground">{user.username}</span>
              {user.role ? (
                <>
                  {" "}
                  · <span className="capitalize">{user.role}</span>
                </>
              ) : null}
            </p>
          </div>

          <Button
            variant="outline"
            onClick={() => {
              localStorage.removeItem("hydrosync_user");
              router.push("/login");
            }}
          >
            Log out
          </Button>
        </div>

        <div className="mt-8 rounded-xl border bg-card p-6">
          <h2 className="text-lg font-semibold">Next step: CRUD</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            We’ll add your producer/consumer flows (upload + results) here next.
          </p>
        </div>
      </div>
    </div>
  );
}
