import { useState } from 'react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { supabase } from '../../utils/supabaseClient';
import '../Components.css';
import './AuthScreen.css';

export default function ResetPasswordForm({ onChangeMode, busy, setBusy }) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleResetPassword = async () => {
    setError('');
    setSuccess('');
    setBusy(true);

    try {
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
      setTimeout(() => onChangeMode('login'), 2000);
    } catch (e) {
      console.error('Password update error:', e.message, e);
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const inputClass = (forceError) => `auth-input${forceError ? ' auth-input-error' : ''}`;

  return (
    <div className="glass-screen">
      <h1 className="title">Reset Your Password</h1>

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

      {error && <div className="auth-error">{error}</div>}
      {success && <div className="auth-success">{success}</div>}
      {(!error && !success) && <div className="auth-error invisible">placeholder</div>}

      <button className="event-btn" onClick={handleResetPassword} disabled={busy}>
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