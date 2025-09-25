import React, { useState } from 'react';
import { Mail, Lock } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';

type LoginPayload = { name: string; email: string };

type Props = {
  onLogin: (user: LoginPayload) => void;
  onClose: () => void;
};

const LoginPage: React.FC<Props> = ({ onLogin, onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // useGoogleLogin opens a popup and returns an access_token on success
  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse: any) => {
      try {
        // tokenResponse.access_token is returned in implicit flow
        const accessToken = tokenResponse?.access_token;
        if (!accessToken) throw new Error('No access token from Google');

        // Fetch profile from Google Userinfo endpoint
        const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (!res.ok) throw new Error('Failed to fetch Google profile');

        const profile = await res.json();
        const name = profile.name || profile.email?.split('@')[0] || 'Google User';
        onLogin({ name, email: profile.email });
      } catch (err: any) {
        console.error(err);
        setError(err?.message || 'Google login failed');
      } finally {
        setLoading(false);
      }
    },
    onError: (err) => {
      console.error('Google login error', err);
      setError('Google sign-in was cancelled or failed');
      setLoading(false);
    },
    flow: 'implicit', // keep the popup implicit flow so we get an access_token
    // If you need server-side tokens, use 'auth-code' and exchange code on server
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Simulate async login (replace with your real API call)
      await new Promise((res) => setTimeout(res, 700));
      const name = email.split('@')[0] || 'User';
      onLogin({ name: name.charAt(0).toUpperCase() + name.slice(1), email });
    } catch (err: any) {
      console.error(err);
      setError('Sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = () => {
    setError(null);
    setLoading(true);
    try {
      loginWithGoogle(); // triggers popup; onSuccess/onError handle rest
    } catch (err) {
      console.error(err);
      setError('Failed to start Google sign-in');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden
      />
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-500 hover:text-slate-700"
          aria-label="Close"
        >
          ✕
        </button>

        {/* Circular logo */}
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-md border border-gray-100 -mt-10">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C7.582 2 4 5.582 4 10s3.582 8 8 8 8-3.582 8-8-3.582-8-8-8z" stroke="#2b6cb0" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M8 12s1.5-3 4-3 4 3 4 3" stroke="#2b6cb0" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>

        <div className="pt-6 text-center">
          <h1 className="text-2xl font-semibold text-slate-800">Welcome to <span className="font-extrabold tracking-wide">SAGITTARIUS</span></h1>
          <p className="text-sm text-slate-500 mt-2">Sign in to continue</p>
        </div>

        <div className="mt-6">
          <button
            type="button"
            onClick={handleGoogle}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3 rounded-lg border border-gray-200 hover:shadow-sm transition disabled:opacity-60"
          >
            <svg className="w-5 h-5" viewBox="0 0 533.5 544.3" xmlns="http://www.w3.org/2000/svg">
              <path d="M533.5 278.4c0-18.6-1.6-37-4.9-54.8H272v103.8h147.2c-6.4 34.7-25.6 64.1-54.5 83.7v69.6h87.8c51.4-47.4 81-117.2 81-202.3z" fill="#4285F4"/>
              <path d="M272 544.3c73.6 0 135.5-24.3 180.7-66.1l-87.8-69.6c-24.4 16.4-55.6 26-92.9 26-71.4 0-132-48.1-153.6-112.7H28.3v70.9C73.5 487.9 166 544.3 272 544.3z" fill="#34A853"/>
              <path d="M118.4 325.9c-10.7-31.9-10.7-66.3 0-98.2V156.8H28.3c-39.9 79.7-39.9 174.1 0 253.9l90.1-84.8z" fill="#FBBC05"/>
              <path d="M272 107.7c39.9 0 75.8 13.8 104 40.8l78-78C403.4 24.6 341.5 0 272 0 166 0 73.5 56.4 28.3 141.1l90.1 70.5C140 155.8 200.6 107.7 272 107.7z" fill="#EA4335"/>
            </svg>
            <span className="text-sm font-medium text-slate-700">{loading ? 'Signing in...' : 'Continue with Google'}</span>
          </button>

          <div className="flex items-center gap-4 mt-6">
            <div className="flex-1 h-px bg-gray-200" />
            <div className="text-xs text-slate-400 uppercase">or</div>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <label className="block relative">
              <span className="sr-only">Email</span>
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <Mail className="w-4 h-4 text-slate-400" />
              </div>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="you@example.com"
                required
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
              />
            </label>

            <label className="block relative">
              <span className="sr-only">Password</span>
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <Lock className="w-4 h-4 text-slate-400" />
              </div>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                placeholder="••••••••"
                required
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
              />
            </label>

            <button type="submit" disabled={loading} className="w-full py-3 rounded-xl bg-slate-900 text-white font-medium hover:opacity-95 transition disabled:opacity-60">
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          {error && <div className="mt-3 text-sm text-red-600">{error}</div>}

          <div className="mt-4 flex items-center justify-between text-sm">
            <a href="#" className="text-slate-500 hover:text-slate-700">Forgot password?</a>
            <div className="text-slate-500">Need an account? <a href="#" className="text-slate-900 font-medium">Sign up</a></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
