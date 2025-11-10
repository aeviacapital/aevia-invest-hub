import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { LogIn, UserPlus, ArrowLeft, Shield, RefreshCcw, Mail } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [otpStep, setOtpStep] = useState(false);
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [passwordCache, setPasswordCache] = useState('');
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetMessage, setResetMessage] = useState('');

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    invitationCode: '',
    referralCode: ''
  });

  const [timer, setTimer] = useState(180);
  const [canResend, setCanResend] = useState(false);

  const { signIn, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || '/dashboard';

  // 🔗 Your endpoints
  const EDGE_FUNCTION_SEND_OTP = 'https://niwhcvzhvjqrqhyayarv.supabase.co/functions/v1/send-otp';
  const EDGE_FUNCTION_RESEND_OTP = 'https://niwhcvzhvjqrqhyayarv.supabase.co/functions/v1/resend-otp';
  const EDGE_FUNCTION_PASSWORD_RESET = 'https://niwhcvzhvjqrqhyayarv.supabase.co/functions/v1/send-reset-password';

  useEffect(() => {
    if (user && !otpStep) navigate(from, { replace: true });

    const params = new URLSearchParams(location.search);
    const refCode = params.get('ref');
    if (refCode) setFormData(prev => ({ ...prev, referralCode: refCode }));
  }, [user, navigate, from, location, otpStep]);

  useEffect(() => {
    let countdown: any;
    if (otpStep && !canResend) {
      countdown = setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) {
            clearInterval(countdown);
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(countdown);
  }, [otpStep, canResend]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // ---------------- SIGN UP ----------------
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch(EDGE_FUNCTION_SEND_OTP, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Signup failed');

      setPasswordCache(formData.password);
      setOtpStep(true);
      setTimer(180);
      setCanResend(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // ---------------- VERIFY OTP ----------------
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch("https://aeviacapital.onrender.com/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          otp,
          email: formData.email,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || data.message || "Invalid or expired OTP");

      const { error } = await signIn(formData.email, passwordCache);
      if (error) throw new Error("Account verified, but auto-login failed.");

      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  // ♻️ RESEND OTP
  const handleResendOtp = async () => {
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch(EDGE_FUNCTION_RESEND_OTP, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to resend OTP");

      setTimer(180);
      setCanResend(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // ---------------- SIGN IN ----------------
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const { error } = await signIn(formData.email, formData.password);
    if (error) setError('Invalid email or password.');
    setIsLoading(false);
  };

  // ---------------- RESET PASSWORD ----------------
  const handleSendReset = async () => {
    setIsLoading(true);
    setResetMessage('');
    setError('');

    try {
      const res = await fetch(EDGE_FUNCTION_PASSWORD_RESET, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send reset email');

      setResetMessage('✅ Password reset link sent! Check your inbox.');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="mb-4 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          <h1 className="text-3xl font-bold text-gradient-primary mb-2">AeviaCapital</h1>
          <p className="text-muted-foreground">Access your investment platform</p>
        </div>

        <Card className="card-glass">
          <CardHeader className="text-center">
            <CardTitle>Welcome</CardTitle>
            <CardDescription>
              {otpStep ? 'Enter your verification code' : 'Sign in to your account or create a new one'}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {!otpStep ? (
              <Tabs defaultValue="signin" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="signin">Sign In</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>

                {/* Sign In */}
                <TabsContent value="signin">
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input name="email" type="email" placeholder="Enter your email"
                        value={formData.email} onChange={handleInputChange} required />
                    </div>
                    <div className="space-y-2">
                      <Label>Password</Label>
                      <Input name="password" type="password" placeholder="Enter your password"
                        value={formData.password} onChange={handleInputChange} required />
                    </div>
                    <div className="text-right">
                      <button
                        type="button"
                        onClick={() => setShowResetModal(true)}
                        className="text-xs text-blue-500 hover:underline"
                      >
                        Forgot password?
                      </button>
                    </div>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <Button type="submit" className="w-full btn-hero" disabled={isLoading}>
                      {isLoading ? 'Signing in...' : (<><LogIn className="w-4 h-4 mr-2" /> Sign In</>)}
                    </Button>
                  </form>
                </TabsContent>

                {/* Sign Up */}
                {/* (unchanged) */}
                <TabsContent value="signup">
<form onSubmit={handleSignUp} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Full Name</Label>
                      <Input name="fullName" type="text" placeholder="Enter your full name"
                        value={formData.fullName} onChange={handleInputChange} required />
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input name="email" type="email" placeholder="Enter your email"
                        value={formData.email} onChange={handleInputChange} required />
                    </div>
                    <div className="space-y-2">
                      <Label>Password</Label>
                      <Input name="password" type="password" placeholder="Create a password"
                        value={formData.password} onChange={handleInputChange} required />
                    </div>
                    <div className="space-y-2">
                      <Label>Invitation Code</Label>
                      <Input name="invitationCode" type="text" placeholder="Enter invitation code"
                        value={formData.invitationCode} onChange={handleInputChange} required />
                    </div>
                    <div className="space-y-2">
                      <Label>Referral Code (Optional)</Label>
                      <Input name="referralCode" type="text" placeholder="Enter referral code if you have one"
                        value={formData.referralCode} onChange={handleInputChange} />
                    </div>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <Button type="submit" className="w-full btn-hero" disabled={isLoading}>
                      {isLoading ? 'Creating account...' : (<><UserPlus className="w-4 h-4 mr-2" /> Create Account</>)}
                    </Button>
                  </form>
                  
                </TabsContent>
              </Tabs>
            ) : (
              // OTP Verification (unchanged)
              <form onSubmit={handleVerifyOtp} className="space-y-4 text-center">
<Shield className="mx-auto mb-2 text-yellow-500" size={32} />
                <p className="text-muted-foreground text-sm">
                  A verification code was sent to <span className="font-semibold">{formData.email}</span>.
                </p>

                <div className="space-y-2">
                  <Label>Enter OTP</Label>
                  <Input
                    name="otp"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="6-digit code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="text-center tracking-[0.3em] text-yellow-400"
                    required
                  />
                </div>

                {/* Timer or Resend */}
                {!canResend ? (
                  <p className="text-sm text-muted-foreground mt-2">
                    Code expires in <span className="font-semibold text-yellow-500">{formatTime(timer)}</span>
                  </p>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleResendOtp}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2"
                  >
                    <RefreshCcw size={16} />
                    Resend OTP
                  </Button>
                )}

                {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                <Button type="submit" className="w-full btn-hero mt-2" disabled={isLoading || otp.length !== 6}>
                  {isLoading ? 'Verifying...' : 'Verify & Continue'}
                </Button>
              
              </form>
            )}
          </CardContent>
        </Card>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>Need an invitation code? Contact your account manager.</p>
        </div>
      </div>

      {/* 🔒 Password Reset Modal */}
      <Dialog open={showResetModal} onOpenChange={setShowResetModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Password Reset</DialogTitle>
            <DialogDescription>Enter your email to receive a password reset link.</DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <Label>Email</Label>
            <Input
              type="email"
              placeholder="Enter your email"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            {resetMessage && <p className="text-green-500 text-sm">{resetMessage}</p>}
          </div>

          <DialogFooter>
            <Button onClick={handleSendReset} disabled={isLoading || !resetEmail}>
              {isLoading ? 'Sending...' : (<><Mail className="w-4 h-4 mr-2" /> Send Link</>)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Auth;

