// // "use client";

// // import Link from "next/link";
// // import { useRouter } from "next/navigation";
// // import { useMemo, useState } from "react";
// // import { useForm } from "react-hook-form";
// // import { z } from "zod";
// // import { zodResolver } from "@hookform/resolvers/zod";

// // import { AuthShell } from "@/components/auth-shell";
// // import { Button } from "@/components/ui/button";
// // import { Input } from "@/components/ui/input";
// // import { Label } from "@/components/ui/label";
// // import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// // // import { signupMock, type MockUser } from "@/lib/mock-auth";

// // const US_STATES = [
// //   "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA",
// //   "HI","ID","IL","IN","IA","KS","KY","LA","ME","MD",
// //   "MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
// //   "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC",
// //   "SD","TN","TX","UT","VT","VA","WA","WV","WI","WY",
// // ] as const;

// // const schema = z
// //   .object({
// //     role: z.enum(["producer", "consumer"]),

// //     username: z.string().min(3, "Username must be at least 3 characters"),
// //     password: z.string().min(8, "Password must be at least 8 characters"),

// //     orgName: z.string().min(2, "Company/Industry name is required"),
// //     city: z.string().min(2, "City is required"),
// //     state: z.string().min(2, "State is required"),
// //     address: z.string().min(5, "Address is required"),

// //     consumerType: z.string().optional(),
// //   })
// //   .superRefine((data, ctx) => {
// //     if (!data.role) {
// //       ctx.addIssue({
// //         code: z.ZodIssueCode.custom,
// //         path: ["role"],
// //         message: "Please choose Producer or Consumer",
// //       });
// //     }

// //     if (data.role === "consumer") {
// //       if (!data.consumerType || data.consumerType.trim().length < 2) {
// //         ctx.addIssue({
// //           code: z.ZodIssueCode.custom,
// //           path: ["consumerType"],
// //           message: "Type of company is required for consumers",
// //         });
// //       }
// //     }
// //   });

// // type FormData = z.infer<typeof schema>;

// // export default function SignupPage() {
// //   const router = useRouter();
// //   const [serverError, setServerError] = useState<string | null>(null);

// //   const form = useForm<FormData>({
// //     resolver: zodResolver(schema),
// //     defaultValues: {
// //       role: "producer",
// //       username: "",
// //       password: "",
// //       orgName: "",
// //       city: "",
// //       state: "",
// //       address: "",
// //       consumerType: "",
// //     },
// //     mode: "onTouched",
// //   });

// //   const role = form.watch("role");
// //   const isConsumer = useMemo(() => role === "consumer", [role]);

// //   // function onSubmit(values: FormData) {
// //   //   setServerError(null);

// //   //   const payload: MockUser = {
// //   //     role: values.role,
// //   //     username: values.username.trim(),
// //   //     password: values.password,

// //   //     orgName: values.orgName.trim(),
// //   //     city: values.city.trim(),
// //   //     state: values.state.trim(),
// //   //     address: values.address.trim(),

// //   //     ...(values.role === "consumer"
// //   //       ? { consumerType: values.consumerType?.trim() }
// //   //       : {}),
// //   //   };

// //   //   signupMock(payload);
// //   //   router.push("/dashboard");
// //   // }

// //   async function onSubmit(values: FormData) {
// //       setServerError(null);

// //       try {
// //         const res = await fetch("/api/auth/signup", {
// //           method: "POST",
// //           headers: { "Content-Type": "application/json" },
// //           body: JSON.stringify({
// //             role: values.role,
// //             username: values.username.trim(),
// //             password: values.password,

// //             orgName: values.orgName.trim(),
// //             city: values.city.trim(),
// //             state: values.state.trim(),
// //             address: values.address.trim(),

// //             consumerType: values.role === "consumer" ? values.consumerType?.trim() : "",
// //           }),
// //         });

// //         const data = await res.json();

// //         if (!res.ok) {
// //           setServerError(data?.error || "Signup failed");
// //           return;
// //         }

