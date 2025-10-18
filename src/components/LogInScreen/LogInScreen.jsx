import { useState, useEffect } from 'react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';
import '../Components.css';
import './LogInScreen.css';
import { supabase } from '../../utils/supabaseClient';

export default function LogInScreen( { onLoginSuccess, onHome }) {
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'signup' | 'forgotPassword' | 'resetPassword' | 'verifyOTP'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event);
      if (event === 'PASSWORD_RECOVERY') {
        console.log('Password recovery event detected');
        setAuthMode('resetPassword');
      } else if (event === 'SIGNED_IN' && session) {
        console.log('User signed in via OAuth');
        if (onLoginSuccess) onLoginSuccess();
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [onLoginSuccess]);

  const changeAuthMode = (mode) => {
    setAuthMode(mode);
    setError('');
    setSuccess('');
  };

  const handleGoogleSignIn = async () => {
    console.log('Initiating Google Sign-In');
    setError('');
    setSuccess('');
    setBusy(true);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (signInError) throw signInError;
      console.log('Google sign-in initiated successfully');
      // Note: User will be redirected to Google's consent screen
      // The onAuthStateChange listener will handle the successful sign-in
    } catch (e) {
      console.error('Google sign-in error:', e.message, e);
      setError(e.message);
      setBusy(false);
    }
  };

  const handleAuth = async () => {
    console.log('handleAuth called with authMode:', authMode);
    setError('');
    setSuccess('');
    setBusy(true);

    try {
      if (authMode === 'forgotPassword') {
        console.log('Attempting password reset for email:', email);
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email);
        if (resetError) throw resetError;
        console.log('Password reset email sent successfully');
        setSuccess('Check your email for reset instructions.');
      } else if (authMode === 'resetPassword') {
        console.log('Attempting to update password');
        if (newPassword !== confirmPassword) {
          throw new Error('Passwords do not match');
        }
        if (newPassword.length < 6) {
          throw new Error('Password must be at least 6 characters');
        }
        const { data, error: updateError } = await supabase.auth.updateUser({ 
          password: newPassword 
        });
        if (updateError) throw updateError;
        console.log('Password updated successfully');
        setSuccess('Password updated successfully!');
        setTimeout(() => changeAuthMode('login'), 2000);
      } else if (authMode === 'verifyOTP') {
        console.log('Attempting OTP verification for email:', email);
        const { data, error: verifyError } = await supabase.auth.verifyOtp({
          email,
          token: otp,
          type: 'signup'
        });
        if (verifyError) throw verifyError;
        console.log('OTP verified successfully, auto-login');
        setSuccess('Email verified successfully! Logging you in...');
        setTimeout(() => {
          if (onLoginSuccess) onLoginSuccess();
        }, 1000);
      } else if (authMode === 'signup') {
        console.log('Attempting signup for email:', email, 'with name:', name);
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { name } },
        });
        if (signUpError) throw signUpError;
        console.log('Signup successful');
        setSuccess('Signup successful! Please check your email to confirm your account or enter the OTP below.');
        changeAuthMode('verifyOTP');
      } else { // login
        console.log('Attempting login for email:', email);
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
        console.log('Login successful');
        if (onLoginSuccess) onLoginSuccess();
      }
    } catch (e) {
      console.error('Authentication error:', e.message, e);
      setError(e.message);
    } finally {
      console.log('handleAuth completed, busy state reset');
      setBusy(false);
    }
  };

  const inputClass = (forceError) =>
    `auth-input${forceError ? ' auth-input-error' : ''}`;

  return (
    <div className="glass-screen">
      <h1 className="title">
        {authMode === 'resetPassword' 
          ? 'Reset Your Password' 
          : authMode === 'verifyOTP'
          ? 'Verify Your Email'
          : 'Welcome to NewsFlash Quiz'}
      </h1>

      {authMode === 'signup' && (
        <input
          className={inputClass(!!error && !name)}
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={busy}
        />
      )}

      {authMode !== 'resetPassword' && (
        <input
          className={inputClass(!!error)}
          type="email"
          placeholder="Email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={busy || authMode === 'verifyOTP'}
        />
      )}

      {authMode === 'verifyOTP' && (
        <input
          className={inputClass(!!error)}
          type="text"
          placeholder="Enter 6-digit OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
          disabled={busy}
          maxLength={6}
        />
      )}

      {authMode === 'resetPassword' && (
        <>
          <div className="password-wrapper">
            <input
              className={inputClass(!!error)}
              type={showNewPassword ? 'text' : 'password'}
              placeholder="New Password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={busy}
            />
            <button
              type="button"
              className="password-toggle-btn"
              onClick={() => setShowNewPassword(!showNewPassword)}
            >
              {showNewPassword ? <EyeOff size={22} /> : <Eye size={22} />}
            </button>
          </div>

          <div className="password-wrapper">
            <input
              className={inputClass(!!error)}
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirm New Password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={busy}
            />
            <button
              type="button"
              className="password-toggle-btn"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <EyeOff size={22} /> : <Eye size={22} />}
            </button>
          </div>
        </>
      )}

      {authMode !== 'forgotPassword' && authMode !== 'resetPassword' && authMode !== 'verifyOTP' && (
        <div className="password-wrapper">
          <input
            className={inputClass(!!error)}
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={busy}
          />
          <button
            type="button"
            className="password-toggle-btn"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
          </button>
        </div>
      )}

      {error && <div className="auth-error">{error}</div>}
      {success && <div className="auth-success">{success}</div>}
      {(!error && !success) && <div className="auth-error invisible">placeholder</div>}

      <button className="event-btn" onClick={handleAuth} disabled={busy}>
        {busy ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="animate-spin" size={30} strokeWidth={4} />
            {authMode === 'forgotPassword'
              ? 'Sending...'
              : authMode === 'resetPassword'
              ? 'Updating...'
              : authMode === 'verifyOTP'
              ? 'Verifying...'
              : authMode === 'signup'
              ? 'Signing up...'
              : 'Logging in...'}
          </span>
        ) : (
          <>
            {authMode === 'forgotPassword'
              ? 'Send Reset Email'
              : authMode === 'resetPassword'
              ? 'Update Password'
              : authMode === 'verifyOTP'
              ? 'Verify OTP'
              : authMode === 'signup'
              ? 'Sign Up'
              : 'Log In'}
          </>
        )}
      </button>

      {authMode !== 'forgotPassword' && authMode !== 'resetPassword' && authMode !== 'verifyOTP' && (
        <button className="event-btn" onClick={handleGoogleSignIn} disabled={busy}>
          {busy ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="animate-spin" size={30} strokeWidth={4} />
              Connecting...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <FcGoogle size={30} />
               Continue with Google
            </span>
          )}
        </button>
      )}

      {authMode !== 'forgotPassword' && authMode !== 'resetPassword' && authMode !== 'verifyOTP' && (
        <button className="event-btn" onClick={onHome} disabled={busy}>
            Home
        </button>
      )}

      {authMode !== 'forgotPassword' && authMode !== 'resetPassword' && authMode !== 'verifyOTP' && (
        <button
          type="button"
          className="source-link source-link-text"
          onClick={() =>
            changeAuthMode(authMode === 'signup' ? 'login' : 'signup')
          }
          disabled={busy}
        >
          {authMode === 'signup'
            ? 'Already have an account? Log In'
            : "Don't have an account? Sign Up"}
        </button>
      )}

      {authMode === 'login' && (
        <button
          type="button"
          className="source-link source-link-text"
          onClick={() => changeAuthMode('forgotPassword')}
          disabled={busy}
        >
          Forgot your password?
        </button>
      )}

      {authMode === 'forgotPassword' && (
        <button
          type="button"
          className="source-link source-link-text"
          onClick={() => changeAuthMode('login')}
          disabled={busy}
        >
          Back to login
        </button>
      )}

      {authMode === 'verifyOTP' && (
        <button
          type="button"
          className="source-link source-link-text"
          onClick={() => changeAuthMode('signup')}
          disabled={busy}
        >
          Back to sign up
        </button>
      )}
    </div>
  );
}
