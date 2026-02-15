// export default function AuthLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return (
//     <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex items-center justify-center px-4">
//       {children}
//     </div>
//   );
// }


// "use client";

// import Link from "next/link";
// import { ThemeToggle } from "@/components/theme/theme-toggle";

// export default function AuthLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   const year = new Date().getFullYear();

//   return (
//     <div className="min-h-screen bg-background text-foreground">
//       {/* Background glow (same feel as landing/login) */}
//       <div className="pointer-events-none fixed inset-0 -z-10">
//         <div className="absolute left-1/2 top-[-140px] h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-gradient-to-b from-emerald-400/20 via-sky-400/15 to-transparent blur-3xl" />
//         <div className="absolute bottom-[-220px] right-[-180px] h-[520px] w-[520px] rounded-full bg-gradient-to-tr from-indigo-400/15 via-sky-400/10 to-transparent blur-3xl" />
//       </div>

//       {/* Top bar */}
//       <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-6">
//         <Link href="/" className="inline-flex items-center gap-2">
//           <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-foreground text-background">
//             <span className="text-lg font-black">H</span>
//           </div>
//           <div className="leading-tight">
//             <div className="text-sm font-extrabold">HydroSync</div>
//             <div className="text-[11px] text-muted-foreground">
//               hydroconnect.tech
//             </div>
//           </div>
//         </Link>

//         <div className="flex items-center gap-3">
//           <ThemeToggle />
//           <Link
//             href="/login"
//             className="text-sm font-semibold text-muted-foreground hover:text-foreground underline underline-offset-4"
//           >
//             Login
//           </Link>
//         </div>
//       </div>

//       {/* Content */}
//       <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-4 pb-12 md:min-h-[calc(100vh-120px)] md:grid-cols-2 md:items-center">
//         {/* Left Brand panel */}
//         <div className="relative hidden overflow-hidden rounded-3xl border bg-card p-8 md:block">
//           <div className="absolute -left-32 -top-32 h-72 w-72 rounded-full bg-gradient-to-br from-emerald-400/25 via-sky-400/20 to-indigo-400/15 blur-3xl" />
//           <div className="absolute -bottom-32 -right-32 h-72 w-72 rounded-full bg-gradient-to-tr from-indigo-400/20 via-sky-400/15 to-emerald-400/10 blur-3xl" />

//           <div className="relative flex h-full flex-col justify-between">
//             <div>
//               <div className="inline-flex items-center gap-2 rounded-full border bg-background/60 px-3 py-1 text-xs font-semibold text-muted-foreground">
//                 Join the industrial water exchange
//               </div>

//               <h1 className="mt-8 text-3xl font-black tracking-tight">
//                 Build{" "}
//                 <span className="bg-gradient-to-r from-emerald-500 via-sky-500 to-indigo-500 bg-clip-text text-transparent">
//                   verified reuse
//                 </span>{" "}
//                 networks.
//               </h1>

//               <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">
//                 Create your HydroSync account to upload evidence, generate Water
//                 Passports, and match verified greywater with real consumer demand.
//               </p>

//               <div className="mt-8 grid gap-3">
//                 <div className="rounded-2xl border bg-background/50 p-4">
//                   <div className="text-sm font-semibold">For Producers</div>
//                   <div className="mt-1 text-xs text-muted-foreground">
//                     Certify quality, reduce discharge risk, unlock value.
//                   </div>
//                 </div>

//                 <div className="rounded-2xl border bg-background/50 p-4">
//                   <div className="text-sm font-semibold">For Consumers</div>
//                   <div className="mt-1 text-xs text-muted-foreground">
//                     Source reclaimed water confidently, cut freshwater intake.
//                   </div>
//                 </div>

//                 <div className="rounded-2xl border bg-background/50 p-4">
//                   <div className="text-sm font-semibold">For the Environment</div>
//                   <div className="mt-1 text-xs text-muted-foreground">
//                     Less freshwater withdrawal, more circular water flow.
//                   </div>
//                 </div>
//               </div>
//             </div>