// //         // Optional: store userId locally for hackathon flows
// //         localStorage.setItem("hydrosync_user", JSON.stringify(data.user));

// //         router.push("/dashboard");
// //       } catch (e: any) {
// //         setServerError(e?.message || "Network error");
// //       }
// //     }

// //   return (
// //     <AuthShell
// //       title="Create your HydroSync account"
// //       subtitle="Connect greywater producers to verified consumers."
// //     >
// //       <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
// //         {/* Producer vs Consumer */}
// //         <div className="space-y-2">
// //           <Label>Are you a producer or a consumer?</Label>

// //           <RadioGroup
// //             className="grid grid-cols-2 gap-3"
// //             value={role}
// //             onValueChange={(v) => form.setValue("role", v as FormData["role"], { shouldValidate: true })}
// //           >
// //             <label className="flex cursor-pointer items-center gap-2 rounded-lg border p-3 hover:bg-muted/50">
// //               <RadioGroupItem value="producer" id="producer" />
// //               <div>
// //                 <p className="text-sm font-medium">Producer</p>
// //                 <p className="text-xs text-muted-foreground">Generates greywater</p>
// //               </div>
// //             </label>

// //             <label className="flex cursor-pointer items-center gap-2 rounded-lg border p-3 hover:bg-muted/50">
// //               <RadioGroupItem value="consumer" id="consumer" />
// //               <div>
// //                 <p className="text-sm font-medium">Consumer</p>
// //                 <p className="text-xs text-muted-foreground">Needs water supply</p>
// //               </div>
// //             </label>
// //           </RadioGroup>

// //           {form.formState.errors.role && (
// //             <p className="text-sm text-destructive">{form.formState.errors.role.message}</p>
// //           )}
// //         </div>

// //         {/* Username + Password */}
// //         <div className="grid gap-4 sm:grid-cols-2">
// //           <div className="space-y-2">
// //             <Label htmlFor="username">Username</Label>
// //             <Input id="username" placeholder="figo123" {...form.register("username")} />
// //             {form.formState.errors.username && (
// //               <p className="text-sm text-destructive">{form.formState.errors.username.message}</p>
// //             )}
// //           </div>

// //           <div className="space-y-2">
// //             <Label htmlFor="password">Password</Label>
// //             <Input id="password" type="password" placeholder="At least 8 characters" {...form.register("password")} />
// //             {form.formState.errors.password && (
// //               <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
// //             )}
// //           </div>
// //         </div>

// //         {/* Org Name */}
// //         <div className="space-y-2">
// //           <Label htmlFor="orgName">{role === "producer" ? "Name of Industry" : "Name of Company"}</Label>
// //           <Input id="orgName" placeholder="Acme Manufacturing / HyperScale DC" {...form.register("orgName")} />
// //           {form.formState.errors.orgName && (
// //             <p className="text-sm text-destructive">{form.formState.errors.orgName.message}</p>
// //           )}
// //         </div>

// //         {/* Location */}
// //         <div className="grid gap-4 sm:grid-cols-2">
// //           <div className="space-y-2">
// //             <Label htmlFor="city">City</Label>
// //             <Input id="city" placeholder="San Francisco" {...form.register("city")} />
// //             {form.formState.errors.city && (
// //               <p className="text-sm text-destructive">{form.formState.errors.city.message}</p>
// //             )}
// //           </div>

// //           <div className="space-y-2">
// //             <Label htmlFor="state">State</Label>
// //             <Input
// //               id="state"
// //               placeholder="CA"
// //               maxLength={2}
// //               {...form.register("state")}
// //               onChange={(e) => form.setValue("state", e.target.value.toUpperCase(), { shouldValidate: true })}
// //             />
// //             <p className="text-xs text-muted-foreground">Use 2-letter code (e.g., CA, OH).</p>
// //             {form.formState.errors.state && (
// //               <p className="text-sm text-destructive">{form.formState.errors.state.message}</p>
// //             )}
// //           </div>
// //         </div>

