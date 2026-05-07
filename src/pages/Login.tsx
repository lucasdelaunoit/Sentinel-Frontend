import { useState, type FormEvent } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, isBootstrapping, isSubmitting } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  if (!isBootstrapping && isAuthenticated) {
    const from = (location.state as { from?: string } | null)?.from ?? "/dashboard";
    return <Navigate to={from} replace />;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (isSubmitting) return;
    try {
      await login(email.trim(), password);
      toast.success("Welcome back");
      const from = (location.state as { from?: string } | null)?.from ?? "/dashboard";
      navigate(from, { replace: true });
    } catch (err) {
      let message = "Unable to sign in. Please try again.";
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        const apiMessage = (err.response?.data as { message?: string } | undefined)?.message;
        if (status === 401 || status === 422) message = apiMessage ?? "Invalid email or password.";
        else if (apiMessage) message = apiMessage;
      }
      toast.error(message);
    }
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* ─── Brand panel (left) ───────────────────────── */}
      <aside
        className="relative hidden lg:flex w-[44%] xl:w-[48%] flex-col justify-between overflow-hidden p-10 text-white"
        style={{ backgroundColor: "#0e0c0b" }}
      >
        {/* Layered gradient — primary green only, falling into deep charcoal */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(130% 95% at 0% 0%, rgba(9,113,85,0.55) 0%, rgba(9,113,85,0.18) 26%, rgba(14,12,11,0) 58%), linear-gradient(160deg, #14110f 0%, #0e0c0b 55%, #0a0908 100%)",
          }}
        />
        {/* Grain — kills banding, adds premium feel */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.08] mix-blend-overlay"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml;utf8,<svg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
          }}
        />
        {/* Soft fine grid, masked toward top-left so it fades */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
            backgroundSize: "56px 56px",
            maskImage: "radial-gradient(circle at 0% 0%, black 0%, transparent 65%)",
          }}
        />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <img src="/logo.svg" alt="Sentinel" className="size-9 select-none" draggable={false} />
          <div className="leading-tight">
            <p className="text-[15px] font-bold tracking-tight">Sentinel</p>
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] mt-1 text-white/35">Risk Intelligence</p>
          </div>
        </div>

        {/* Quote / footer */}
        <div className="relative z-10 space-y-6">
          <div className="flex items-center justify-between text-[11px] text-white/30">
            <span>© {new Date().getFullYear()} Sentinel</span>
          </div>
        </div>
      </aside>

      {/* ─── Form panel (right) ───────────────────────── */}
      <main className="relative flex flex-1 flex-col items-center justify-center px-6 py-10 sm:px-12">
        {/* mobile logo */}
        <div className="lg:hidden absolute top-6 left-6 flex items-center gap-2">
          <img src="/logo.svg" alt="Sentinel" className="size-7 invert" />
          <span className="font-bold tracking-tight">Sentinel</span>
        </div>

        <div className="w-full max-w-sm space-y-7 page-enter">
          <header className="space-y-1.5">
            <h2 className="text-[26px] font-bold tracking-tight text-foreground">Welcome back</h2>
            <p className="text-sm text-muted-foreground">Sign in to continue analyzing your team's resilience.</p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Work email" htmlFor="email">
              <Input
                id="email"
                type="email"
                placeholder="you@company.com"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-10 rounded-lg bg-card border-border"
              />
            </Field>

            <Field
              label="Password"
              htmlFor="password"
              trailing={
                <a href="#" className="text-[11px] font-semibold text-primary hover:underline">
                  Forgot?
                </a>
              }
            >
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-10 rounded-lg bg-card border-border pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                </button>
              </div>
            </Field>

            <label
              htmlFor="remember"
              className="flex items-center gap-2 text-[12px] text-muted-foreground cursor-pointer select-none"
            >
              <Checkbox id="remember" checked={remember} onCheckedChange={(v) => setRemember(v === true)} />
              Keep me signed in for 30 days
            </label>

            <Button
              type="submit"
              size="lg"
              disabled={isSubmitting}
              className="w-full h-11 text-sm font-semibold rounded-lg shadow-sm shadow-primary/20 group"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="size-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in…
                </span>
              ) : (
                <>
                  Sign in
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border/70" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-background px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                or continue with
              </span>
            </div>
          </div>

          {/* SSO */}
          <div className="grid grid-cols-2 gap-2.5">
            <SsoButton label="Google" icon={<GoogleIcon />} />
            <SsoButton label="Microsoft" icon={<MicrosoftIcon />} />
          </div>

          <p className="text-center text-[11px] text-muted-foreground leading-relaxed">
            By signing in you agree to our{" "}
            <a href="#" className="underline hover:text-foreground">
              Terms
            </a>{" "}
            and{" "}
            <a href="#" className="underline hover:text-foreground">
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </main>
    </div>
  );
}

/* ─── Bits ─────────────────────────────────────────── */

function Field({
  label,
  htmlFor,
  trailing,
  children,
}: {
  label: string;
  htmlFor: string;
  trailing?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label htmlFor={htmlFor} className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </label>
        {trailing}
      </div>
      {children}
    </div>
  );
}

function SsoButton({ label, icon }: { label: string; icon: React.ReactNode }) {
  return (
    <Button type="button" variant="outline" size="lg" className="h-10 rounded-lg bg-card font-semibold">
      {icon}
      {label}
    </Button>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
      <path
        fill="#EA4335"
        d="M12 10.2v3.9h5.5c-.24 1.4-1.7 4.1-5.5 4.1-3.3 0-6-2.7-6-6.2s2.7-6.2 6-6.2c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.3 14.6 2.4 12 2.4 6.7 2.4 2.5 6.7 2.5 12s4.2 9.6 9.5 9.6c5.5 0 9.1-3.8 9.1-9.3 0-.6-.07-1.1-.16-1.6H12z"
      />
    </svg>
  );
}

function MicrosoftIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
      <path fill="#F25022" d="M3 3h8.5v8.5H3z" />
      <path fill="#7FBA00" d="M12.5 3H21v8.5h-8.5z" />
      <path fill="#00A4EF" d="M3 12.5h8.5V21H3z" />
      <path fill="#FFB900" d="M12.5 12.5H21V21h-8.5z" />
    </svg>
  );
}
