import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useOAuth } from "@/hooks/useOAuth";
import { Zap, Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { SEOHead } from "@/components/seo/SEOHead";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true); // Default to true for better retention
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { oauthLoading, signInWithOAuth } = useOAuth();

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
      sessionStorage.setItem('papr_session_only', 'true');
    } else {
      sessionStorage.removeItem('papr_session_only');
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
      sessionStorage.setItem('papr_session_only', 'true');
    } else {
      sessionStorage.removeItem('papr_session_only');
    }
    signInWithOAuth("google");
  };

  return (
    <>
      <SEOHead 
        title="Login" 
        description="Sign in to Papr to manage your creative business. Access your proposals, invoices, and client management dashboard."
        canonical="https://papr.app/login"
      />
      <main className="min-h-screen bg-background flex">
        {/* Left Panel - Branding */}
        <aside className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-background via-card to-background p-12 flex-col justify-between border-r border-border">
          <header className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center glow-primary" role="img" aria-label="Papr logo">
              <Zap className="w-6 h-6 text-primary-foreground" aria-hidden="true" />
            </div>
            <span className="text-xl font-semibold text-foreground">Papr</span>
          </header>
          <section className="space-y-4">
            <h1 className="text-4xl font-bold text-foreground">
              Manage your business
              <br />
              <span className="gradient-text">with confidence.</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-md">
              Streamline invoices, proposals, and client management all in one place.
            </p>
          </section>
          <footer className="text-muted-foreground text-sm">© 2025 Papr. All rights reserved.</footer>
        </aside>

        {/* Right Panel - Login Form */}
        <section className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-md space-y-8">
            <div className="text-center lg:text-left">
              <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center glow-primary" role="img" aria-label="Papr logo">
                  <Zap className="w-6 h-6 text-primary-foreground" aria-hidden="true" />
                </div>
                <span className="text-xl font-black text-foreground tracking-tight">Papr</span>
              </div>
              <h2 className="text-2xl font-bold text-foreground">Welcome back</h2>
              <p className="text-muted-foreground mt-2">Access your creative dashboard</p>
            </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
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
                  className={`text-sm cursor-pointer transition-colors ${rememberMe ? 'text-primary' : 'text-muted-foreground'}`}
                >
                  Remember me
                </Label>
              </div>
              <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                Forgot password?
              </Link>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
              aria-label="Sign in to your Papr account"
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

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
