import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import '../../Components.css';
import './OTPScreen.css';

export default function OTPScreen({ 
  email,
  onVerifyOTP, 
  onBackToSignUp,
  busy 
}) {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async () => {
    setError('');
    setSuccess('');
    
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }
    
    try {
      await onVerifyOTP(email, otp);
      setSuccess('Email verified successfully! Logging you in...');
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div className="glass-screen">
      <h1 className="title">Verify Your Email</h1>

      <input
        className="auth-input"
        type="email"
        placeholder="Email"
        autoComplete="email"
        value={email}
        disabled
      />

      <input
        className={`auth-input${error ? ' auth-input-error' : ''}`}
        type="text"
        placeholder="Enter 6-digit OTP"
        value={otp}
        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
        disabled={busy}
        maxLength={6}
      />

      {error && <div className="auth-error">{error}</div>}
      {success && <div className="auth-success">{success}</div>}
      {!error && !success && <div className="auth-error invisible">placeholder</div>}

      <button className="event-btn" onClick={handleSubmit} disabled={busy}>
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
        onClick={onBackToSignUp}
        disabled={busy}
      >
        Back to sign up
      </button>
    </div>
  );
}