// //         {/* Address */}
// //         <div className="space-y-2">
// //           <Label htmlFor="address">Address</Label>
// //           <Input id="address" placeholder="123 Market St, Suite 400" {...form.register("address")} />
// //           {form.formState.errors.address && (
// //             <p className="text-sm text-destructive">{form.formState.errors.address.message}</p>
// //           )}
// //         </div>

// //         {/* Consumer-only field */}
// //         {isConsumer && (
// //           <div className="space-y-2">
// //             <Label htmlFor="consumerType">Type of Company</Label>
// //             <Input
// //               id="consumerType"
// //               placeholder="Data Center, Agriculture, Manufacturing..."
// //               {...form.register("consumerType")}
// //             />
// //             {form.formState.errors.consumerType && (
// //               <p className="text-sm text-destructive">{form.formState.errors.consumerType.message}</p>
// //             )}
// //             <p className="text-xs text-muted-foreground">
// //               Example: Data centers (GPU cooling), Agriculture irrigation, Construction, etc.
// //             </p>
// //           </div>
// //         )}

// //         {serverError && (
// //           <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
// //             {serverError}
// //           </div>
// //         )}

// //         <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
// //           {form.formState.isSubmitting ? "Creating..." : "Create account"}
// //         </Button>

// //         <p className="text-center text-sm text-muted-foreground">
// //           Already have an account?{" "}
// //           <Link className="text-foreground underline underline-offset-4" href="/login">
// //             Sign in
// //           </Link>
// //         </p>
// //       </form>
// //     </AuthShell>
// //   );
// // }





// "use client";

// import Link from "next/link";
// import { useRouter } from "next/navigation";
// import { useMemo, useState } from "react";
// import { useForm } from "react-hook-form";
// import { z } from "zod";
// import { zodResolver } from "@hookform/resolvers/zod";

// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
// import { ThemeToggle } from "@/components/theme/theme-toggle";

// const schema = z
//   .object({
//     role: z.enum(["producer", "consumer"]),

//     username: z.string().min(3, "Username must be at least 3 characters"),
//     password: z.string().min(8, "Password must be at least 8 characters"),

//     orgName: z.string().min(2, "Company/Industry name is required"),
//     city: z.string().min(2, "City is required"),
//     state: z.string().min(2, "State is required"),
//     address: z.string().min(5, "Address is required"),

//     consumerType: z.string().optional(),
//   })
//   .superRefine((data, ctx) => {
//     if (!data.role) {
//       ctx.addIssue({
//         code: z.ZodIssueCode.custom,
//         path: ["role"],
//         message: "Please choose Producer or Consumer",
//       });
//     }

//     if (data.role === "consumer") {
//       if (!data.consumerType || data.consumerType.trim().length < 2) {
//         ctx.addIssue({
//           code: z.ZodIssueCode.custom,
//           path: ["consumerType"],
//           message: "Type of company is required for consumers",
//         });
//       }
//     }
//   });

// type FormData = z.infer<typeof schema>;

// export default function SignupPage() {
//   const router = useRouter();
//   const [serverError, setServerError] = useState<string | null>(null);

//   const form = useForm<FormData>({
//     resolver: zodResolver(schema),
//     defaultValues: {
//       role: "producer",
//       username: "",
//       password: "",
//       orgName: "",
//       city: "",
//       state: "",
//       address: "",
//       consumerType: "",
//     },
//     mode: "onTouched",
//   });

//   const role = form.watch("role");
//   const isConsumer = useMemo(() => role === "consumer", [role]);
//   const year = useMemo(() => new Date().getFullYear(), []);

//   async function onSubmit(values: FormData) {
//     setServerError(null);

//     try {
//       const res = await fetch("/api/auth/signup", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           role: values.role,
//           username: values.username.trim(),
//           password: values.password,

//           orgName: values.orgName.trim(),
//           city: values.city.trim(),
//           state: values.state.trim(),
//           address: values.address.trim(),

//           consumerType: values.role === "consumer" ? values.consumerType?.trim() : "",
//         }),
//       });

//       const data = await res.json();

//       if (!res.ok) {
//         setServerError(data?.error || "Signup failed");
//         return;
//       }

