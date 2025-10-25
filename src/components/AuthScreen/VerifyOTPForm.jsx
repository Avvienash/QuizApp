import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { supabase } from '../../utils/supabaseClient';
import '../Components.css';
import './AuthScreen.css';

export default function VerifyOTPForm({ onChangeMode, onLoginSuccess, email: initialEmail, busy, setBusy }) {
  const [email, setEmail] = useState(initialEmail || '');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleVerifyOTP = async () => {
    setError('');
    setSuccess('');
    setBusy(true);

    try {
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
    } catch (e) {
      console.error('OTP verification error:', e.message, e);
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const inputClass = (forceError) => `auth-input${forceError ? ' auth-input-error' : ''}`;

  return (
    <div className="glass-screen">
      <h1 className="title">Verify Your Email</h1>

      <input
        className={inputClass(!!error)}
        type="email"
        placeholder="Email"
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={busy || !!initialEmail}
      />

      <input
        className={inputClass(!!error)}
        type="text"
        placeholder="Enter 6-digit OTP"
        value={otp}
        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
        disabled={busy}
        maxLength={6}
      />

      {error && <div className="auth-error">{error}</div>}
      {success && <div className="auth-success">{success}</div>}
      {(!error && !success) && <div className="auth-error invisible">placeholder</div>}

      <button className="event-btn" onClick={handleVerifyOTP} disabled={busy}>
        {busy ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="animate-spin" size={30} strokeWidth={4} />
            Verifying...
          </span>
        ) : (
          'Verify OTP'
        )}
      </button>

      <button
        type="button"
        className="source-link source-link-text"
        onClick={() => onChangeMode('signup')}
        disabled={busy}
      >
        Back to sign up
      </button>
    </div>
  );
}