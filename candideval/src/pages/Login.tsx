import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../modules/Auth/AuthContext';

const Login: React.FC = () => {
  const { login } = useAuth();
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
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <form onSubmit={handleLogin} className="bg-white dark:bg-gray-800 p-8 rounded shadow w-96">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Login</h2>
        {error && <div className="text-red-500 mb-4">{error}</div>}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full mb-4 p-2 border rounded dark:bg-gray-700 dark:text-white"
          required
        />
        {mode === 'password' ? (
          <>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full mb-4 p-2 border rounded dark:bg-gray-700 dark:text-white"
              required
            />
            <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 mb-2">Login with Password</button>
            <button
              type="button"
              className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
              onClick={handleSendOtp}
              disabled={!email}
            >
              {otpSent ? 'Resend OTP' : 'Login with OTP'}
            </button>
          </>
        ) : (
          <>
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={e => setOtp(e.target.value)}
              className="w-full mb-4 p-2 border rounded dark:bg-gray-700 dark:text-white"
              required
            />
            <button type="submit" className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 mb-2">Login with OTP</button>
            <button
              type="button"
              className="w-full bg-gray-400 text-white py-2 rounded hover:bg-gray-500"
              onClick={() => setMode('password')}
            >
              Back to Password Login
            </button>
          </>
        )}
      </form>
    </div>
  );
};

export default Login;
