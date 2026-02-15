// import Image from "next/image";

// export default function Home() {
//   return (
//     <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
//       <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
//         <Image
//           className="dark:invert"
//           src="/next.svg"
//           alt="Next.js logo"
//           width={100}
//           height={20}
//           priority
//         />
//         <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
//           <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
//             To get started, edit the page.tsx file.
//           </h1>
//           <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
//             Looking for a starting point or more instructions? Head over to{" "}
//             <a
//               href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//               className="font-medium text-zinc-950 dark:text-zinc-50"
//             >
//               Templates
//             </a>{" "}
//             or the{" "}
//             <a
//               href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//               className="font-medium text-zinc-950 dark:text-zinc-50"
//             >
//               Learning
//             </a>{" "}
//             center.
//           </p>
//         </div>
//         <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
//           <a
//             className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc] md:w-[158px]"
//             href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//             target="_blank"
//             rel="noopener noreferrer"
//           >
//             <Image
//               className="dark:invert"
//               src="/vercel.svg"
//               alt="Vercel logomark"
//               width={16}
//               height={16}
//             />
//             Deploy Now
//           </a>
//           <a
//             className="flex h-12 w-full items-center justify-center rounded-full border border-solid border-black/[.08] px-5 transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a] md:w-[158px]"
//             href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//             target="_blank"
//             rel="noopener noreferrer"
//           >
//             Documentation
//           </a>
//         </div>
//       </main>
//     </div>
//   );
// }

// _____________________________ UPdated Front end
// "use client";

// import React, { useEffect, useMemo, useState } from "react";
// import { motion } from "framer-motion";
// import type { Variants } from "framer-motion";
// import {
//   ArrowRight,
//   Droplets,
//   Factory,
//   Building2,
//   ShieldCheck,
//   BadgeCheck,
//   Leaf,
//   MapPin,
//   LineChart,
//   FileText,
//   Sparkles,
//   Moon,
//   Sun,
//   CheckCircle2,
// } from "lucide-react";

// /**
//  * HydroSync Landing Page
//  * Domain: hydroconnect.tech
//  *
//  * Notes:
//  * - Assumes Tailwind is configured with `darkMode: "class"`.
//  * - Auth routes are placeholders: /login and /signup (change as needed).
//  */

// function cn(...classes: Array<string | false | null | undefined>) {
//   return classes.filter(Boolean).join(" ");
// }

// const fadeUp: Variants = {
//   hidden: { opacity: 0, y: 18 },
//   show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
// };

// const stagger: Variants = {
//   hidden: {},
//   show: { transition: { staggerChildren: 0.08 } },
// };

// function useTheme() {
//   const [theme, setTheme] = useState<"light" | "dark">("light");

//   useEffect(() => {
//     const stored = localStorage.getItem("hydrosync_theme") as
//       | "light"
//       | "dark"
//       | null;
//     const prefersDark =
//       window.matchMedia &&
//       window.matchMedia("(prefers-color-scheme: dark)").matches;

//     const initial = stored ?? (prefersDark ? "dark" : "light");
//     setTheme(initial);
//     document.documentElement.classList.toggle("dark", initial === "dark");
//   }, []);

//   const toggle = () => {
//     setTheme((prev) => {
//       const next = prev === "dark" ? "light" : "dark";
//       localStorage.setItem("hydrosync_theme", next);
//       document.documentElement.classList.toggle("dark", next === "dark");
//       return next;
//     });
//   };

//   return { theme, toggle };
// }

// function Button({
//   children,
//   href,
//   variant = "primary",
//   className,
// }: {
//   children: React.ReactNode;
//   href?: string;
//   variant?: "primary" | "secondary" | "ghost";
//   className?: string;
// }) {
//   const base =
//     "inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold transition active:scale-[0.98]";

//   const styles = {
//     primary:
//       "bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100",
//     secondary:
//       "bg-white text-zinc-900 ring-1 ring-zinc-200 hover:bg-zinc-50 dark:bg-zinc-900 dark:text-white dark:ring-zinc-800 dark:hover:bg-zinc-800",
//     ghost:
//       "text-zinc-900 hover:bg-zinc-100 dark:text-white dark:hover:bg-zinc-900",
//   }[variant];

//   const Comp: any = href ? "a" : "button";

//   return (
//     <Comp href={href} className={cn(base, styles, className)}>
//       {children}
//     </Comp>
//   );
// }

// function Pill({
//   icon: Icon,
//   text,
// }: {
//   icon: React.ElementType;
//   text: string;
// }) {
//   return (
//     <div className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-zinc-800 ring-1 ring-zinc-200 backdrop-blur dark:bg-zinc-950/60 dark:text-zinc-100 dark:ring-zinc-800">
//       <Icon className="h-4 w-4" />
//       <span>{text}</span>
//     </div>
//   );
// }


// function Card({
//   title,
//   desc,
//   icon: Icon,
//   bullets,
// }: {
//   title: string;
//   desc: string;
//   icon: React.ElementType;
//   bullets?: string[];
// }) {
//   return (
//     <div className="group relative overflow-hidden rounded-3xl bg-white p-6 ring-1 ring-zinc-200 transition hover:-translate-y-0.5 hover:shadow-xl dark:bg-zinc-950 dark:ring-zinc-800">
//       <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-gradient-to-br from-emerald-300/30 via-sky-300/20 to-indigo-300/20 blur-2xl dark:from-emerald-500/10 dark:via-sky-500/10 dark:to-indigo-500/10" />
//       <div className="relative">
//         <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900">
//           <Icon className="h-6 w-6" />
//         </div>
//         <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
//           {title}
//         </h3>
//         <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
//           {desc}
//         </p>