//             <div className="mt-10 flex items-center justify-between text-xs text-muted-foreground">
//               <span>© {year} HydroSync</span>
//               <span>Water-positive operations</span>
//             </div>
//           </div>
//         </div>

//         {/* Right: children (signup form will render here) */}
//         <div className="flex items-center justify-center">
//           <div className="w-full max-w-md">{children}</div>
//         </div>
//       </div>
//     </div>
//   );
// }



"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/theme/theme-toggle";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const year = new Date().getFullYear();
  const pathname = usePathname();

  // Show the "other" link (Login <-> Sign up) depending on which page you're on
  const isLogin = pathname?.includes("/login");
  const rightLinkHref = isLogin ? "/signup" : "/login";
  const rightLinkLabel = isLogin ? "Sign up" : "Login";

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute left-1/2 top-[-140px] h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-gradient-to-b from-emerald-400/20 via-sky-400/15 to-transparent blur-3xl" />
        <div className="absolute bottom-[-220px] right-[-180px] h-[520px] w-[520px] rounded-full bg-gradient-to-tr from-indigo-400/15 via-sky-400/10 to-transparent blur-3xl" />
      </div>

      {/* Top bar */}
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-6">
        <Link href="/" className="inline-flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-foreground text-background">
            <span className="text-lg font-black">H</span>
          </div>
          <div className="leading-tight">
            <div className="text-sm font-extrabold">HydroSync</div>
            <div className="text-[11px] text-muted-foreground">
              hydroconnect.tech
            </div>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link
            href={rightLinkHref}
            className="text-sm font-semibold text-muted-foreground hover:text-foreground underline underline-offset-4"
          >
            {rightLinkLabel}
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-4 pb-12 md:min-h-[calc(100vh-120px)] md:grid-cols-2 md:items-center">
        {/* Left Brand panel */}
        <div className="relative hidden overflow-hidden rounded-3xl border bg-card p-8 md:block">
          <div className="absolute -left-32 -top-32 h-72 w-72 rounded-full bg-gradient-to-br from-emerald-400/25 via-sky-400/20 to-indigo-400/15 blur-3xl" />
          <div className="absolute -bottom-32 -right-32 h-72 w-72 rounded-full bg-gradient-to-tr from-indigo-400/20 via-sky-400/15 to-emerald-400/10 blur-3xl" />

          <div className="relative flex h-full flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border bg-background/60 px-3 py-1 text-xs font-semibold text-muted-foreground">
                Join the industrial water exchange
              </div>

              <h1 className="mt-8 text-3xl font-black tracking-tight">
                Build{" "}
                <span className="bg-gradient-to-r from-emerald-500 via-sky-500 to-indigo-500 bg-clip-text text-transparent">
                  verified reuse
                </span>{" "}
                networks.
              </h1>

              <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">
                Create your HydroSync account to upload evidence, generate Water
                Passports, and match verified greywater with real consumer demand.
              </p>

              <div className="mt-8 grid gap-3">
                <div className="rounded-2xl border bg-background/50 p-4">
                  <div className="text-sm font-semibold">For Producers</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    Certify quality, reduce discharge risk, unlock value.
                  </div>
                </div>

                <div className="rounded-2xl border bg-background/50 p-4">
                  <div className="text-sm font-semibold">For Consumers</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    Source reclaimed water confidently, cut freshwater intake.
                  </div>
                </div>

                <div className="rounded-2xl border bg-background/50 p-4">
                  <div className="text-sm font-semibold">For the Environment</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    Less freshwater withdrawal, more circular water flow.
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-10 flex items-center justify-between text-xs text-muted-foreground">
              <span>© {year} HydroSync</span>
              <span>Water-positive operations</span>
            </div>
          </div>
        </div>

        {/* Right: children */}
        <div className="flex items-center justify-center">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </div>
    </div>
  );
}
