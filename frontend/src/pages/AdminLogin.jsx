// frontend/src/pages/AdminLogin.jsx

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { Shield, User, Lock, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { ButtonLoading } from '../components/Loading.jsx';
import { adminLoginSchema } from '../utils/validation.js';
import { adminLogin, getAdminMe } from '../services/api.js';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(adminLoginSchema) });

  // Redirect if already logged in
  useEffect(() => {
    getAdminMe()
      .then(() => navigate('/admin/dashboard', { replace: true }))
      .catch(() => {}); // Not logged in — stay on login page
  }, [navigate]);

  const onSubmit = async ({ username, password }) => {
    setSubmitting(true);
    setServerError('');
    try {
      await adminLogin(username, password);
      navigate('/admin/dashboard', { replace: true });
    } catch (err) {
      const status = err.response?.status;
      if (status === 429) {
        setServerError(err.response.data?.message || 'Too many attempts. Please wait.');
      } else if (status === 401) {
        setServerError('Invalid username or password.');
      } else {
        setServerError('Login failed. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-ualg-navy via-ualg-blue to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-ualg-gold rounded-full mb-4 shadow-2xl">
            <Shield className="w-10 h-10 text-ualg-navy" />
          </div>
          <h1 className="text-white font-black text-xl tracking-wide">UNITY A LIVE GROUP</h1>
          <p className="text-blue-300 text-sm mt-1 tracking-widest uppercase">Admin Portal</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-xl font-bold text-ualg-navy mb-6 text-center">Sign In</h2>

          {serverError && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4 mb-6" role="alert">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 text-sm">{serverError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
            {/* Username */}
            <div>
              <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-1">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  id="username"
                  type="text"
                  autoComplete="username"
                  placeholder="Enter admin username"
                  className={`input-field pl-10 ${errors.username ? 'input-error' : ''}`}
                  {...register('username')}
                />
              </div>
              {errors.username && (
                <p className="text-red-500 text-xs mt-1" role="alert">⚠ {errors.username.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Enter admin password"
                  className={`input-field pl-10 pr-10 ${errors.password ? 'input-error' : ''}`}
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1" role="alert">⚠ {errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full"
              aria-busy={submitting}
            >
              {submitting ? <ButtonLoading text="Signing in..." /> : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="text-center text-blue-300/50 text-xs mt-6">
          UNITY A LIVE GROUP — Secure Admin Access
        </p>
      </div>
    </div>
  );
}