//         {bullets?.length ? (
//           <ul className="mt-4 space-y-2 text-sm text-zinc-700 dark:text-zinc-200">
//             {bullets.map((b, i) => (
//               <li key={i} className="flex gap-2">
//                 <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
//                 <span>{b}</span>
//               </li>
//             ))}
//           </ul>
//         ) : null}
//       </div>
//     </div>
//   );
// }

// function Stat({ value, label }: { value: string; label: string }) {
//   return (
//     <div className="rounded-3xl bg-white/70 p-5 ring-1 ring-zinc-200 backdrop-blur dark:bg-zinc-950/50 dark:ring-zinc-800">
//       <div className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
//         {value}
//       </div>
//       <div className="mt-1 text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-300">
//         {label}
//       </div>
//     </div>
//   );
// }

// export default function Page() {
//   const { theme, toggle } = useTheme();

//   const nav = useMemo(
//     () => [
//       { label: "How it works", href: "#how" },
//       { label: "For Producers", href: "#producers" },
//       { label: "For Consumers", href: "#consumers" },
//       { label: "Impact", href: "#impact" },
//       { label: "FAQ", href: "#faq" },
//     ],
//     []
//   );

//   return (
//     <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-black dark:text-white">
//       {/* Top glow */}
//       <div className="pointer-events-none fixed inset-x-0 top-0 -z-10 mx-auto h-[520px] w-full max-w-6xl bg-gradient-to-b from-emerald-200/40 via-sky-200/30 to-transparent blur-3xl dark:from-emerald-500/10 dark:via-sky-500/10" />

//       {/* Nav */}
//       <header className="sticky top-0 z-30 border-b border-zinc-200/70 bg-zinc-50/70 backdrop-blur dark:border-zinc-800/70 dark:bg-black/60">
//         <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
//           <a href="/" className="flex items-center gap-2">
//             <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900">
//               <Droplets className="h-5 w-5" />
//             </div>
//             <div className="leading-tight">
//               <div className="text-sm font-extrabold">HydroSync</div>
//               <div className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-300">
//                 hydroconnect.tech
//               </div>
//             </div>
//           </a>

//           <nav className="hidden items-center gap-6 md:flex">
//             {nav.map((n) => (
//               <a
//                 key={n.href}
//                 href={n.href}
//                 className="text-sm font-semibold text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white"
//               >
//                 {n.label}
//               </a>
//             ))}
//           </nav>

//           <div className="flex items-center gap-2">
//             <button
//               onClick={toggle}
//               className="inline-flex h-10 w-10 items-center justify-center rounded-2xl ring-1 ring-zinc-200 hover:bg-zinc-100 dark:ring-zinc-800 dark:hover:bg-zinc-900"
//               aria-label="Toggle theme"
//               title="Toggle theme"
//             >
//               {theme === "dark" ? (
//                 <Sun className="h-5 w-5" />
//               ) : (
//                 <Moon className="h-5 w-5" />
//               )}
//             </button>

//             <div className="hidden sm:flex sm:items-center sm:gap-2">
//               <Button href="/login" variant="ghost">
//                 Login
//               </Button>
//               <Button href="/signup" variant="primary">
//                 Sign up <ArrowRight className="h-4 w-4" />
//               </Button>
//             </div>
//           </div>
//         </div>
//       </header>

//       {/* Hero */}
//       <section className="mx-auto max-w-6xl px-4 pb-12 pt-14 md:pb-16 md:pt-20">
//         <motion.div
//           variants={stagger}
//           initial="hidden"
//           animate="show"
//           className="grid gap-10 md:grid-cols-[1.2fr_0.8fr] md:items-center"
//         >
//           <motion.div variants={fadeUp}>
//             <div className="flex flex-wrap gap-2">
//               <Pill icon={Leaf} text="Water-positive infrastructure" />
//               <Pill icon={ShieldCheck} text="Quality + compliance checks" />
//               <Pill icon={Sparkles} text="AI-assisted matching & insights" />
//             </div>

//             <h1 className="mt-6 text-4xl font-black tracking-tight md:text-6xl">
//               Turn industrial greywater into{" "}
//               <span className="bg-gradient-to-r from-emerald-600 via-sky-600 to-indigo-600 bg-clip-text text-transparent">
//                 verified reuse
//               </span>{" "}
//               — fast.
//             </h1>

//             <p className="mt-5 max-w-xl text-base leading-7 text-zinc-700 dark:text-zinc-300">
//               HydroSync is the industrial water exchange that helps producers
//               certify wastewater quality and helps consumers source fit-for-use
//               reclaimed water—reducing freshwater demand, discharge risk, and
//               overall environmental impact.
//             </p>

//             <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
//               <Button href="/signup" variant="primary" className="w-full sm:w-auto">
//                 Get started <ArrowRight className="h-4 w-4" />
//               </Button>
//               <Button href="#how" variant="secondary" className="w-full sm:w-auto">
//                 See how it works <LineChart className="h-4 w-4" />
//               </Button>
//             </div>

//             <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-3">
//               <Stat value="24–72h" label="Decision readiness" />
//               <Stat value="↓ Freshwater" label="Demand reduction" />
//               <Stat value="↑ Reuse" label="Circular water flow" />
//             </div>
//           </motion.div>

