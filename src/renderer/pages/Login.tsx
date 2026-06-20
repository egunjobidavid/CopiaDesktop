import { useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { RegisterForm } from './RegisterForm';
import api from '../api/client';
import toast from 'react-hot-toast';

export function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const login = useAuthStore((s) => s.login);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const [mode, setMode] = useState<'login' | 'register' | 'forgot' | 'reset'>(() => {
    if (searchParams.get('token')) return 'register';
    if (searchParams.get('reset')) return 'reset';
    return 'login';
  });
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [resetToken, setResetToken] = useState(searchParams.get('reset') || '');
  const [newPassword, setNewPassword] = useState('');
  const [resetSent, setResetSent] = useState(false);

  if (isAuthenticated && mode === 'login') {
    navigate('/dashboard', { replace: true });
    return null;
  }

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!email || !password) {
        toast.error('Please enter email and password');
        return;
      }
      setIsLoading(true);
      try {
        await login(email, password);
        toast.success('Welcome back!');
        navigate('/dashboard', { replace: true });
      } catch (error: any) {
        const message = error?.response?.data?.message || 'Login failed. Please check your credentials.';
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    },
    [email, password, login, navigate],
  );

  const handleForgot = async () => {
    if (!email) { toast.error('Enter your email'); return; }
    setIsLoading(true);
    try {
      await api.post('/auth/forgot-password', { email }, { timeout: 10000 });
      setResetSent(true);
      toast.success('Check your email for the password reset link');
    } catch (err: any) {
      setResetSent(true);
      toast.success('Check your email for the reset link');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async () => {
    if (!resetToken || !newPassword) { toast.error('Fill all fields'); return; }
    if (newPassword.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setIsLoading(true);
    try {
      await api.post('/auth/reset-password', { token: resetToken, newPassword });
      toast.success('Password reset successfully. Sign in with your new password.');
      setMode('login');
      setResetToken('');
      setNewPassword('');
      setResetSent(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-primary-50">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Logo */}
          <div className="flex flex-col items-center mb-6">
            <div className="w-16 h-16 bg-primary-600 rounded-xl flex items-center justify-center mb-4">
              <span className="text-white font-bold text-2xl">C</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">CopiaOS</h1>
            <p className="text-sm text-gray-500 mt-1">
              {mode === 'login' ? 'Sign in to your account' : mode === 'forgot' ? 'Reset your password' : mode === 'reset' ? 'Enter new password' : 'Register your organization'}
            </p>
          </div>

          {mode === 'login' && (
            <>
              {/* Tabs */}
              <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
                <button onClick={() => setMode('login')}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                    mode === 'login' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}>
                  Sign In
                </button>
                <button onClick={() => setMode('register')}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                    mode === 'register' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}>
                  Register
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com" className={inputClass} autoComplete="email" autoFocus />
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <div className="relative">
                    <input id="password" type={showPassword ? 'text' : 'password'} value={password}
                      onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password"
                      className={`${inputClass} pr-10`} autoComplete="current-password" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm">
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>
                <button type="submit" disabled={isLoading}
                  className="w-full py-2.5 px-4 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  {isLoading ? <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> Signing in...</> : 'Sign In'}
                </button>
                <button type="button" onClick={() => { setMode('forgot'); setResetSent(false); }}
                  className="w-full text-center text-sm text-primary-600 hover:text-primary-700 mt-2">
                  Forgot password?
                </button>
              </form>
            </>
          )}

          {mode === 'forgot' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-500">Enter your email to reset your password.</p>
              <input type="email" placeholder="you@company.com" className={inputClass}
                value={email} onChange={(e) => setEmail(e.target.value)} />
              {!resetSent && (
                <button onClick={handleForgot} disabled={isLoading}
                  className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50">
                  {isLoading ? 'Generating...' : 'Generate Reset Token'}
                </button>
              )}
              {resetSent && !resetToken && (
                <p className="text-sm text-green-600 text-center py-4">
                  Check your email for the password reset link.
                </p>
              )}
              {resetSent && resetToken && (
                <div className="space-y-2">
                  <p className="text-xs text-gray-500">
                    Enter the token and set your new password:
                  </p>
                  <input type="text" placeholder="Reset token" className={inputClass}
                    value={resetToken} onChange={(e) => setResetToken(e.target.value)} />
                  <input type="password" placeholder="New password (min 6 chars)" className={inputClass}
                    value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                  <button onClick={handleReset} disabled={isLoading}
                    className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50">
                    {isLoading ? 'Resetting...' : 'Reset Password'}
                  </button>
                </div>
              )}
              <button onClick={() => { setMode('login'); setResetSent(false); setResetToken(''); }}
                className="w-full text-center text-sm text-primary-600 hover:text-primary-700">
                Back to Sign In
              </button>
            </div>
          )}

          {mode === 'register' && (
            <RegisterForm onBack={() => setMode('login')} />
          )}

          <p className="text-xs text-gray-400 text-center mt-6">
            By continuing, you agree to the Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
