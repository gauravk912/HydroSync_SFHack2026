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

  async function onSubmit(values: FormData) {
  setServerError(null);

  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: values.username,
      password: values.password,
    }),
  });

  // safer than res.json() if server returns HTML errors
  const text = await res.text();
  let data: any = {};
  try {
    data = JSON.parse(text);
  } catch {
    // leave as {}
  }

  if (!res.ok) {
    setServerError(data?.error ?? "Login failed.");
    return;
  }

  // ✅ store user for hackathon-simple session
  localStorage.setItem("hydrosync_user", JSON.stringify(data.user));

  router.push("/dashboard");
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