//           {/* Hero Visual */}
//           <motion.div variants={fadeUp} className="relative">
//             <div className="relative overflow-hidden rounded-[32px] bg-white p-6 ring-1 ring-zinc-200 dark:bg-zinc-950 dark:ring-zinc-800">
//               <div className="absolute -left-24 -top-24 h-64 w-64 rounded-full bg-gradient-to-br from-emerald-300/40 via-sky-300/30 to-indigo-300/20 blur-3xl dark:from-emerald-500/10 dark:via-sky-500/10 dark:to-indigo-500/10" />
//               <div className="relative">
//                 <div className="flex items-center justify-between">
//                   <div className="text-sm font-extrabold">Water Passport</div>
//                   <div className="rounded-full bg-emerald-600/10 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300">
//                     Verified
//                   </div>
//                 </div>

//                 <div className="mt-5 grid gap-3">
//                   <div className="rounded-2xl bg-zinc-50 p-4 ring-1 ring-zinc-200 dark:bg-black/40 dark:ring-zinc-800">
//                     <div className="flex items-center gap-3">
//                       <FileText className="h-5 w-5 text-zinc-700 dark:text-zinc-200" />
//                       <div>
//                         <div className="text-sm font-bold">Evidence In</div>
//                         <div className="text-xs text-zinc-600 dark:text-zinc-300">
//                           PDF / CSV / sensor snapshot
//                         </div>
//                       </div>
//                     </div>
//                   </div>

//                   <div className="rounded-2xl bg-zinc-50 p-4 ring-1 ring-zinc-200 dark:bg-black/40 dark:ring-zinc-800">
//                     <div className="flex items-center gap-3">
//                       <BadgeCheck className="h-5 w-5 text-zinc-700 dark:text-zinc-200" />
//                       <div>
//                         <div className="text-sm font-bold">Quality Check</div>
//                         <div className="text-xs text-zinc-600 dark:text-zinc-300">
//                           Limits, fit-for-use, risk scoring
//                         </div>
//                       </div>
//                     </div>
//                   </div>

//                   <div className="rounded-2xl bg-zinc-50 p-4 ring-1 ring-zinc-200 dark:bg-black/40 dark:ring-zinc-800">
//                     <div className="flex items-center gap-3">
//                       <MapPin className="h-5 w-5 text-zinc-700 dark:text-zinc-200" />
//                       <div>
//                         <div className="text-sm font-bold">Match & Route</div>
//                         <div className="text-xs text-zinc-600 dark:text-zinc-300">
//                           Nearby demand + constraints
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="mt-6 rounded-2xl bg-gradient-to-r from-emerald-600 via-sky-600 to-indigo-600 p-[1px]">
//                   <div className="rounded-2xl bg-white p-4 dark:bg-zinc-950">
//                     <div className="text-xs font-bold text-zinc-600 dark:text-zinc-300">
//                       Outcome
//                     </div>
//                     <div className="mt-1 text-sm font-extrabold">
//                       Recommended: Cooling Tower Reuse
//                     </div>
//                     <div className="mt-2 text-xs text-zinc-600 dark:text-zinc-300">
//                       Transparent reasons, confidence, and limits included.
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             <div className="mt-4 grid grid-cols-2 gap-3">
//               <div className="rounded-3xl bg-white p-4 ring-1 ring-zinc-200 dark:bg-zinc-950 dark:ring-zinc-800">
//                 <div className="flex items-center gap-3">
//                   <Factory className="h-5 w-5" />
//                   <div>
//                     <div className="text-sm font-extrabold">Producer</div>
//                     <div className="text-xs text-zinc-600 dark:text-zinc-300">
//                       Monetize safe discharge
//                     </div>
//                   </div>
//                 </div>
//               </div>
//               <div className="rounded-3xl bg-white p-4 ring-1 ring-zinc-200 dark:bg-zinc-950 dark:ring-zinc-800">
//                 <div className="flex items-center gap-3">
//                   <Building2 className="h-5 w-5" />
//                   <div>
//                     <div className="text-sm font-extrabold">Consumer</div>
//                     <div className="text-xs text-zinc-600 dark:text-zinc-300">
//                       Reduce freshwater intake
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </motion.div>
//         </motion.div>
//       </section>

//       {/* How it works */}
//       <section id="how" className="mx-auto max-w-6xl px-4 py-12 md:py-16">
//         <motion.div
//           variants={stagger}
//           initial="hidden"
//           whileInView="show"
//           viewport={{ once: true, amount: 0.2 }}
//         >
//           <motion.div variants={fadeUp} className="max-w-2xl">
//             <h2 className="text-3xl font-black tracking-tight md:text-4xl">
//               How HydroSync works
//             </h2>
//             <p className="mt-3 text-sm leading-6 text-zinc-700 dark:text-zinc-300">
//               A simple flow that turns evidence into an auditable decision—so
//               both sides can act quickly and safely.
//             </p>
//           </motion.div>

//           <motion.div
//             variants={stagger}
//             className="mt-8 grid gap-4 md:grid-cols-3"
//           >
//             <motion.div variants={fadeUp}>
//               <Card
//                 icon={FileText}
//                 title="1) Upload & Extract"
//                 desc="Producers upload reports (PDF/CSV). HydroSync standardizes everything into a Water Passport with units, confidence, and traceable evidence."
//                 bullets={[
//                   "Structured metrics (pH, TDS, TSS, COD, etc.)",
//                   "Evidence snippets for auditability",
//                   "Unit normalization + validation",
//                 ]}
//               />
//             </motion.div>
//             <motion.div variants={fadeUp}>
//               <Card
//                 icon={ShieldCheck}
//                 title="2) Verify & Score"
//                 desc="We run fit-for-use checks and generate a clear quality/risk score so water can be routed safely to the right use case."
//                 bullets={[
//                   "Rule-based compliance thresholds",
//                   "Risk scoring with explainability",
//                   "Confidence-aware decisions",
//                 ]}
//               />
//             </motion.div>
//             <motion.div variants={fadeUp}>
//               <Card
//                 icon={MapPin}
//                 title="3) Match & Route"
//                 desc="Consumers discover verified water nearby based on demand profiles, constraints, and logistics feasibility."
//                 bullets={[
//                   "Geospatial matching",
//                   "Constraint filters (quality + volume)",
//                   "Ranked recommendations",
//                 ]}
//               />
//             </motion.div>
//           </motion.div>
//         </motion.div>
//       </section>

