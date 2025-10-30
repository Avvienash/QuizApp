import { useState } from 'react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import '../Components.css';
import './AuthScreen.css';
import { supabase } from '../../utils/supabaseClient';

export default function SignUpForm({ onChangeMode, onHome, busy, setBusy }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSignUp = async () => {
    setError('');
    setSuccess('');
    setBusy(true);

    try {
      console.log('Attempting signup for email:', email, 'with name:', name);
      
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } },
      });
      
      if (signUpError) throw signUpError;
      
      // Check if user already exists (Supabase returns a user but with null session)
      if (data.user && !data.session && data.user.identities?.length === 0) {
        setError('An account with this email already exists. Redirecting to login...');
        setTimeout(() => onChangeMode('login'), 2000);
        setBusy(false);
        return;
      }
      
      console.log('Signup successful');
      setSuccess('Signup successful! Please check your email to confirm your account or enter the OTP below.');
      setTimeout(() => onChangeMode('verifyOTP', email), 2000);
    } catch (e) {
      console.error('Signup error:', e.message, e);
      
      // Check for specific error messages that indicate existing user
      if (e.message.includes('already registered') || e.message.includes('already exists')) {
        setError('An account with this email already exists. Redirecting to login...');
        setTimeout(() => onChangeMode('login'), 2000);
      } else {
        setError(e.message);
      }
    } finally {
      setBusy(false);
    }
  };

  const inputClass = (forceError) => `auth-input${forceError ? ' auth-input-error' : ''}`;

  return (
    <div className="glass-screen">
      <h1 className="title">Welcome to NewsFlash Quiz</h1>

      <input
        className={inputClass(!!error && !name)}
        type="text"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        disabled={busy}
      />

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

      <button className="event-btn" onClick={handleSignUp} disabled={busy}>
        {busy ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="animate-spin" size={30} strokeWidth={4} />
            Signing up...
          </span>
        ) : (
          'Sign Up'
        )}
      </button>

      <button className="event-btn" onClick={onHome} disabled={busy}>
        Home
      </button>

      <button
        type="button"
        className="source-link source-link-text"
        onClick={() => onChangeMode('login')}
        disabled={busy}
      >
        Already have an account? Log In
      </button>
    </div>
  );
}