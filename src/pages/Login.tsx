import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useOAuth } from "@/hooks/useOAuth";
import { Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { SEOHead } from "@/components/seo/SEOHead";

const arthaLogo = "/icon-512.png";

export default function Login() {
  // Load remember me preference and saved email from localStorage
  const [rememberMe, setRememberMe] = useState(() => {
    const saved = localStorage.getItem("artha_remember_me");
    return saved !== null ? saved === "true" : true;
  });
  const [email, setEmail] = useState(() => {
    // Pre-fill email if remember me was enabled
    const savedEmail = localStorage.getItem("artha_saved_email");
    return savedEmail || "";
  });
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { oauthLoading, signInWithOAuth } = useOAuth();

  // Persist remember me preference and email to localStorage
  useEffect(() => {
    localStorage.setItem("artha_remember_me", String(rememberMe));
    if (rememberMe && email) {
      localStorage.setItem("artha_saved_email", email);
    } else if (!rememberMe) {
      localStorage.removeItem("artha_saved_email");
    }
  }, [rememberMe, email]);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        navigate("/dashboard", { replace: true });
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        navigate("/dashboard", { replace: true });
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Configure session persistence based on rememberMe
    // If rememberMe is false, we'll manually clear the session on browser close
    if (!rememberMe) {
      // Store a flag to indicate session-only persistence
      sessionStorage.setItem("artha_session_only", "true");
    } else {
      sessionStorage.removeItem("artha_session_only");
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast({
        title: "Login Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Welcome back!",
        description: rememberMe
          ? "You have been logged in. Your session will be remembered."
          : "You have been logged in for this session only.",
      });
      navigate("/dashboard", { replace: true });
    }

    setLoading(false);
  };

  // Handle Google OAuth with rememberMe preference
  const handleGoogleLogin = () => {
    if (!rememberMe) {
      sessionStorage.setItem("artha_session_only", "true");
    } else {
      sessionStorage.removeItem("artha_session_only");
    }
    signInWithOAuth("google");
  };

  return (
    <>
      <SEOHead
        title="Login"
        description="Sign in to Artha to manage your creative business. Access your proposals, invoices, and client management dashboard."
        canonical="https://artha.app/login"
      />
      <main className="min-h-screen bg-background flex">
        {/* Left Panel - Branding */}
        <aside className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-background via-card to-background p-12 flex-col justify-between border-r border-border overflow-hidden">
          <header className="flex items-center gap-3 animate-in fade-in slide-in-from-left-4 duration-500">
            <img src={arthaLogo} alt="Artha" className="h-10 w-10 object-contain animate-pulse" />
            <span className="text-xl font-bold text-foreground tracking-tight">Artha</span>
          </header>
          <section className="space-y-4 animate-in fade-in slide-in-from-left-8 duration-700 delay-150">
            <h1 className="text-4xl font-bold text-foreground">
              Manage your business
              <br />
              <span className="gradient-text animate-in fade-in duration-1000 delay-300">with confidence.</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-md animate-in fade-in duration-700 delay-500">
              Streamline invoices, proposals, and client management all in one place.
            </p>
          </section>
          <footer className="text-muted-foreground text-sm animate-in fade-in duration-500 delay-700">© 2025 Artha. All rights reserved.</footer>
        </aside>

        {/* Right Panel - Login Form */}
        <section className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
            <div className="text-center lg:text-left">
              <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
                <img src={arthaLogo} alt="Artha" className="h-10 w-10 object-contain animate-bounce" />
                <span className="text-xl font-bold text-foreground tracking-tight">Artha</span>
              </div>
              <h2 className="text-2xl font-bold text-foreground">Welcome to Artha</h2>
              <p className="text-muted-foreground mt-2">Access your creative dashboard</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6" autoComplete="on" method="post" action="#">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none"
                    aria-hidden="true"
                  />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="username"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onInput={(e) => setEmail((e.target as HTMLInputElement).value)}
                    className="flex h-10 w-full rounded-lg border border-border bg-secondary pl-10 pr-4 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none"
                    aria-hidden="true"
                  />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onInput={(e) => setPassword((e.target as HTMLInputElement).value)}
                    className="flex h-10 w-full rounded-lg border border-border bg-secondary pl-10 pr-10 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked === true)}
                    className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  <Label
                    htmlFor="remember"
                    className={`text-sm cursor-pointer transition-colors ${rememberMe ? "text-primary" : "text-muted-foreground"}`}
                  >
                    Remember me
                  </Label>
                </div>
                <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>

              <Button type="submit" className="w-full" disabled={loading} aria-label="Sign in to your Artha account">
                {loading ? "Signing in..." : "Sign In"}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-background px-4 text-muted-foreground">Or continue with</span>
                </div>
              </div>

              <Button
                variant="outline"
                type="button"
                className="w-full gap-2"
                onClick={handleGoogleLogin}
                disabled={oauthLoading !== null}
              >
                {oauthLoading === "google" ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                )}
                {oauthLoading === "google" ? "Signing in..." : "Continue with Google"}
              </Button>
            </form>

            {/* OAuth loading overlay */}
            {oauthLoading && (
              <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
                <div className="text-center space-y-4">
                  <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
                  <p className="text-foreground font-medium">Signing you in...</p>
                  <p className="text-muted-foreground text-sm">Please wait while we redirect you</p>
                </div>
              </div>
            )}

            <p className="text-center text-muted-foreground">
              Don't have an account?{" "}
              <Link to="/signup" className="text-primary hover:underline">
                Sign up
              </Link>
            </p>

            <p className="text-center text-xs text-muted-foreground">Need help signing in?</p>
          </div>
        </section>
      </main>
    </>
  );
}
