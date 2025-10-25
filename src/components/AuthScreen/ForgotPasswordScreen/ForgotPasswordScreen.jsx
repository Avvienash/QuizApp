import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import '../../Components.css';
import './ForgotPasswordScreen.css';

export default function ForgotPasswordScreen({ 
  onSendResetEmail, 
  onBackToLogin,
  busy 
}) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async () => {
    setError('');
    setSuccess('');
    if (!email) {
      setError('Please enter your email');
      return;
    }
    try {
      await onSendResetEmail(email);
      setSuccess('Check your email for reset instructions.');
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div className="glass-screen">
      <h1 className="title">Welcome to NewsFlash Quiz</h1>

      <input
        className={`auth-input${error ? ' auth-input-error' : ''}`}
        type="email"
        placeholder="Email"
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={busy}
      />

      {error && <div className="auth-error">{error}</div>}
      {success && <div className="auth-success">{success}</div>}
      {!error && !success && <div className="auth-error invisible">placeholder</div>}

      <button className="event-btn" onClick={handleSubmit} disabled={busy}>
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
        onClick={onBackToLogin}
        disabled={busy}
      >
        Back to login
      </button>
    </div>
  );
}