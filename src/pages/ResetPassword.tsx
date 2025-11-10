import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, ShieldCheck } from "lucide-react";

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Read token & email from URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setEmail(params.get("email") || "");
    setToken(params.get("token") || "");
  }, [location]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setMessage("");

    if (password !== confirm) {
      setError("Passwords do not match.");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("https://niwhcvzhvjqrqhyayarv.supabase.co/functions/v1/reset-password-confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");

      setMessage("✅ Password updated successfully! Redirecting...");
      setTimeout(() => navigate("/auth"), 2500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] text-white p-4">
      <Card className="w-full max-w-md bg-[#121212] border border-[#2e2e2e] shadow-lg">
        <CardHeader className="text-center">
          <ShieldCheck className="mx-auto text-yellow-500 mb-2" size={36} />
          <CardTitle className="text-2xl font-bold text-yellow-400">
            Reset Password
          </CardTitle>
          <CardDescription className="text-gray-400">
            Enter your new password below to secure your account.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <Label className="text-gray-300">New Password</Label>
              <Input
                type="password"
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-[#1a1a1a] text-white border border-[#333] focus:border-yellow-400"
              />
            </div>
            <div>
              <Label className="text-gray-300">Confirm Password</Label>
              <Input
                type="password"
                placeholder="Confirm new password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                className="bg-[#1a1a1a] text-white border border-[#333] focus:border-green-400"
              />
            </div>

            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            {message && <p className="text-green-400 text-sm text-center">{message}</p>}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
            >
              {isLoading ? "Updating..." : (<><Lock className="w-4 h-4 mr-2" /> Update Password</>)}
            </Button>

            <p className="text-center text-sm text-gray-500 mt-3">
              Remember your password?{" "}
              <span
                onClick={() => navigate("/auth")}
                className="text-yellow-400 hover:underline cursor-pointer"
              >
                Go to Login
              </span>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
export default ResetPassword;