//       // Store user for hackathon flows
//       localStorage.setItem("hydrosync_user", JSON.stringify(data.user));

//       router.push("/dashboard");
//     } catch (e: any) {
//       setServerError(e?.message || "Network error");
//     }
//   }

//   return (
//     <div className="min-h-screen bg-background text-foreground">
//       {/* subtle background glow */}
//       <div className="pointer-events-none fixed inset-0 -z-10">
//         <div className="absolute left-1/2 top-[-140px] h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-gradient-to-b from-emerald-400/20 via-sky-400/15 to-transparent blur-3xl" />
//         <div className="absolute bottom-[-220px] right-[-180px] h-[520px] w-[520px] rounded-full bg-gradient-to-tr from-indigo-400/15 via-sky-400/10 to-transparent blur-3xl" />
//       </div>

//       <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-4 py-10 md:min-h-screen md:grid-cols-2 md:items-center md:py-0">
//         {/* LEFT: Brand panel */}
//         <div className="relative hidden overflow-hidden rounded-3xl border bg-card p-8 md:block">
//           <div className="absolute -left-32 -top-32 h-72 w-72 rounded-full bg-gradient-to-br from-emerald-400/25 via-sky-400/20 to-indigo-400/15 blur-3xl" />
//           <div className="absolute -bottom-32 -right-32 h-72 w-72 rounded-full bg-gradient-to-tr from-indigo-400/20 via-sky-400/15 to-emerald-400/10 blur-3xl" />

//           <div className="relative flex h-full flex-col justify-between">
//             <div>
//               <Link href="/" className="inline-flex items-center gap-2">
//                 <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-foreground text-background">
//                   <span className="text-lg font-black">H</span>
//                 </div>
//                 <div className="leading-tight">
//                   <div className="text-base font-extrabold">HydroSync</div>
//                   <div className="text-xs text-muted-foreground">hydroconnect.tech</div>
//                 </div>
//               </Link>

//               <h1 className="mt-10 text-3xl font-black tracking-tight">
//                 Build a{" "}
//                 <span className="bg-gradient-to-r from-emerald-500 via-sky-500 to-indigo-500 bg-clip-text text-transparent">
//                   verified
//                 </span>{" "}
//                 industrial water exchange.
//               </h1>

//               <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">
//                 Create your account to upload evidence, generate Water Passports,
//                 and match safe reuse routes with confidence.
//               </p>

//               <div className="mt-8 grid gap-3">
//                 <div className="rounded-2xl border bg-background/50 p-4">
//                   <div className="text-sm font-semibold">Producers</div>
//                   <div className="mt-1 text-xs text-muted-foreground">
//                     Certify quality, reduce discharge risk, unlock reuse value.
//                   </div>
//                 </div>

//                 <div className="rounded-2xl border bg-background/50 p-4">
//                   <div className="text-sm font-semibold">Consumers</div>
//                   <div className="mt-1 text-xs text-muted-foreground">
//                     Source reclaimed water that matches operational constraints.
//                   </div>
//                 </div>

//                 <div className="rounded-2xl border bg-background/50 p-4">
//                   <div className="text-sm font-semibold">Auditable & explainable</div>
//                   <div className="mt-1 text-xs text-muted-foreground">
//                     Evidence-backed decisions with clear limits and confidence.
//                   </div>
//                 </div>
//               </div>
//             </div>

//             <div className="relative mt-10 flex items-center justify-between text-xs text-muted-foreground">
//               <span>© {year} HydroSync</span>
//               <span>Water-positive operations</span>
//             </div>
//           </div>
//         </div>

//         {/* RIGHT: Signup form */}
//         <div className="flex flex-col items-center justify-center">
//           {/* Mobile header */}
//           <div className="mb-6 flex w-full items-center justify-between md:hidden">
//             <Link href="/" className="inline-flex items-center gap-2">
//               <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-foreground text-background">
//                 <span className="text-lg font-black">H</span>
//               </div>
//               <div className="leading-tight">
//                 <div className="text-sm font-extrabold">HydroSync</div>
//                 <div className="text-[11px] text-muted-foreground">hydroconnect.tech</div>
//               </div>
//             </Link>

