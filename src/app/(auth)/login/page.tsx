// "use client";

// import Link from "next/link";
// import { useRouter } from "next/navigation";
// import { useState } from "react";
// import { useForm } from "react-hook-form";
// import { z } from "zod";
// import { zodResolver } from "@hookform/resolvers/zod";

// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { AuthShell } from "@/components/auth-shell";
// // import { loginMock } from "@/lib/mock-auth";

// const schema = z.object({
//   username: z.string().min(1, "Username is required"),
//   password: z.string().min(1, "Password is required"),
// });

// type FormData = z.infer<typeof schema>;

// export default function LoginPage() {
//   const router = useRouter();
//   const [serverError, setServerError] = useState<string | null>(null);

//   const form = useForm<FormData>({
//     resolver: zodResolver(schema),
//     defaultValues: { username: "", password: "" },
//   });

//   // function onSubmit(data: FormData) {
//   //   setServerError(null);

//   //   const res = loginMock(data.username, data.password);

//   //   if (!res.ok) {
//   //     setServerError(res.error ?? "Login failed.");
//   //     return;
//   //   }

//   //   router.push("/dashboard");
//   // }

//   async function onSubmit(data: FormData) {
//   setServerError(null);

//   try {
//     const res = await fetch("/api/auth/login", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         username: data.username.trim(),
//         password: data.password,
//       }),
//     });

//     const text = await res.text();
//     let json: any = {};
//     try {
//       json = JSON.parse(text);
//     } catch {}

//     if (!res.ok) {
//       setServerError(json?.error ?? "Login failed.");
//       return;
//     }

//     // Build a user object no matter what the API returns
//     const user =
//       json?.user ??
//       {
//         id: json?.userId,
//         role: json?.role,
//         username: json?.username,
//         orgName: json?.orgName ?? json?.industryName ?? null,
//         city: json?.city ?? null,
//         state: json?.state ?? null,
//         address: json?.address ?? null,
//         consumerType: json?.consumerType ?? null,
//       };
    
//     console.log("LOGIN RESPONSE:", json);


//     // If still missing essentials, treat as failure
//     if (!user?.id || !user?.role || !user?.username) {
//       setServerError("Login response missing user data. Check /api/auth/login.");
//       return;
//     }

//     localStorage.setItem("hydrosync_user", JSON.stringify(user));
//     console.log("Saved hydrosync_user:", localStorage.getItem("hydrosync_user"));

//     router.push("/dashboard");

//   } catch (e: any) {
//     setServerError(e?.message || "Network error");
//   }
// }

//   return (
//     <AuthShell
//       title="Sign in to HydroSync"
//       subtitle="Welcome back"
//     >
//       <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
//         <div className="space-y-2">
//           <Label htmlFor="username">Username</Label>
//           <Input
//             id="username"
//             placeholder="figo123"
//             autoComplete="username"
//             {...form.register("username")}
//           />

//           {form.formState.errors.username && (
//             <p className="text-sm text-destructive">
//               {form.formState.errors.username.message}
//             </p>
//           )}
//         </div>

//         <div className="space-y-2">
//           <Label htmlFor="password">Password</Label>
//           <Input
//             id="password"
//             type="password"
//             placeholder="••••••••"
//             autoComplete="current-password"
//             {...form.register("password")}
//           />

//           {form.formState.errors.password && (
//             <p className="text-sm text-destructive">
//               {form.formState.errors.password.message}
//             </p>
//           )}
//         </div>

//         {serverError && (
//           <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
//             {serverError}
//           </div>
//         )}

//         <Button type="submit" className="w-full">
//           Sign in
//         </Button>

//         <p className="text-center text-sm text-muted-foreground">
//           Don’t have an account?{" "}
//           <Link
//             className="text-foreground underline underline-offset-4"
//             href="/signup"
//           >
//             Create one
//           </Link>
//         </p>
//       </form>
//     </AuthShell>
//   );
// }





"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/theme/theme-toggle";

// If you still want to keep AuthShell, you can — but this design does not need it.
// import { AuthShell } from "@/components/auth-shell";

