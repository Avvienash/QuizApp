import { useState } from 'react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import '../../Components.css';
import './ResetPasswordScreen.css';

export default function ResetPasswordScreen({ 
  onUpdatePassword,
  busy 
}) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async () => {
    setError('');
    setSuccess('');
    
    if (!newPassword || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    try {
      await onUpdatePassword(newPassword);
      setSuccess('Password updated successfully!');
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div className="glass-screen">
      <h1 className="title">Reset Your Password</h1>

      <div className="password-wrapper">
        <input
          className={`auth-input${error ? ' auth-input-error' : ''}`}
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
          className={`auth-input${error ? ' auth-input-error' : ''}`}
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

      {error && <div className="auth-error">{error}</div>}
      {success && <div className="auth-success">{success}</div>}
      {!error && !success && <div className="auth-error invisible">placeholder</div>}

      <button className="event-btn" onClick={handleSubmit} disabled={busy}>
        {busy ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="animate-spin" size={30} strokeWidth={4} />
            Updating...
          </span>
        ) : (
          'Update Password'
        )}
      </button>
    </div>
  );
}