//       {/* Producer + Consumer */}
//       <section className="mx-auto max-w-6xl px-4 py-12 md:py-16">
//         <div className="grid gap-6 md:grid-cols-2">
//           <div
//             id="producers"
//             className="relative overflow-hidden rounded-[32px] bg-white p-7 ring-1 ring-zinc-200 dark:bg-zinc-950 dark:ring-zinc-800"
//           >
//             <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-gradient-to-br from-emerald-300/35 via-sky-300/25 to-indigo-300/20 blur-3xl dark:from-emerald-500/10 dark:via-sky-500/10 dark:to-indigo-500/10" />
//             <div className="relative">
//               <div className="inline-flex items-center gap-2 rounded-full bg-emerald-600/10 px-3 py-1 text-xs font-extrabold text-emerald-700 dark:text-emerald-300">
//                 <Factory className="h-4 w-4" /> For Producers
//               </div>
//               <h3 className="mt-4 text-2xl font-black">Prove quality. Reduce risk. Unlock value.</h3>
//               <p className="mt-2 text-sm leading-6 text-zinc-700 dark:text-zinc-300">
//                 Stop treating greywater as a liability. HydroSync helps you turn
//                 wastewater documentation into a verified Water Passport and match
//                 it to nearby buyers with clear reuse constraints.
//               </p>

//               <ul className="mt-5 space-y-2 text-sm text-zinc-700 dark:text-zinc-200">
//                 {[
//                   "Upload lab reports / sensor snapshots and standardize instantly",
//                   "Get fit-for-use labels and actionable limits",
//                   "Show evidence-backed transparency to consumers and regulators",
//                 ].map((t) => (
//                   <li key={t} className="flex gap-2">
//                     <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
//                     <span>{t}</span>
//                   </li>
//                 ))}
//               </ul>

//               <div className="mt-6 flex flex-col gap-3 sm:flex-row">
//                 <Button href="/signup" variant="primary">
//                   Create producer account <ArrowRight className="h-4 w-4" />
//                 </Button>
//                 <Button href="#faq" variant="secondary">
//                   See FAQs
//                 </Button>
//               </div>
//             </div>
//           </div>

//           <div
//             id="consumers"
//             className="relative overflow-hidden rounded-[32px] bg-white p-7 ring-1 ring-zinc-200 dark:bg-zinc-950 dark:ring-zinc-800"
//           >
//             <div className="absolute -left-24 -bottom-24 h-72 w-72 rounded-full bg-gradient-to-br from-sky-300/35 via-indigo-300/25 to-emerald-300/20 blur-3xl dark:from-sky-500/10 dark:via-indigo-500/10 dark:to-emerald-500/10" />
//             <div className="relative">
//               <div className="inline-flex items-center gap-2 rounded-full bg-sky-600/10 px-3 py-1 text-xs font-extrabold text-sky-700 dark:text-sky-300">
//                 <Building2 className="h-4 w-4" /> For Consumers
//               </div>
//               <h3 className="mt-4 text-2xl font-black">Source reclaimed water with confidence.</h3>
//               <p className="mt-2 text-sm leading-6 text-zinc-700 dark:text-zinc-300">
//                 Find nearby verified water streams that meet your demand profile.
//                 HydroSync helps you evaluate quality, volume, and constraints—so
//                 you can cut freshwater intake without compromising operations.
//               </p>

//               <ul className="mt-5 space-y-2 text-sm text-zinc-700 dark:text-zinc-200">
//                 {[
//                   "Search by location, volume, and fit-for-use requirements",
//                   "Compare options with risk scores and clear evidence",
//                   "Track reuse impact and water savings over time",
//                 ].map((t) => (
//                   <li key={t} className="flex gap-2">
//                     <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-sky-600 dark:text-sky-400" />
//                     <span>{t}</span>
//                   </li>
//                 ))}
//               </ul>

//               <div className="mt-6 flex flex-col gap-3 sm:flex-row">
//                 <Button href="/signup" variant="primary">
//                   Create consumer account <ArrowRight className="h-4 w-4" />
//                 </Button>
//                 <Button href="#impact" variant="secondary">
//                   View impact
//                 </Button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Impact */}
//       <section id="impact" className="mx-auto max-w-6xl px-4 py-12 md:py-16">
//         <div className="rounded-[40px] bg-gradient-to-r from-emerald-600 via-sky-600 to-indigo-600 p-[1px]">
//           <div className="rounded-[40px] bg-white px-6 py-10 dark:bg-zinc-950 md:px-10 md:py-12">
//             <div className="grid gap-10 md:grid-cols-[1fr_1fr] md:items-center">
//               <div>
//                 <div className="inline-flex items-center gap-2 rounded-full bg-zinc-900 px-3 py-1 text-xs font-extrabold text-white dark:bg-white dark:text-zinc-900">
//                   <Leaf className="h-4 w-4" /> Environmental Impact
//                 </div>
//                 <h3 className="mt-4 text-3xl font-black tracking-tight md:text-4xl">
//                   Build a circular water economy.
//                 </h3>
//                 <p className="mt-3 text-sm leading-6 text-zinc-700 dark:text-zinc-300">
//                   HydroSync reduces freshwater withdrawals and prevents usable
//                   industrial water from being wasted. Every verified reuse route
//                   is a measurable sustainability win.
//                 </p>

