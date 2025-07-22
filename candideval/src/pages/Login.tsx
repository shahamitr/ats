import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../modules/Auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'password' | 'otp'>('password');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      let res;
      if (mode === 'password') {
        res = await axios.post('/api/auth/login', { email, password });
      } else {
        res = await axios.post('/api/auth/login', { email, otp });
      }
      login(res.data.user);
      localStorage.setItem('token', res.data.token);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  const handleSendOtp = async () => {
    setError('');
    try {
      await axios.post('/api/auth/send-otp', { email });
      setOtpSent(true);
      setMode('otp');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to send OTP');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-sm">
        <form onSubmit={handleLogin}>
          <CardHeader>
            <CardTitle className="text-2xl">Login</CardTitle>
            <CardDescription>Enter your credentials to access your account.</CardDescription>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="m@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            {mode === 'password' ? (
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
              </div>
            ) : (
              <div className="grid gap-2">
                <Label htmlFor="otp">OTP</Label>
                <Input id="otp" type="text" value={otp} onChange={e => setOtp(e.target.value)} required />
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            {mode === 'password' ? (
              <>
                <Button type="submit" className="w-full">Login with Password</Button>
                <Button type="button" variant="outline" className="w-full" onClick={handleSendOtp} disabled={!email}>
                  {otpSent ? 'Resend OTP' : 'Login with OTP'}
                </Button>
              </>
            ) : (
              <>
                <Button type="submit" className="w-full">Login with OTP</Button>
                <Button
                  type="button"
                  variant="link"
                  className="w-full"
                  onClick={() => setMode('password')}
                >
                  Back to Password Login
                </Button>
              </>
            )}
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default Login;
