import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { LogIn, UserPlus, ArrowLeft, Shield } from 'lucide-react';

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [otpStep, setOtpStep] = useState(false);
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    invitationCode: '',
    referralCode: ''
  });

  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const EDGE_FUNCTION_URL = 'https://niwhcvzhvjqrqhyayarv.supabase.co/functions/v1/send-otp'; 
  
  // Proposed Change
useEffect(() => {
  // Only navigate if the user is present AND we are NOT in the OTP step
  // This prevents the redirect from cancelling the 2FA flow.
  if (user && !otpStep) { 
    navigate(from, { replace: true });
  }
  const params = new URLSearchParams(location.search);
  const refCode = params.get('ref');
  if (refCode) setFormData(prev => ({ ...prev, referralCode: refCode }));
}, [user, navigate, from, location, otpStep]); // Add otpStep to dependency array

   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // ---------------- SIGN IN + SEND OTP ----------------
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const { error } = await signIn(formData.email, formData.password);
    if (error) {
      console.error('Sign in error:', error);
      setError('Invalid credentials.');
      setIsLoading(false);
      return;
    }

    // Trigger 2FA OTP
    try {
      const res = await fetch(EDGE_FUNCTION_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, action: 'send_otp' })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send OTP');
      setOtpStep(true);
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
      const res = await fetch(EDGE_FUNCTION_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, otp, action: 'verify_otp' })
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Invalid or expired OTP');
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // ---------------- SIGN UP ----------------
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const { error } = await signUp(
      formData.email,
      formData.password,
      formData.fullName,
      formData.invitationCode,
      formData.referralCode
    );
    if (error) console.error('Sign up error:', error);
    setIsLoading(false);
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
                      <Label htmlFor="signin-email">Email</Label>
                      <Input
                        id="signin-email"
                        name="email"
                        type="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signin-password">Password</Label>
                      <Input
                        id="signin-password"
                        name="password"
                        type="password"
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <Button type="submit" className="w-full btn-hero" disabled={isLoading}>
                      {isLoading ? 'Signing in...' : (<><LogIn className="w-4 h-4 mr-2" /> Sign In</>)}
                    </Button>
                  </form>
                </TabsContent>

                {/* Sign Up */}
                <TabsContent value="signup">
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-name">Full Name</Label>
                      <Input id="signup-name" name="fullName" type="text" placeholder="Enter your full name"
                        value={formData.fullName} onChange={handleInputChange} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <Input id="signup-email" name="email" type="email" placeholder="Enter your email"
                        value={formData.email} onChange={handleInputChange} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <Input id="signup-password" name="password" type="password" placeholder="Create a password"
                        value={formData.password} onChange={handleInputChange} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="invitation-code">Invitation Code</Label>
                      <Input id="invitation-code" name="invitationCode" type="text" placeholder="Enter invitation code"
                        value={formData.invitationCode} onChange={handleInputChange} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="referral-code">Referral Code (Optional)</Label>
                      <Input id="referral-code" name="referralCode" type="text" placeholder="Enter referral code if you have one"
                        value={formData.referralCode} onChange={handleInputChange} />
                    </div>
                    <Button type="submit" className="w-full btn-hero" disabled={isLoading}>
                      {isLoading ? 'Creating account...' : (<><UserPlus className="w-4 h-4 mr-2" /> Create Account</>)}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            ) : (
              // OTP VERIFICATION
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="text-center">
                  <Shield className="mx-auto mb-2 text-yellow-500" size={32} />
                  <p className="text-muted-foreground text-sm">
                    A verification code was sent to <span className="font-semibold">{formData.email}</span>.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="otp">Enter OTP</Label>
                  <Input
                    id="otp"
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
                {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                <Button type="submit" className="w-full btn-hero" disabled={isLoading || otp.length !== 6}>
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
    </div>
  );
};

export default Auth;