//                 <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
//                   <Stat value="Lower" label="Freshwater Intake" />
//                   <Stat value="Higher" label="Water Reuse Rate" />
//                   <Stat value="Fewer" label="Risky Discharges" />
//                 </div>

//                 <div className="mt-6 text-sm text-zinc-700 dark:text-zinc-300">
//                   <span className="font-extrabold text-zinc-900 dark:text-white">
//                     Transparency matters.
//                   </span>{" "}
//                   HydroSync keeps evidence and constraints visible—so decisions are
//                   explainable, auditable, and trusted.
//                 </div>
//               </div>

//               <div className="grid gap-4">
//                 <Card
//                   icon={BadgeCheck}
//                   title="Evidence-backed decisions"
//                   desc="Every Water Passport keeps a traceable link to source evidence so teams can justify routing choices."
//                 />
//                 <Card
//                   icon={LineChart}
//                   title="Measure what you save"
//                   desc="Track water reuse, avoided freshwater demand, and operational feasibility across time."
//                 />
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* FAQ */}
//       <section id="faq" className="mx-auto max-w-6xl px-4 py-12 md:py-16">
//         <div className="max-w-2xl">
//           <h2 className="text-3xl font-black tracking-tight md:text-4xl">FAQ</h2>
//           <p className="mt-3 text-sm leading-6 text-zinc-700 dark:text-zinc-300">
//             Clear answers for producers and consumers.
//           </p>
//         </div>

//         <div className="mt-8 grid gap-4 md:grid-cols-2">
//           {[
//             {
//               q: "What is HydroSync?",
//               a: "HydroSync is an industrial water exchange platform that verifies grey/wastewater quality and matches it to nearby consumer demand profiles for safe reuse.",
//             },
//             {
//               q: "How do you verify water quality?",
//               a: "We standardize uploaded evidence into a Water Passport, validate metrics, apply fit-for-use thresholds, and produce a transparent score with clear constraints.",
//             },
//             {
//               q: "Who is this for?",
//               a: "Producers who generate grey/wastewater and want safe reuse pathways, and consumers (cooling towers, process plants, facilities) seeking reclaimed water to reduce freshwater intake.",
//             },
//             {
//               q: "Do you support both light and dark mode?",
//               a: "Yes—this landing page includes a fast theme toggle and respects OS-level preferences by default.",
//             },
//           ].map((item) => (
//             <div
//               key={item.q}
//               className="rounded-3xl bg-white p-6 ring-1 ring-zinc-200 dark:bg-zinc-950 dark:ring-zinc-800"
//             >
//               <div className="text-sm font-extrabold">{item.q}</div>
//               <div className="mt-2 text-sm leading-6 text-zinc-700 dark:text-zinc-300">
//                 {item.a}
//               </div>
//             </div>
//           ))}
//         </div>
//       </section>

//       {/* CTA */}
//       <section className="mx-auto max-w-6xl px-4 pb-16 pt-4">
//         <div className="rounded-[40px] bg-zinc-900 px-6 py-10 text-white dark:bg-white dark:text-zinc-900 md:px-10 md:py-12">
//           <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
//             <div>
//               <h3 className="text-3xl font-black tracking-tight md:text-4xl">
//                 Start building water-positive operations.
//               </h3>
//               <p className="mt-3 max-w-2xl text-sm leading-6 text-white/80 dark:text-zinc-700">
//                 Create an account to upload evidence, generate Water Passports,
//                 and discover safe reuse matches—faster than traditional workflows.
//               </p>
//             </div>
//             <div className="flex flex-col gap-3 sm:flex-row md:justify-end">
//               <Button href="/login" variant="secondary" className="dark:ring-zinc-200">
//                 Login
//               </Button>
//               <Button href="/signup" variant="primary">
//                 Sign up <ArrowRight className="h-4 w-4" />
//               </Button>
//             </div>
//           </div>
//         </div>

//         <footer className="mt-8 flex flex-col items-center justify-between gap-3 text-xs text-zinc-600 dark:text-zinc-300 md:flex-row">
//           <div className="flex items-center gap-2">
//             <Droplets className="h-4 w-4" />
//             <span className="font-semibold">HydroSync</span>
//             <span className="opacity-70">© {new Date().getFullYear()}</span>
//           </div>
//           <div className="flex items-center gap-4">
//             <a className="hover:underline" href="#how">
//               How it works
//             </a>
//             <a className="hover:underline" href="#impact">
//               Impact
//             </a>
//             <a className="hover:underline" href="/login">
//               Login
//             </a>
//             <a className="hover:underline" href="/signup">
//               Sign up
//             </a>
//           </div>
//         </footer>
//       </section>
//     </div>
//   );
// }
























"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import {
  ArrowRight,
  Droplets,
  Factory,
  Building2,
  ShieldCheck,
  Leaf,
  MapPin,
  LineChart,
  FileText,
  Sparkles,
  Moon,
  Sun,
  CheckCircle2,
  BadgeCheck,
} from "lucide-react";

/**
 * HydroSync Landing Page
 * Domain: hydroconnect.tech
 *
 * Notes:
 * - Assumes Tailwind is configured with `darkMode: "class"`.
 * - Auth routes are placeholders: /login and /signup (change as needed).
 */

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

