import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useNavigate } from "react-router-dom";
import { UserIcon, ArrowRightIcon } from "lucide-react";
import fitnessBg from "@/assets/fitness-bg.jpg";
import fitnessLogo from "@/assets/fitness-logo.png";
import api from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/components/page/Trainer/AuthContext";

const SignIn = () => {
  const [isLogin, setIsLogin] = useState(true); // Default to Login
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { checkAuth } = useAuth(); // Retrieve checkAuth to update state after login

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        // --- LOGIN LOGIC ---
        // Send email/password to Backend
        await api.post("http://localhost:8080/auth/login", {
          email,
          password,
        });

        toast.success("เข้าสู่ระบบสำเร็จ");

        // After login, re-check auth status to update context/user
        await checkAuth();

        // Navigate based on role (handled by PublicRoute/AuthContext usually,
        // but we can force check here or just let the router redirect)
        // ideally checkAuth updates 'user' and the router guard redirects
        // but to be safe/fast:
        // navigate("/trainer/dashboard"); // Let the guard handle direction
      } else {
        // --- REGISTER LOGIC ---
        // Adjust payload to match your backend expectations
        await api.post("http://localhost:8080/auth/register", {
          username: email.split("@")[0], // Simple username generation
          firstName: firstName,
          lastName: lastName,
          email,
          password,
          role: "trainer", // Default to trainer or make selectable
        });

        toast.success("สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบ");
        setIsLogin(true); // Switch to login view
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      const msg = err.response?.data?.error || "เกิดข้อผิดพลาด กรุณาลองใหม่";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGuestAccess = () => {
    // If you have a guest mode
    navigate("/");
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Brand */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${fitnessBg})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/80 to-accent/90" />

        <div className="relative z-10 flex flex-col justify-between p-12 text-primary-foreground w-full">
          <div className="flex items-center gap-3">
            <img src={fitnessLogo} alt="FitPro Logo" className="h-12 w-12" />
            <div>
              <h2 className="text-2xl font-bold">FitPro Trainer</h2>
              <p className="text-sm text-primary-foreground/80">
                Personal Training Platform
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h1 className="text-5xl font-bold leading-tight">
              Transform Your
              <br />
              Fitness Journey
            </h1>
            <p className="text-xl text-primary-foreground/90">
              Connect with expert trainers and achieve your goals
            </p>
          </div>

          <div className="flex items-center gap-2 text-sm text-primary-foreground/70">
            <UserIcon className="h-4 w-4" />
            <button
              onClick={handleGuestAccess}
              className="hover:text-primary-foreground transition-colors underline"
            >
              Enter website as guest
            </button>
            <ArrowRightIcon className="h-4 w-4" />
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-muted/30">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-4xl font-bold text-foreground">
              {isLogin ? "Welcome Back" : "Create an account"}
            </h2>
            <p className="text-muted-foreground">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-accent hover:text-accent/80 font-medium transition-colors"
              >
                {isLogin ? "Sign Up" : "Log In"}
              </button>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="grid grid-cols-2 gap-4">
                <Input
                  type="text"
                  placeholder="First name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="bg-background border-border"
                  required
                />
                <Input
                  type="text"
                  placeholder="Last name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="bg-background border-border"
                  required
                />
              </div>
            )}

            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-background border-border"
              required
            />

            <Input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-background border-border"
              required
            />

            {!isLogin && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="terms"
                  checked={agreeToTerms}
                  onCheckedChange={(checked) =>
                    setAgreeToTerms(checked as boolean)
                  }
                  className="border-border"
                />
                <label
                  htmlFor="terms"
                  className="text-sm text-muted-foreground leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  I agree to the terms and conditions.
                </label>
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold py-6 text-lg"
              disabled={loading || (!isLogin && !agreeToTerms)}
            >
              {loading
                ? "Processing..."
                : isLogin
                ? "Log In"
                : "Create Account"}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-muted/30 px-2 text-muted-foreground">
                  or register with
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                type="button"
                variant="outline"
                className="w-full bg-background hover:bg-muted/50 border-border py-6"
                onClick={() => {
                  window.location.href =
                    "http://localhost:8080/auth/google/login";
                }}
              >
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
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
                Continue with Google
              </Button>
            </div>
          </form>

          {/* Mobile Guest Access */}
          <div className="lg:hidden text-center">
            <button
              onClick={handleGuestAccess}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-2 mx-auto"
            >
              <UserIcon className="h-4 w-4" />
              <span className="underline">Enter website as guest</span>
              <ArrowRightIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