//             <div className="flex items-center gap-2">
//               <ThemeToggle />
//               <Link
//                 href="/login"
//                 className="text-sm font-semibold text-foreground underline underline-offset-4"
//               >
//                 Sign in
//               </Link>
//             </div>
//           </div>

//           <div className="w-full max-w-md rounded-3xl border bg-card p-6 shadow-sm md:p-8">
//             <div className="mb-6 flex items-start justify-between gap-4">
//               <div>
//                 <h2 className="text-2xl font-black tracking-tight">Create account</h2>
//                 <p className="mt-1 text-sm text-muted-foreground">
//                   Producers and consumers—verified reuse starts here.
//                 </p>
//               </div>
//               <ThemeToggle className="shrink-0" />
//             </div>

//             {serverError && (
//               <div className="mb-4 rounded-2xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
//                 {serverError}
//               </div>
//             )}

//             <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
//               {/* Role selector */}
//               <div className="space-y-2">
//                 <Label>Choose your role</Label>

//                 <RadioGroup
//                   className="grid grid-cols-2 gap-3"
//                   value={role}
//                   onValueChange={(v) =>
//                     form.setValue("role", v as FormData["role"], {
//                       shouldValidate: true,
//                     })
//                   }
//                 >
//                   <label className="group flex cursor-pointer items-start gap-3 rounded-2xl border bg-background/40 p-4 hover:bg-muted/40">
//                     <RadioGroupItem value="producer" id="producer" className="mt-1" />
//                     <div>
//                       <p className="text-sm font-semibold">Producer</p>
//                       <p className="text-xs text-muted-foreground">
//                         Generates greywater / wastewater
//                       </p>
//                     </div>
//                   </label>

//                   <label className="group flex cursor-pointer items-start gap-3 rounded-2xl border bg-background/40 p-4 hover:bg-muted/40">
//                     <RadioGroupItem value="consumer" id="consumer" className="mt-1" />
//                     <div>
//                       <p className="text-sm font-semibold">Consumer</p>
//                       <p className="text-xs text-muted-foreground">
//                         Needs water supply for operations
//                       </p>
//                     </div>
//                   </label>
//                 </RadioGroup>

//                 {form.formState.errors.role && (
//                   <p className="text-sm text-destructive">
//                     {form.formState.errors.role.message}
//                   </p>
//                 )}
//               </div>

//               {/* Username + Password */}
//               <div className="grid gap-4 sm:grid-cols-2">
//                 <div className="space-y-2">
//                   <Label htmlFor="username">Username</Label>
//                   <Input id="username" placeholder="figo123" {...form.register("username")} />
//                   {form.formState.errors.username && (
//                     <p className="text-sm text-destructive">
//                       {form.formState.errors.username.message}
//                     </p>
//                   )}
//                 </div>

//                 <div className="space-y-2">
//                   <Label htmlFor="password">Password</Label>
//                   <Input
//                     id="password"
//                     type="password"
//                     placeholder="At least 8 characters"
//                     {...form.register("password")}
//                   />
//                   {form.formState.errors.password && (
//                     <p className="text-sm text-destructive">
//                       {form.formState.errors.password.message}
//                     </p>
//                   )}
//                 </div>
//               </div>

//               {/* Org */}
//               <div className="space-y-2">
//                 <Label htmlFor="orgName">
//                   {role === "producer" ? "Industry name" : "Company name"}
//                 </Label>
//                 <Input
//                   id="orgName"
//                   placeholder="Acme Manufacturing / HyperScale DC"
//                   {...form.register("orgName")}
//                 />
//                 {form.formState.errors.orgName && (
//                   <p className="text-sm text-destructive">
//                     {form.formState.errors.orgName.message}
//                   </p>
//                 )}
//               </div>