function useTheme() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const stored = localStorage.getItem("hydrosync_theme") as
      | "light"
      | "dark"
      | null;
    const prefersDark =
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;

    const initial = stored ?? (prefersDark ? "dark" : "light");
    setTheme(initial);
    document.documentElement.classList.toggle("dark", initial === "dark");
  }, []);

  const toggle = () => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      localStorage.setItem("hydrosync_theme", next);
      document.documentElement.classList.toggle("dark", next === "dark");
      return next;
    });
  };

  return { theme, toggle };
}

function Button({
  children,
  href,
  variant = "primary",
  className,
}: {
  children: React.ReactNode;
  href?: string;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold transition active:scale-[0.98]";

  const styles = {
    primary:
      "bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100",
    secondary:
      "bg-white text-zinc-900 ring-1 ring-zinc-200 hover:bg-zinc-50 dark:bg-zinc-900 dark:text-white dark:ring-zinc-800 dark:hover:bg-zinc-800",
    ghost:
      "text-zinc-900 hover:bg-zinc-100 dark:text-white dark:hover:bg-zinc-900",
  }[variant];

  const Comp: any = href ? "a" : "button";

  return (
    <Comp href={href} className={cn(base, styles, className)}>
      {children}
    </Comp>
  );
}

function Pill({
  icon: Icon,
  text,
}: {
  icon: React.ElementType;
  text: string;
}) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-zinc-800 ring-1 ring-zinc-200 backdrop-blur dark:bg-zinc-950/60 dark:text-zinc-100 dark:ring-zinc-800">
      <Icon className="h-4 w-4" />
      <span>{text}</span>
    </div>
  );
}

