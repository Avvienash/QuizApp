import { useState } from 'react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';
import { supabase } from '../../utils/supabaseClient';
import '../Components.css';
import './AuthScreen.css';

export default function LoginForm({ onChangeMode, onLoginSuccess, onHome, busy, setBusy }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleLogin = async () => {
    setError('');
    setSuccess('');
    setIsLoginLoading(true);
    setBusy(true);

    try {
      console.log('Attempting login for email:', email);
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) throw signInError;
      console.log('Login successful');
      if (onLoginSuccess) onLoginSuccess();
    } catch (e) {
      console.error('Login error:', e.message, e);
      setError(e.message);
    } finally {
      setIsLoginLoading(false);
      setBusy(false);
    }
  };

  const handleGoogleSignIn = async () => {
    console.log('Initiating Google Sign-In');
    setError('');
    setSuccess('');
    setIsGoogleLoading(true);
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
    } catch (e) {
      console.error('Google sign-in error:', e.message, e);
      setError(e.message);
      setIsGoogleLoading(false);
      setBusy(false);
    }
  };

  const inputClass = (forceError) => `auth-input${forceError ? ' auth-input-error' : ''}`;

  return (
    <div className="glass-screen">
      <h1 className="title">Welcome to NewsFlash Quiz</h1>

      <input
        className={inputClass(!!error)}
        type="email"
        placeholder="Email"
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={busy}
      />

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

      {error && <div className="auth-error">{error}</div>}
      {success && <div className="auth-success">{success}</div>}
      {(!error && !success) && <div className="auth-error invisible">placeholder</div>}

      <button className="event-btn" onClick={handleLogin} disabled={busy}>
        {isLoginLoading ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="animate-spin" size={30} strokeWidth={4} />
            Logging in...
          </span>
        ) : (
          'Log In'
        )}
      </button>

      <button className="event-btn" onClick={handleGoogleSignIn} disabled={busy}>
        {isGoogleLoading ? (
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

      <button className="event-btn" onClick={onHome} disabled={busy}>
        Home
      </button>

      <button
        type="button"
        className="source-link source-link-text"
        onClick={() => onChangeMode('signup')}
        disabled={busy}
      >
        Don't have an account? Sign Up
      </button>

      <button
        type="button"
        className="source-link source-link-text"
        onClick={() => onChangeMode('forgotPassword')}
        disabled={busy}
      >
        Forgot your password?
      </button>
    </div>
  );
}