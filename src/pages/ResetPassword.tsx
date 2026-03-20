import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes("type=recovery") || hash.includes("access_token")) {
      setReady(true);
    }
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setReady(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => navigate("/login", { replace: true }), 3000);
      return () => clearTimeout(timer);
    }
  }, [success, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) { setError("Password must be at least 8 characters"); return; }
    if (password !== confirmPassword) { setError("Passwords do not match"); return; }
    setError("");
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) { setError(error.message); return; }
    setSuccess(true);
  };

  if (!ready) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4 py-12">
        <div className="w-full max-w-[420px] rounded-2xl border bg-card p-8 shadow-sm text-center space-y-4">
          <h1 className="text-2xl font-heading font-bold text-foreground">Invalid or expired link</h1>
          <p className="text-sm text-muted-foreground">Please request a new password reset.</p>
          <Link to="/forgot-password" className="inline-block text-sm text-primary font-medium hover:underline">
            Request new link
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4 py-12">
        <div className="w-full max-w-[420px] rounded-2xl border bg-card p-8 shadow-sm text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10">
            <CheckCircle2 className="h-10 w-10 text-accent" />
          </div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Password updated!</h1>
          <p className="text-sm text-muted-foreground">You can now sign in with your new password.</p>
          <p className="text-xs text-muted-foreground">Redirecting to sign in in 3 seconds…</p>
          <Link to="/login" className="inline-block text-sm text-primary font-medium hover:underline">
            Go to sign in now
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-[420px] rounded-2xl border bg-card p-8 shadow-sm space-y-6">
        <Link to="/" className="flex justify-center">
          <img
            src="https://lmgpuqgwkiapgpdsxvmb.supabase.co/storage/v1/object/public/assets/Gemini_Generated_Image_at7c4zat7c4zat7c.png"
            alt="Movability"
            className="h-12 w-auto rounded-lg p-0.5 bg-background dark:invert dark:hue-rotate-180"
          />
        </Link>
        <div className="text-center">
          <h1 className="text-2xl font-heading font-bold text-foreground">Set new password</h1>
          <p className="text-sm text-muted-foreground mt-1">Enter your new password below</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="password">New Password</Label>
            <div className="relative">
              <Input id="password" type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Min 8 characters" />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div>
            <Label htmlFor="confirm-password">Confirm Password</Label>
            <div className="relative">
              <Input id="confirm-password" type={showConfirmPw ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required placeholder="Re-enter password" />
              <button type="button" onClick={() => setShowConfirmPw(!showConfirmPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showConfirmPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" className="w-full h-11" disabled={loading}>
            {loading ? "Updating…" : "Update Password"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