//               {/* Location */}
//               <div className="grid gap-4 sm:grid-cols-2">
//                 <div className="space-y-2">
//                   <Label htmlFor="city">City</Label>
//                   <Input id="city" placeholder="San Francisco" {...form.register("city")} />
//                   {form.formState.errors.city && (
//                     <p className="text-sm text-destructive">
//                       {form.formState.errors.city.message}
//                     </p>
//                   )}
//                 </div>

//                 <div className="space-y-2">
//                   <Label htmlFor="state">State</Label>
//                   <Input
//                     id="state"
//                     placeholder="CA"
//                     maxLength={2}
//                     {...form.register("state")}
//                     onChange={(e) =>
//                       form.setValue("state", e.target.value.toUpperCase(), {
//                         shouldValidate: true,
//                       })
//                     }
//                   />
//                   <p className="text-xs text-muted-foreground">2-letter code (e.g., CA, OH).</p>
//                   {form.formState.errors.state && (
//                     <p className="text-sm text-destructive">
//                       {form.formState.errors.state.message}
//                     </p>
//                   )}
//                 </div>
//               </div>

//               {/* Address */}
//               <div className="space-y-2">
//                 <Label htmlFor="address">Address</Label>
//                 <Input
//                   id="address"
//                   placeholder="123 Market St, Suite 400"
//                   {...form.register("address")}
//                 />
//                 {form.formState.errors.address && (
//                   <p className="text-sm text-destructive">
//                     {form.formState.errors.address.message}
//                   </p>
//                 )}
//               </div>

//               {/* Consumer-only */}
//               {isConsumer && (
//                 <div className="space-y-2">
//                   <Label htmlFor="consumerType">Type of company</Label>
//                   <Input
//                     id="consumerType"
//                     placeholder="Data Center, Agriculture, Manufacturing..."
//                     {...form.register("consumerType")}
//                   />
//                   {form.formState.errors.consumerType && (
//                     <p className="text-sm text-destructive">
//                       {form.formState.errors.consumerType.message}
//                     </p>
//                   )}
//                   <p className="text-xs text-muted-foreground">
//                     Example: Data centers (GPU cooling), Agriculture irrigation, Construction, etc.
//                   </p>
//                 </div>
//               )}

//               <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
//                 {form.formState.isSubmitting ? "Creating..." : "Create account"}
//               </Button>

//               <p className="text-center text-sm text-muted-foreground">
//                 Already have an account?{" "}
//                 <Link className="text-foreground underline underline-offset-4" href="/login">
//                   Sign in
//                 </Link>
//               </p>
//             </form>
//           </div>

//           <div className="mt-6 text-center text-xs text-muted-foreground md:hidden">
//             © {year} HydroSync
//           </div>
//         </div>
//       </div>
//     </div>
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const schema = z
  .object({
    role: z.enum(["producer", "consumer"]),
    username: z.string().min(3, "Username must be at least 3 characters"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    orgName: z.string().min(2, "Company/Industry name is required"),
    city: z.string().min(2, "City is required"),
    state: z.string().min(2, "State is required"),
    address: z.string().min(5, "Address is required"),
    consumerType: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.role === "consumer") {
      if (!data.consumerType || data.consumerType.trim().length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["consumerType"],
          message: "Type of company is required for consumers",
        });
      }
    }
  });

type FormData = z.infer<typeof schema>;

