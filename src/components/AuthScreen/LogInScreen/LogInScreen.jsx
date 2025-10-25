import { useState } from 'react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';
import '../../Components.css';
import './LogInScreen.css';

export default function LogInScreen({ 
  onLogin, 
  onGoogleSignIn, 
  onSwitchToSignUp, 
  onForgotPassword,
  onHome,
  busy 
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    try {
      await onLogin(email, password);
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

      <div className="password-wrapper">
        <input
          className={`auth-input${error ? ' auth-input-error' : ''}`}
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
      {!error && <div className="auth-error invisible">placeholder</div>}

      <button className="event-btn" onClick={handleSubmit} disabled={busy}>
        {busy ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="animate-spin" size={30} strokeWidth={4} />
            Logging in...
          </span>
        ) : (
          'Log In'
        )}
      </button>

      <button className="event-btn" onClick={onGoogleSignIn} disabled={busy}>
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

      <button className="event-btn" onClick={onHome} disabled={busy}>
        Home
      </button>

      <button
        type="button"
        className="source-link source-link-text"
        onClick={onSwitchToSignUp}
        disabled={busy}
      >
        Don't have an account? Sign Up
      </button>

      <button
        type="button"
        className="source-link source-link-text"
        onClick={onForgotPassword}
        disabled={busy}
      >
        Forgot your password?
      </button>
    </div>
  );
}