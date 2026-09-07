import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { Mail, Lock } from 'lucide-react';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const { addToast } = useNotification();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      addToast('Welcome back to OneSpace!', 'success');
      navigate('/');
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Sign in to your account</h2>
        <p className="text-xs text-slate-400 mt-1">Enter your details to access your personal workspace</p>
        <div className="mt-4 rounded-xl border border-slate-700/70 bg-slate-900/40 p-3 text-[11px] text-slate-400">
          <p className="font-semibold text-slate-300">Your workspace profile</p>
          
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800 text-xs text-rose-300">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email Address"
          type="email"
          icon={Mail}
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <Input
          label="Password"
          type="password"
          icon={Lock}
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <Button type="submit" variant="primary" className="w-full" loading={loading}>
          Sign In
        </Button>
      </form>

      <div className="text-center text-xs text-slate-400">
        Don't have an account?{' '}
        <Link to="/register" className="font-semibold text-blue-400 hover:text-blue-300 hover:underline">
          Create one now
        </Link>
      </div>
    </div>
  );
};
