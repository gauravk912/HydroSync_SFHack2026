"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthShell } from "@/components/auth-shell";
// import { loginMock } from "@/lib/mock-auth";

const schema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { username: "", password: "" },
  });

  // function onSubmit(data: FormData) {
  //   setServerError(null);

  //   const res = loginMock(data.username, data.password);

  //   if (!res.ok) {
  //     setServerError(res.error ?? "Login failed.");
  //     return;
  //   }

  //   router.push("/dashboard");
  // }

  async function onSubmit(data: FormData) {
  setServerError(null);

  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: data.username.trim(),
        password: data.password,
      }),
    });

    const text = await res.text();
    let json: any = {};
    try {
      json = JSON.parse(text);
    } catch {}

    if (!res.ok) {
      setServerError(json?.error ?? "Login failed.");
      return;
    }

    // Build a user object no matter what the API returns
    const user =
      json?.user ??
      {
        id: json?.userId,
        role: json?.role,
        username: json?.username,
        orgName: json?.orgName ?? json?.industryName ?? null,
        city: json?.city ?? null,
        state: json?.state ?? null,
        address: json?.address ?? null,
        consumerType: json?.consumerType ?? null,
      };
    
    console.log("LOGIN RESPONSE:", json);


    // If still missing essentials, treat as failure
    if (!user?.id || !user?.role || !user?.username) {
      setServerError("Login response missing user data. Check /api/auth/login.");
      return;
    }

    localStorage.setItem("hydrosync_user", JSON.stringify(user));
    console.log("Saved hydrosync_user:", localStorage.getItem("hydrosync_user"));

    router.push("/dashboard");

  } catch (e: any) {
    setServerError(e?.message || "Network error");
  }
}

  return (
    <AuthShell
      title="Sign in to HydroSync"
      subtitle="Welcome back"
    >
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            placeholder="figo123"
            autoComplete="username"
            {...form.register("username")}
          />

          {form.formState.errors.username && (
            <p className="text-sm text-destructive">
              {form.formState.errors.username.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
            {...form.register("password")}
          />

          {form.formState.errors.password && (
            <p className="text-sm text-destructive">
              {form.formState.errors.password.message}
            </p>
          )}
        </div>

        {serverError && (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            {serverError}
          </div>
        )}

        <Button type="submit" className="w-full">
          Sign in
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Don’t have an account?{" "}
          <Link
            className="text-foreground underline underline-offset-4"
            href="/signup"
          >
            Create one
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}