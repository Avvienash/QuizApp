import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { supabase } from '../../utils/supabaseClient';
import '../Components.css';
import './AuthScreen.css';

export default function ForgotPasswordForm({ onChangeMode, busy, setBusy }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleForgotPassword = async () => {
    setError('');
    setSuccess('');
    setBusy(true);

    try {
      console.log('Attempting password reset for email:', email);
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin,
      });
      if (resetError) throw resetError;
      console.log('Password reset email sent successfully');
      setSuccess('Check your email for reset instructions.');
    } catch (e) {
      console.error('Password reset error:', e.message, e);
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const inputClass = (forceError) => `auth-input${forceError ? ' auth-input-error' : ''}`;

  return (
    <div className="glass-screen">
      <h1 className="title">Reset Your Password</h1>

      <input
        className={inputClass(!!error)}
        type="email"
        placeholder="Email"
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={busy}
      />

      {error && <div className="auth-error">{error}</div>}
      {success && <div className="auth-success">{success}</div>}
      {(!error && !success) && <div className="auth-error invisible">placeholder</div>}

      <button className="event-btn" onClick={handleForgotPassword} disabled={busy}>
        {busy ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="animate-spin" size={30} strokeWidth={4} />
            Sending...
          </span>
        ) : (
          'Send Reset Email'
        )}
      </button>

      <button
        type="button"
        className="source-link source-link-text"
        onClick={() => onChangeMode('login')}
        disabled={busy}
      >
        Back to login
      </button>
    </div>
  );
}