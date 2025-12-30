import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useOAuth } from "@/hooks/useOAuth";
import { Mail, Lock, Eye, EyeOff, ArrowRight, CheckCircle, Loader2 } from "lucide-react";
import { z } from "zod";
import { SEOHead } from "@/components/seo/SEOHead";
const arthaLogo = "/icon-512.png";

// Common password patterns to block (simplified entropy check)
const COMMON_PASSWORDS = [
  "password123", "123456789", "qwerty123", "letmein123", "welcome123",
  "admin123", "password1", "12345678", "iloveyou", "sunshine"
];

const signupSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string()
    .min(10, "Password must be at least 10 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[!@#$%^&*(),.?":{}|<>]/, "Password must contain at least one symbol")
    .refine(
      (password) => !COMMON_PASSWORDS.some(common =>
        password.toLowerCase().includes(common.toLowerCase())
      ),
      "Password is too common. Please choose a stronger password."
    ),
});

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const navigate = useNavigate();
  const { toast } = useToast();
  const { oauthLoading, signInWithOAuth } = useOAuth();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          navigate("/dashboard", { replace: true });
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        navigate("/dashboard", { replace: true });
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const validateForm = () => {
    try {
      signupSchema.parse({ email, password });
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: { email?: string; password?: string } = {};
        error.errors.forEach((err) => {
          if (err.path[0] === "email") fieldErrors.email = err.message;
          if (err.path[0] === "password") fieldErrors.password = err.message;
        });
        setErrors(fieldErrors);
      }
      return false;
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    if (!agreedToTerms) {
      toast({
        title: "Terms Required",
        description: "Please agree to the Terms of Service and Privacy Policy.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
      },
    });

    if (error) {
      toast({
        title: "Sign Up Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Account Created!",
        description: "Welcome to Artha.",
      });
      navigate("/dashboard", { replace: true });
    }

    setLoading(false);
  };

  const passwordRequirements = [
    { met: password.length >= 10, text: "10+ characters" },
    { met: /[A-Z]/.test(password), text: "Uppercase" },
    { met: /[a-z]/.test(password), text: "Lowercase" },
    { met: /[0-9]/.test(password), text: "Number" },
    { met: /[!@#$%^&*(),.?":{}|<>]/.test(password), text: "Symbol" },
  ];

  return (
    <>
      <SEOHead
        title="Sign Up"
        description="Create your free Artha account. Start managing proposals, invoices, and clients in minutes. Built for creative professionals."
        canonical="https://artha.app/signup"
      />
      <main className="min-h-screen bg-background flex">
        {/* Left Panel - Branding */}
        <aside className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-background via-card to-background p-12 flex-col justify-between border-r border-border">
          <header className="flex items-center">
            <div className="flex items-center gap-3">
              <img src={arthaLogo} alt="Artha" className="h-10 w-10 object-contain rounded-lg" />
              <span className="text-xl font-bold text-foreground tracking-tight">Artha</span>
            </div>
          </header>

          <section className="space-y-6">
            <h1 className="text-4xl font-bold text-foreground">
              Buat Invoice & Proposal{" "}
              <span className="gradient-text">Profesional.</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-md">
              Platform lengkap untuk freelancer Indonesia. Kelola klien, buat dokumen menarik, dan terima pembayaran dengan mudah.
            </p>
          </section>

          <footer className="text-muted-foreground text-sm">
            © 2025 Artha. All rights reserved.
          </footer>
        </aside>

        {/* Right Panel - Signup Form */}
        <section className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-md space-y-8">
            <div className="flex items-center justify-between lg:hidden mb-8">
              <div className="flex items-center gap-3">
                <img src={arthaLogo} alt="Artha" className="h-10 w-10 object-contain" />
                <span className="text-xl font-bold text-foreground tracking-tight">Artha</span>
              </div>
              <Link to="/login">
                <Button variant="outline" size="sm" aria-label="Log in to existing account">Log In</Button>
              </Link>
            </div>

            <div className="hidden lg:flex justify-end">
              <p className="text-muted-foreground text-sm">
                Already a member?{" "}
                <Link to="/login" className="text-primary hover:underline font-medium">
                  Log In
                </Link>
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-foreground">Buat Akun</h2>
              <p className="text-muted-foreground mt-2">Daftar gratis dan mulai kelola bisnis</p>
            </div>

            <form onSubmit={handleSignup} className="space-y-5">
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
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Create Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
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
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password}</p>
                )}
                <div className="flex flex-wrap gap-2 mt-2">
                  {passwordRequirements.map((req, index) => (
                    <span
                      key={index}
                      className={`text-xs px-2 py-1 rounded-full ${req.met
                        ? "bg-success/20 text-success"
                        : "bg-muted text-muted-foreground"
                        }`}
                    >
                      {req.text}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Checkbox
                  id="terms"
                  checked={agreedToTerms}
                  onCheckedChange={(checked) => setAgreedToTerms(checked === true)}
                  className="mt-0.5"
                />
                <Label htmlFor="terms" className="text-sm text-muted-foreground cursor-pointer leading-snug">
                  Saya setuju dengan{" "}
                  <Link to="/terms" className="text-primary hover:underline">Syarat & Ketentuan</Link>
                  {" "}dan{" "}
                  <Link to="/privacy" className="text-primary hover:underline">Kebijakan Privasi</Link>.
                </Label>
              </div>

              <Button type="submit" className="w-full gap-2" disabled={loading}>
                {loading ? "Membuat Akun..." : "Daftar dengan Email"}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </form>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-background px-4 text-muted-foreground">atau</span>
              </div>
            </div>

            {/* Google OAuth Button */}
            <Button
              variant="outline"
              type="button"
              className="w-full gap-3 h-11"
              onClick={() => signInWithOAuth("google")}
              disabled={oauthLoading !== null}
            >
              {oauthLoading === "google" ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
              )}
              {oauthLoading === "google" ? "Signing in..." : "Lanjutkan dengan Google"}
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

            <p className="text-center text-xs text-muted-foreground">
              Butuh bantuan?{" "}
              <a href="https://wa.me/6281285864059" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Hubungi Support</a>
            </p>
          </div>
        </section>
      </main>
    </>
  );
}
