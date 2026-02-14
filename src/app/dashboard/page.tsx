"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem("hydrosync_user");
    if (!stored) {
      router.replace("/login");
      return;
    }

    try {
      const user = JSON.parse(stored);

      if (user?.role === "producer") {
        router.replace("/producer/upload"); // ✅ correct route
        return;
      }

      if (user?.role === "consumer") {
        router.replace("/consumer/dashboard");
        return;
      }

      router.replace("/login");
    } catch {
      localStorage.removeItem("hydrosync_user");
      router.replace("/login");
    }
  }, [router]);

  return (
    <div className="min-h-screen p-8">
      <div className="mx-auto max-w-4xl">
        <p className="text-sm text-muted-foreground">Routing to your dashboard...</p>
      </div>
    </div>
  );
}