const schema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { username: "", password: "" },
  });

  const year = useMemo(() => new Date().getFullYear(), []);

  async function onSubmit(data: FormData) {
    setServerError(null);
    setIsSubmitting(true);

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
        setIsSubmitting(false);
        return;
      }

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

      if (!user?.id || !user?.role || !user?.username) {
        setServerError("Login response missing user data. Check /api/auth/login.");
        setIsSubmitting(false);
        return;
      }

      localStorage.setItem("hydrosync_user", JSON.stringify(user));
      console.log("Saved hydrosync_user:", localStorage.getItem("hydrosync_user"));

      router.push("/dashboard");
    } catch (e: any) {
      setServerError(e?.message || "Network error");
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* subtle background glow to match HydroSync landing */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute left-1/2 top-[-140px] h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-gradient-to-b from-emerald-400/20 via-sky-400/15 to-transparent blur-3xl" />
        <div className="absolute bottom-[-220px] right-[-180px] h-[520px] w-[520px] rounded-full bg-gradient-to-tr from-indigo-400/15 via-sky-400/10 to-transparent blur-3xl" />
      </div>

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-4 py-10 md:min-h-screen md:grid-cols-2 md:items-center md:py-0">
        {/* LEFT: Brand panel (hidden on small screens) */}
        <div className="relative hidden overflow-hidden rounded-3xl border bg-card p-8 md:block">
          <div className="absolute -left-32 -top-32 h-72 w-72 rounded-full bg-gradient-to-br from-emerald-400/25 via-sky-400/20 to-indigo-400/15 blur-3xl" />
          <div className="absolute -bottom-32 -right-32 h-72 w-72 rounded-full bg-gradient-to-tr from-indigo-400/20 via-sky-400/15 to-emerald-400/10 blur-3xl" />

          <div className="relative flex h-full flex-col justify-between">
            <div>
              <Link href="/" className="inline-flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-foreground text-background">
                  <span className="text-lg font-black">H</span>
                </div>
                <div className="leading-tight">
                  <div className="text-base font-extrabold">HydroSync</div>
                  <div className="text-xs text-muted-foreground">hydroconnect.tech</div>
                </div>
              </Link>

              <h1 className="mt-10 text-3xl font-black tracking-tight">
                Turn industrial water into{" "}
                <span className="bg-gradient-to-r from-emerald-500 via-sky-500 to-indigo-500 bg-clip-text text-transparent">
                  verified reuse
                </span>
                .
              </h1>

              <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">
                Sign in to access your dashboard, upload report, and generate Water Passports
                with clear quality limits and routing recommendations.
              </p>

              <div className="mt-8 grid gap-3">
                <div className="rounded-2xl border bg-background/50 p-4">
                  <div className="text-sm font-semibold">Evidence → Passport</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    PDF/CSV/sensor snapshots standardized with traceable metrics.
                  </div>
                </div>

                <div className="rounded-2xl border bg-background/50 p-4">
                  <div className="text-sm font-semibold">Fit-for-use scoring</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    Transparent limits, risk scoring, and confidence.
                  </div>
                </div>

                <div className="rounded-2xl border bg-background/50 p-4">
                  <div className="text-sm font-semibold">Match & route</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    Nearby demand + constraints → ranked recommendations.
                  </div>
                </div>
              </div>
            </div>

            <div className="relative mt-10 text-xs text-muted-foreground">
              © {year} HydroSync • Built for water-positive operations
            </div>
          </div>
        </div>

        {/* RIGHT: Login card */}
        <div className="flex flex-col items-center justify-center">
          {/* Mobile brand header */}
          <div className="mb-6 flex w-full items-center justify-between md:hidden">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-foreground text-background">
                <span className="text-lg font-black">H</span>
              </div>
              <div className="leading-tight">
                <div className="text-sm font-extrabold">HydroSync</div>
                <div className="text-[11px] text-muted-foreground">hydroconnect.tech</div>
              </div>
            </Link>
            <Link
              href="/signup"
              className="text-sm font-semibold text-foreground underline underline-offset-4"
            >
              Sign up
            </Link>
          </div>

          <div className="w-full max-w-md rounded-3xl border bg-card p-6 shadow-sm md:p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-black tracking-tight">Sign in</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Welcome back. Use your HydroSync credentials.
              </p>
            </div>

            {serverError && (
              <div className="mb-4 rounded-2xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                {serverError}
              </div>
            )}

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
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    href="#"
                    className="text-xs font-semibold text-muted-foreground hover:text-foreground underline underline-offset-4"
                  >
                    Forgot password?
                  </Link>
                </div>

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

              <div className="flex items-center justify-between pt-1">
                <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border border-input bg-background"
                  />
                  Remember me
                </label>
                <span className="text-xs text-muted-foreground">
                  Secure access
                </span>
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Signing in..." : "Sign in"}
              </Button>

              <div className="pt-2 text-center text-sm text-muted-foreground">
                Don’t have an account?{" "}
                <Link
                  className="text-foreground underline underline-offset-4"
                  href="/signup"
                >
                  Create one
                </Link>
              </div>
            </form>
          </div>

          <div className="mt-6 text-center text-xs text-muted-foreground md:hidden">
            © {year} HydroSync
          </div>
        </div>
      </div>
    </div>
  );
}
