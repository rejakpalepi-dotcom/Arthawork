import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Mail, ArrowLeft, Loader2, CheckCircle } from "lucide-react";
import { SEOHead } from "@/components/seo/SEOHead";
import { z } from "zod";
import arthaLogo from "@/assets/paprwork-logo.png";

const emailSchema = z.string().email("Please enter a valid email address");

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate email
    const result = emailSchema.safeParse(email);
    if (!result.success) {
      toast.error(result.error.errors[0].message);
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    });

    if (error) {
      toast.error(error.message);
    } else {
      setSent(true);
      toast.success("Password reset link sent to your email!");
    }

    setLoading(false);
  };

  return (
    <>
      <SEOHead 
        title="Forgot Password" 
        description="Reset your Artha account password. Enter your email to receive a password reset link."
        canonical="https://artha.app/forgot-password"
        noIndex
      />
      <main className="min-h-screen bg-background flex">
        {/* Left Panel - Branding */}
        <aside className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-background via-card to-background p-12 flex-col justify-between border-r border-border">
          <header className="flex items-center gap-3">
            <img src={arthaLogo} alt="Artha" className="h-10 w-10 object-contain" />
            <span className="text-xl font-bold text-foreground tracking-tight">Artha</span>
          </header>
          <section className="space-y-4">
            <h1 className="text-4xl font-bold text-foreground">
              Forgot your password?
              <br />
              <span className="gradient-text">No worries.</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-md">
              Enter your email and we'll send you a link to reset your password.
            </p>
          </section>
          <footer className="text-muted-foreground text-sm">© 2025 Artha. All rights reserved.</footer>
        </aside>

        {/* Right Panel - Reset Form */}
        <section className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-md space-y-8">
            <div className="text-center lg:text-left">
              <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
                <img src={arthaLogo} alt="Artha" className="h-10 w-10 object-contain" />
                <span className="text-xl font-bold text-foreground tracking-tight">Artha</span>
              </div>
              <h2 className="text-2xl font-bold text-foreground">Reset Password</h2>
              <p className="text-muted-foreground mt-2">Enter your email to receive a reset link</p>
            </div>

            {sent ? (
              <div className="space-y-6 text-center">
                <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-foreground">Check your email</h3>
                  <p className="text-muted-foreground">
                    We've sent a password reset link to <span className="text-primary font-medium">{email}</span>
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">
                  Didn't receive the email? Check your spam folder or{" "}
                  <button 
                    onClick={() => setSent(false)} 
                    className="text-primary hover:underline"
                  >
                    try again
                  </button>
                </p>
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-6">
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

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loading}
                  aria-label="Send password reset link"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send Reset Link"
                  )}
                </Button>
              </form>
            )}

            <Link 
              to="/login" 
              className="flex items-center justify-center gap-2 text-primary hover:underline"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to login
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
