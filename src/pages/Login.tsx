import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import axios from "axios";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldLabel } from "@/components/ui/field";
import { Label } from "@/components/ui/label";

import PasswordInput from "@/components/common/inputs/PasswordInput";
import AuthBrandPanel from "@/components/specified/pages/auth/AuthBrandPanel";

import { useAuth } from "@/context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, isBootstrapping, isSubmitting } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);

  const redirectTo = (location.state as { from?: string } | null)?.from ?? "/dashboard";

  if (!isBootstrapping && isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  async function submit() {
    if (isSubmitting) return;
    try {
      await login(email.trim(), password);
      toast.success("Welcome back");
      navigate(redirectTo, { replace: true });
    } catch (err) {
      toast.error(extractLoginErrorMessage(err));
    }
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <AuthBrandPanel />

      <main className="relative flex flex-1 flex-col items-center justify-center px-6 sm:px-12">
        <div className="lg:hidden absolute top-6 left-6 flex items-center gap-2">
          <img src="/logo.svg" alt="Sentinel" className="size-7" />
          <span className="font-semibold tracking-tight">Sentinel</span>
        </div>

        <div className="w-full max-w-sm space-y-8 page-enter">
          <header className="space-y-1.5">
            <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
            <p className="text-sm text-muted-foreground">Sign in to continue.</p>
          </header>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              void submit();
            }}
            className="space-y-4"
          >
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder="you@company.com"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <PasswordInput
                id="password"
                placeholder="••••••••"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Field>

            <Label htmlFor="remember" className="text-sm font-normal text-muted-foreground">
              <Checkbox id="remember" checked={remember} onCheckedChange={(v) => setRemember(v === true)} />
              Keep me signed in for 30 days
            </Label>

            <Button type="submit" loading={isSubmitting} className="w-full">
              {isSubmitting ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
}

function extractLoginErrorMessage(err: unknown): string {
  const fallback = "Unable to sign in. Please try again.";
  if (!axios.isAxiosError(err)) return fallback;
  const status = err.response?.status;
  const apiMessage = (err.response?.data as { message?: string } | undefined)?.message;
  if (status === 401 || status === 422) return apiMessage ?? "Invalid email or password.";
  return apiMessage ?? fallback;
}
