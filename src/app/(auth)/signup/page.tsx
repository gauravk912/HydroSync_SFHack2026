"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { AuthShell } from "@/components/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// import { signupMock, type MockUser } from "@/lib/mock-auth";

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA",
  "HI","ID","IL","IN","IA","KS","KY","LA","ME","MD",
  "MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC",
  "SD","TN","TX","UT","VT","VA","WA","WV","WI","WY",
] as const;

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
    if (!data.role) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["role"],
        message: "Please choose Producer or Consumer",
      });
    }

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

  // function onSubmit(values: FormData) {
  //   setServerError(null);

  //   const payload: MockUser = {
  //     role: values.role,
  //     username: values.username.trim(),
  //     password: values.password,

  //     orgName: values.orgName.trim(),
  //     city: values.city.trim(),
  //     state: values.state.trim(),
  //     address: values.address.trim(),

  //     ...(values.role === "consumer"
  //       ? { consumerType: values.consumerType?.trim() }
  //       : {}),
  //   };

  //   signupMock(payload);
  //   router.push("/dashboard");
  // }

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

        // Optional: store userId locally for hackathon flows
        localStorage.setItem("hydrosync_user", JSON.stringify(data.user));

        router.push("/dashboard");
      } catch (e: any) {
        setServerError(e?.message || "Network error");
      }
    }

  return (
    <AuthShell
      title="Create your HydroSync account"
      subtitle="Connect greywater producers to verified consumers."
    >
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        {/* Producer vs Consumer */}
        <div className="space-y-2">
          <Label>Are you a producer or a consumer?</Label>

          <RadioGroup
            className="grid grid-cols-2 gap-3"
            value={role}
            onValueChange={(v) => form.setValue("role", v as FormData["role"], { shouldValidate: true })}
          >
            <label className="flex cursor-pointer items-center gap-2 rounded-lg border p-3 hover:bg-muted/50">
              <RadioGroupItem value="producer" id="producer" />
              <div>
                <p className="text-sm font-medium">Producer</p>
                <p className="text-xs text-muted-foreground">Generates greywater</p>
              </div>
            </label>

            <label className="flex cursor-pointer items-center gap-2 rounded-lg border p-3 hover:bg-muted/50">
              <RadioGroupItem value="consumer" id="consumer" />
              <div>
                <p className="text-sm font-medium">Consumer</p>
                <p className="text-xs text-muted-foreground">Needs water supply</p>
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
            <Input id="password" type="password" placeholder="At least 8 characters" {...form.register("password")} />
            {form.formState.errors.password && (
              <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
            )}
          </div>
        </div>

        {/* Org Name */}
        <div className="space-y-2">
          <Label htmlFor="orgName">{role === "producer" ? "Name of Industry" : "Name of Company"}</Label>
          <Input id="orgName" placeholder="Acme Manufacturing / HyperScale DC" {...form.register("orgName")} />
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
              onChange={(e) => form.setValue("state", e.target.value.toUpperCase(), { shouldValidate: true })}
            />
            <p className="text-xs text-muted-foreground">Use 2-letter code (e.g., CA, OH).</p>
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

        {/* Consumer-only field */}
        {isConsumer && (
          <div className="space-y-2">
            <Label htmlFor="consumerType">Type of Company</Label>
            <Input
              id="consumerType"
              placeholder="Data Center, Agriculture, Manufacturing..."
              {...form.register("consumerType")}
            />
            {form.formState.errors.consumerType && (
              <p className="text-sm text-destructive">{form.formState.errors.consumerType.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Example: Data centers (GPU cooling), Agriculture irrigation, Construction, etc.
            </p>
          </div>
        )}

        {serverError && (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            {serverError}
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
    </AuthShell>
  );
}