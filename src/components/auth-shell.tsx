import { Card, CardContent } from "@/components/ui/card";

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="w-full max-w-md">
      <div className="mb-6 text-center">
        <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-foreground text-background font-semibold shadow-sm">
          HS
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
      </div>

      <Card className="shadow-sm">
        <CardContent className="pt-6">{children}</CardContent>
      </Card>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        By continuing, you agree to HydroSync’s Terms and Privacy Policy.
      </p>
    </div>
  );
}