import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  Sparkles, 
  Building2, 
  FileText, 
  BarChart3, 
  ChevronRight, 
  ChevronLeft, 
  Check 
} from "lucide-react";

const steps = [
  {
    id: 1,
    icon: Sparkles,
    title: "Welcome to Artha",
    description: "Your professional workspace for freelance success. Experience the Electric Cyan aesthetic designed to make your business stand out.",
    highlight: "Create stunning invoices and proposals in minutes",
  },
  {
    id: 2,
    icon: Building2,
    title: "Set Up Your Business Profile",
    description: "Configure your business details once, and they'll automatically sync to every invoice and proposal you create.",
    highlight: "Logo, address, and payment details — all in one place",
    action: { label: "Go to Settings", path: "/settings" },
  },
  {
    id: 3,
    icon: FileText,
    title: "Premium Proposal Builder",
    description: "Create visually stunning proposals with our professional templates. Your bids will look like they came from a top agency.",
    highlight: "Bold typography and premium layouts included",
    action: { label: "Create Proposal", path: "/proposals/new" },
  },
  {
    id: 4,
    icon: BarChart3,
    title: "Dashboard Intelligence",
    description: "Track your freelance growth with real-time metrics. Monitor your pipeline value, acceptance rate, and earnings at a glance.",
    highlight: "Data-driven insights for smarter decisions",
  },
];

export function OnboardingTour() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("has_completed_onboarding")
        .eq("id", user.id)
        .single();

      if (profile && !profile.has_completed_onboarding) {
        setIsOpen(true);
      }
    } catch (error) {
      console.error("Error checking onboarding status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const completeOnboarding = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from("profiles")
        .update({ has_completed_onboarding: true })
        .eq("id", user.id);
    } catch (error) {
      console.error("Error completing onboarding:", error);
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    await completeOnboarding();
    setIsOpen(false);
  };

  const handleSkip = async () => {
    await completeOnboarding();
    setIsOpen(false);
  };

  const handleAction = (path: string) => {
    completeOnboarding();
    setIsOpen(false);
    navigate(path);
  };

  if (isLoading) return null;

  const step = steps[currentStep];
  const StepIcon = step.icon;
  const isLastStep = currentStep === steps.length - 1;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-card border-border">
        {/* Progress bar */}
        <div className="h-1 bg-muted">
          <div 
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>

        <div className="p-6">
          {/* Icon */}
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 mx-auto">
            <StepIcon className="w-8 h-8 text-primary" />
          </div>

          <DialogHeader className="text-center">
            <DialogTitle className="text-xl font-bold text-foreground">
              {step.title}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground mt-2">
              {step.description}
            </DialogDescription>
          </DialogHeader>

          {/* Highlight box */}
          <div className="mt-6 p-4 rounded-lg bg-primary/5 border border-primary/20">
            <p className="text-sm font-medium text-primary text-center">
              {step.highlight}
            </p>
          </div>

          {/* Action button if available */}
          {step.action && (
            <Button
              variant="outline"
              className="w-full mt-4 border-primary/30 text-primary hover:bg-primary/10"
              onClick={() => handleAction(step.action!.path)}
            >
              {step.action.label}
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkip}
              className="text-muted-foreground"
            >
              Skip tour
            </Button>

            <div className="flex items-center gap-2">
              {/* Step indicators */}
              <div className="flex gap-1.5 mr-4">
                {steps.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentStep(index)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentStep 
                        ? "bg-primary" 
                        : index < currentStep 
                          ? "bg-primary/50" 
                          : "bg-muted-foreground/30"
                    }`}
                  />
                ))}
              </div>

              {currentStep > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrev}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
              )}

              <Button size="sm" onClick={handleNext}>
                {isLastStep ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Get Started
                  </>
                ) : (
                  <>
                    Next
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