function Card({
  title,
  desc,
  icon: Icon,
  bullets,
}: {
  title: string;
  desc: string;
  icon: React.ElementType;
  bullets?: string[];
}) {
  return (
    <div className="group relative overflow-hidden rounded-3xl bg-white p-6 ring-1 ring-zinc-200 transition hover:-translate-y-0.5 hover:shadow-xl dark:bg-zinc-950 dark:ring-zinc-800">
      <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-gradient-to-br from-emerald-300/30 via-sky-300/20 to-indigo-300/20 blur-2xl dark:from-emerald-500/10 dark:via-sky-500/10 dark:to-indigo-500/10" />
      <div className="relative">
        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900">
          <Icon className="h-6 w-6" />
        </div>
        <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
          {title}
        </h3>
        <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
          {desc}
        </p>

        {bullets?.length ? (
          <ul className="mt-4 space-y-2 text-sm text-zinc-700 dark:text-zinc-200">
            {bullets.map((b, i) => (
              <li key={i} className="flex gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-3xl bg-white/70 p-5 ring-1 ring-zinc-200 backdrop-blur dark:bg-zinc-950/50 dark:ring-zinc-800">
      <div className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
        {value}
      </div>
      <div className="mt-1 text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-300">
        {label}
      </div>
    </div>
  );
}

export default function Page() {
  const { theme, toggle } = useTheme();

  const nav = useMemo(
    () => [
      { label: "How it works", href: "#how" },
      { label: "For Producers", href: "#producers" },
      { label: "For Consumers", href: "#consumers" },
      { label: "Impact", href: "#impact" },
      { label: "FAQ", href: "#faq" },
    ],
    []
  );

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-black dark:text-white">
      {/* Top glow */}
      <div className="pointer-events-none fixed inset-x-0 top-0 -z-10 mx-auto h-[520px] w-full max-w-6xl bg-gradient-to-b from-emerald-200/40 via-sky-200/30 to-transparent blur-3xl dark:from-emerald-500/10 dark:via-sky-500/10" />

      {/* Nav */}
      <header className="sticky top-0 z-30 border-b border-zinc-200/70 bg-zinc-50/70 backdrop-blur dark:border-zinc-800/70 dark:bg-black/60">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <a href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900">
              <Droplets className="h-5 w-5" />
            </div>
            <div className="leading-tight">
              <div className="text-sm font-extrabold">HydroSync</div>
              <div className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-300">
                hydroconnect.tech
              </div>
            </div>
          </a>

          <nav className="hidden items-center gap-6 md:flex">
            {nav.map((n) => (
              <a
                key={n.href}
                href={n.href}
                className="text-sm font-semibold text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white"
              >
                {n.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={toggle}
              className="inline-flex h-10 w-10 items-center justify-center rounded-2xl ring-1 ring-zinc-200 hover:bg-zinc-100 dark:ring-zinc-800 dark:hover:bg-zinc-900"
              aria-label="Toggle theme"
              title="Toggle theme"
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>

            <div className="hidden sm:flex sm:items-center sm:gap-2">
              <Button href="/login" variant="ghost">
                Login
              </Button>
              <Button href="/signup" variant="primary">
                Sign up <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* ✅ HERO (updated: centered, 2-line title, Water Passport removed) */}
      <section className="mx-auto max-w-6xl px-4 pb-12 pt-14 md:pb-16 md:pt-20">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="mx-auto max-w-3xl text-center"
        >
          <motion.div variants={fadeUp} className="flex flex-col items-center">
            <div className="flex flex-wrap justify-center gap-2">
              <Pill icon={Leaf} text="Water-positive infrastructure" />
              <Pill icon={ShieldCheck} text="Quality + compliance checks" />
              <Pill icon={Sparkles} text="AI-assisted matching & insights" />
            </div>

            <h1 className="mt-6 text-balance text-4xl font-black tracking-tight md:text-6xl">
              Turn industrial greywater into{" "}
              <span className="bg-gradient-to-r from-emerald-600 via-sky-600 to-indigo-600 bg-clip-text text-transparent">
                verified reuse
              </span>
              {/* <br className="hidden md:block" />
              <span className="md:ml-2">— fast.</span> */}
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-700 dark:text-zinc-300">
              HydroSync is the industrial water exchange that helps producers
              certify wastewater quality and helps consumers source fit-for-use
              reclaimed water—reducing freshwater demand, discharge risk, and
              overall environmental impact.
            </p>

            <div className="mt-7 flex w-full flex-col justify-center gap-3 sm:flex-row sm:items-center">
              <Button
                href="/signup"
                variant="primary"
                className="w-full sm:w-auto"
              >
                Get started <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                href="#how"
                variant="secondary"
                className="w-full sm:w-auto"
              >
                See how it works <LineChart className="h-4 w-4" />
              </Button>
            </div>

            <div className="mt-7 grid w-full grid-cols-1 gap-3 sm:grid-cols-3">
              <Stat value="24–72h" label="Decision readiness" />
              <Stat value="↓ Freshwater" label="Demand reduction" />
              <Stat value="↑ Reuse" label="Circular water flow" />
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* How it works */}
      <section id="how" className="mx-auto max-w-6xl px-4 py-12 md:py-16">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
        >
          <motion.div variants={fadeUp} className="max-w-2xl">
            <h2 className="text-3xl font-black tracking-tight md:text-4xl">
              How HydroSync works
            </h2>
            <p className="mt-3 text-sm leading-6 text-zinc-700 dark:text-zinc-300">
              A simple flow that turns evidence into an auditable decision—so
              both sides can act quickly and safely.
            </p>
          </motion.div>

          <motion.div
            variants={stagger}
            className="mt-8 grid gap-4 md:grid-cols-3"
          >
            <motion.div variants={fadeUp}>
              <Card
                icon={FileText}
                title="1) Upload & Extract"
                desc="Producers upload reports (PDF/CSV). HydroSync standardizes everything into a Water Passport with units, confidence, and traceable evidence."
                bullets={[
                  "Structured metrics (pH, TDS, TSS, COD, etc.)",
                  "Evidence snippets for auditability",
                  "Unit normalization + validation",
                ]}
              />
            </motion.div>
            <motion.div variants={fadeUp}>
              <Card
                icon={ShieldCheck}
                title="2) Verify & Score"
                desc="We run fit-for-use checks and generate a clear quality/risk score so water can be routed safely to the right use case."
                bullets={[
                  "Rule-based compliance thresholds",
                  "Risk scoring with explainability",
                  "Confidence-aware decisions",
                ]}
              />
            </motion.div>
            <motion.div variants={fadeUp}>
              <Card
                icon={MapPin}
                title="3) Match & Route"
                desc="Consumers discover verified water nearby based on demand profiles, constraints, and logistics feasibility."
                bullets={[
                  "Geospatial matching",
                  "Constraint filters (quality + volume)",
                  "Ranked recommendations",
                ]}
              />
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* Producer + Consumer */}
      <section className="mx-auto max-w-6xl px-4 py-12 md:py-16">
        <div className="grid gap-6 md:grid-cols-2">
          <div
            id="producers"
            className="relative overflow-hidden rounded-[32px] bg-white p-7 ring-1 ring-zinc-200 dark:bg-zinc-950 dark:ring-zinc-800"
          >
            <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-gradient-to-br from-emerald-300/35 via-sky-300/25 to-indigo-300/20 blur-3xl dark:from-emerald-500/10 dark:via-sky-500/10 dark:to-indigo-500/10" />
            <div className="relative">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-600/10 px-3 py-1 text-xs font-extrabold text-emerald-700 dark:text-emerald-300">
                <Factory className="h-4 w-4" /> For Producers
              </div>
              <h3 className="mt-4 text-2xl font-black">
                Prove quality. Reduce risk. Unlock value.
              </h3>
              <p className="mt-2 text-sm leading-6 text-zinc-700 dark:text-zinc-300">
                Stop treating greywater as a liability. HydroSync helps you turn
                wastewater documentation into a verified Water Passport and match
                it to nearby buyers with clear reuse constraints.
              </p>

              <ul className="mt-5 space-y-2 text-sm text-zinc-700 dark:text-zinc-200">
                {[
                  "Upload lab reports / sensor snapshots and standardize instantly",
                  "Get fit-for-use labels and actionable limits",
                  "Show evidence-backed transparency to consumers and regulators",
                ].map((t) => (
                  <li key={t} className="flex gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Button href="/signup" variant="primary">
                  Create producer account <ArrowRight className="h-4 w-4" />
                </Button>
                <Button href="#faq" variant="secondary">
                  See FAQs
                </Button>
              </div>
            </div>
          </div>

          <div
            id="consumers"
            className="relative overflow-hidden rounded-[32px] bg-white p-7 ring-1 ring-zinc-200 dark:bg-zinc-950 dark:ring-zinc-800"
          >
            <div className="absolute -left-24 -bottom-24 h-72 w-72 rounded-full bg-gradient-to-br from-sky-300/35 via-indigo-300/25 to-emerald-300/20 blur-3xl dark:from-sky-500/10 dark:via-indigo-500/10 dark:to-emerald-500/10" />
            <div className="relative">
              <div className="inline-flex items-center gap-2 rounded-full bg-sky-600/10 px-3 py-1 text-xs font-extrabold text-sky-700 dark:text-sky-300">
                <Building2 className="h-4 w-4" /> For Consumers
              </div>
              <h3 className="mt-4 text-2xl font-black">
                Source reclaimed water with confidence.
              </h3>
              <p className="mt-2 text-sm leading-6 text-zinc-700 dark:text-zinc-300">
                Find nearby verified water streams that meet your demand profile.
                HydroSync helps you evaluate quality, volume, and constraints—so
                you can cut freshwater intake without compromising operations.
              </p>

              <ul className="mt-5 space-y-2 text-sm text-zinc-700 dark:text-zinc-200">
                {[
                  "Search by location, volume, and fit-for-use requirements",
                  "Compare options with risk scores and clear evidence",
                  "Track reuse impact and water savings over time",
                ].map((t) => (
                  <li key={t} className="flex gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-sky-600 dark:text-sky-400" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Button href="/signup" variant="primary">
                  Create consumer account <ArrowRight className="h-4 w-4" />
                </Button>
                <Button href="#impact" variant="secondary">
                  View impact
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Impact */}
      <section id="impact" className="mx-auto max-w-6xl px-4 py-12 md:py-16">
        <div className="rounded-[40px] bg-gradient-to-r from-emerald-600 via-sky-600 to-indigo-600 p-[1px]">
          <div className="rounded-[40px] bg-white px-6 py-10 dark:bg-zinc-950 md:px-10 md:py-12">
            <div className="grid gap-10 md:grid-cols-[1fr_1fr] md:items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-zinc-900 px-3 py-1 text-xs font-extrabold text-white dark:bg-white dark:text-zinc-900">
                  <Leaf className="h-4 w-4" /> Environmental Impact
                </div>
                <h3 className="mt-4 text-3xl font-black tracking-tight md:text-4xl">
                  Build a circular water economy.
                </h3>
                <p className="mt-3 text-sm leading-6 text-zinc-700 dark:text-zinc-300">
                  HydroSync reduces freshwater withdrawals and prevents usable
                  industrial water from being wasted. Every verified reuse route
                  is a measurable sustainability win.
                </p>

                <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <Stat value="Lower" label="Freshwater Intake" />
                  <Stat value="Higher" label="Water Reuse Rate" />
                  <Stat value="Fewer" label="Risky Discharges" />
                </div>

                <div className="mt-6 text-sm text-zinc-700 dark:text-zinc-300">
                  <span className="font-extrabold text-zinc-900 dark:text-white">
                    Transparency matters.
                  </span>{" "}
                  HydroSync keeps evidence and constraints visible—so decisions are
                  explainable, auditable, and trusted.
                </div>
              </div>

              <div className="grid gap-4">
                <Card
                  icon={BadgeCheck}
                  title="Evidence-backed decisions"
                  desc="Every Water Passport keeps a traceable link to source evidence so teams can justify routing choices."
                />
                <Card
                  icon={LineChart}
                  title="Measure what you save"
                  desc="Track water reuse, avoided freshwater demand, and operational feasibility across time."
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-6xl px-4 py-12 md:py-16">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-black tracking-tight md:text-4xl">FAQ</h2>
          <p className="mt-3 text-sm leading-6 text-zinc-700 dark:text-zinc-300">
            Clear answers for producers and consumers.
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {[
            {
              q: "What is HydroSync?",
              a: "HydroSync is an industrial water exchange platform that verifies grey/wastewater quality and matches it to nearby consumer demand profiles for safe reuse.",
            },
            {
              q: "How do you verify water quality?",
              a: "We standardize uploaded evidence into a Water Passport, validate metrics, apply fit-for-use thresholds, and produce a transparent score with clear constraints.",
            },
            {
              q: "Who is this for?",
              a: "Producers who generate grey/wastewater and want safe reuse pathways, and consumers (cooling towers, process plants, facilities) seeking reclaimed water to reduce freshwater intake.",
            },
            {
              q: "Do you support both light and dark mode?",
              a: "Yes—this landing page includes a fast theme toggle and respects OS-level preferences by default.",
            },
          ].map((item) => (
            <div
              key={item.q}
              className="rounded-3xl bg-white p-6 ring-1 ring-zinc-200 dark:bg-zinc-950 dark:ring-zinc-800"
            >
              <div className="text-sm font-extrabold">{item.q}</div>
              <div className="mt-2 text-sm leading-6 text-zinc-700 dark:text-zinc-300">
                {item.a}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 pb-16 pt-4">
        <div className="rounded-[40px] bg-zinc-900 px-6 py-10 text-white dark:bg-white dark:text-zinc-900 md:px-10 md:py-12">
          <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <h3 className="text-3xl font-black tracking-tight md:text-4xl">
                Start building water-positive operations.
              </h3>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/80 dark:text-zinc-700">
                Create an account to upload evidence, generate Water Passports,
                and discover safe reuse matches—faster than traditional workflows.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row md:justify-end">
              <Button href="/login" variant="secondary" className="dark:ring-zinc-200">
                Login
              </Button>
              <Button href="/signup" variant="primary">
                Sign up <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <footer className="mt-8 flex flex-col items-center justify-between gap-3 text-xs text-zinc-600 dark:text-zinc-300 md:flex-row">
          <div className="flex items-center gap-2">
            <Droplets className="h-4 w-4" />
            <span className="font-semibold">HydroSync</span>
            <span className="opacity-70">© {new Date().getFullYear()}</span>
          </div>
          <div className="flex items-center gap-4">
            <a className="hover:underline" href="#how">
              How it works
            </a>
            <a className="hover:underline" href="#impact">
              Impact
            </a>
            <a className="hover:underline" href="/login">
              Login
            </a>
            <a className="hover:underline" href="/signup">
              Sign up
            </a>
          </div>
        </footer>
      </section>
    </div>
  );
}