export default function SignupPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      role: "producer",
      username: "",
      password: "",
      orgName: "",
      city: "",
      state: "",
      address: "",
      consumerType: "",
    },
    mode: "onTouched",
  });

  const role = form.watch("role");
  const isConsumer = useMemo(() => role === "consumer", [role]);

  async function onSubmit(values: FormData) {
    setServerError(null);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: values.role,
          username: values.username.trim(),
          password: values.password,
          orgName: values.orgName.trim(),
          city: values.city.trim(),
          state: values.state.trim(),
          address: values.address.trim(),
          consumerType: values.role === "consumer" ? values.consumerType?.trim() : "",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setServerError(data?.error || "Signup failed");
        return;
      }

      localStorage.setItem("hydrosync_user", JSON.stringify(data.user));
      router.push("/dashboard");
    } catch (e: any) {
      setServerError(e?.message || "Network error");
    }
  }

  return (
    <div className="rounded-3xl border bg-card p-6 shadow-sm md:p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-black tracking-tight">Create account</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Producers and consumers—verified reuse starts here.
        </p>
      </div>

      {serverError && (
        <div className="mb-4 rounded-2xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {serverError}
        </div>
      )}

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        {/* Role */}
        <div className="space-y-2">
          <Label>Choose your role</Label>
          <RadioGroup
            className="grid grid-cols-2 gap-3"
            value={role}
            onValueChange={(v) =>
              form.setValue("role", v as FormData["role"], { shouldValidate: true })
            }
          >
            <label className="flex cursor-pointer items-start gap-3 rounded-2xl border bg-background/40 p-4 hover:bg-muted/40">
              <RadioGroupItem value="producer" id="producer" className="mt-1" />
              <div>
                <p className="text-sm font-semibold">Producer</p>
                <p className="text-xs text-muted-foreground">Generates greywater / wastewater</p>
              </div>
            </label>

            <label className="flex cursor-pointer items-start gap-3 rounded-2xl border bg-background/40 p-4 hover:bg-muted/40">
              <RadioGroupItem value="consumer" id="consumer" className="mt-1" />
              <div>
                <p className="text-sm font-semibold">Consumer</p>
                <p className="text-xs text-muted-foreground">Needs water supply for operations</p>
              </div>
            </label>
          </RadioGroup>
          {form.formState.errors.role && (
            <p className="text-sm text-destructive">{form.formState.errors.role.message}</p>
          )}
        </div>

        {/* Username + Password */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input id="username" placeholder="figo123" {...form.register("username")} />
            {form.formState.errors.username && (
              <p className="text-sm text-destructive">{form.formState.errors.username.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="At least 8 characters"
              {...form.register("password")}
            />
            {form.formState.errors.password && (
              <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
            )}
          </div>
        </div>

        {/* Org */}
        <div className="space-y-2">
          <Label htmlFor="orgName">{role === "producer" ? "Industry name" : "Company name"}</Label>
          <Input
            id="orgName"
            placeholder="Acme Manufacturing / HyperScale DC"
            {...form.register("orgName")}
          />
          {form.formState.errors.orgName && (
            <p className="text-sm text-destructive">{form.formState.errors.orgName.message}</p>
          )}
        </div>

        {/* Location */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input id="city" placeholder="San Francisco" {...form.register("city")} />
            {form.formState.errors.city && (
              <p className="text-sm text-destructive">{form.formState.errors.city.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="state">State</Label>
            <Input
              id="state"
              placeholder="CA"
              maxLength={2}
              {...form.register("state")}
              onChange={(e) =>
                form.setValue("state", e.target.value.toUpperCase(), { shouldValidate: true })
              }
            />
            <p className="text-xs text-muted-foreground">2-letter code (e.g., CA, OH).</p>
            {form.formState.errors.state && (
              <p className="text-sm text-destructive">{form.formState.errors.state.message}</p>
            )}
          </div>
        </div>

        {/* Address */}
        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          <Input id="address" placeholder="123 Market St, Suite 400" {...form.register("address")} />
          {form.formState.errors.address && (
            <p className="text-sm text-destructive">{form.formState.errors.address.message}</p>
          )}
        </div>

        {/* Consumer-only */}
        {isConsumer && (
          <div className="space-y-2">
            <Label htmlFor="consumerType">Type of company</Label>
            <Input
              id="consumerType"
              placeholder="Data Center, Agriculture, Manufacturing..."
              {...form.register("consumerType")}
            />
            {form.formState.errors.consumerType && (
              <p className="text-sm text-destructive">
                {form.formState.errors.consumerType.message}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Example: Data centers (GPU cooling), Agriculture irrigation, Construction, etc.
            </p>
          </div>
        )}

        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Creating..." : "Create account"}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link className="text-foreground underline underline-offset-4" href="/login">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}
