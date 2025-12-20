import { useParams } from "react-router-dom";
import { Zap } from "lucide-react";

export default function GuestPayment() {
  const { token } = useParams<{ token: string }>();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border py-4 px-6">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Zap className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-semibold text-foreground">Kalaudra Studio</span>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto p-6">
        <div className="glass-card rounded-2xl p-8 min-h-[400px] flex items-center justify-center">
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">Payment token: {token}</p>
            <p className="text-muted-foreground">Payment page content will be added here</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6 px-6 mt-auto">
        <div className="max-w-4xl mx-auto text-center text-muted-foreground text-sm">
          © 2024 Kalaudra Studio. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
