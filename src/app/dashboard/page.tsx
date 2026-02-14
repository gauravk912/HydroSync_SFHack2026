"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem("hydrosync_user");

    // Not logged in → go login
    if (!stored) {
      router.replace("/login");
      return;
    }

    let user: any = null;
    try {
      user = JSON.parse(stored);
    } catch {
      localStorage.removeItem("hydrosync_user");
      router.replace("/login");
      return;
    }

    const role = user?.role;

    // Role-based routing
    if (role === "producer") {
      router.replace("/producer/upload");
      return;
    }

    if (role === "consumer") {
      router.replace("/consumer/dashboard");
      return;
    }

    // Unknown role fallback
    router.replace("/login");
  }, [router]);

  return (
    <div className="min-h-screen p-8">
      <div className="mx-auto max-w-4xl">
        <p className="text-sm text-muted-foreground">
          Routing to your dashboard...
        </p>
      </div>
    </div>
  );
}
