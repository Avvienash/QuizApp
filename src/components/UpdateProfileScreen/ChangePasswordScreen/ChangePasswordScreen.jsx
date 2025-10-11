import { useState } from 'react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import '../../Components.css';
import './ChangePasswordScreen.css';
import { supabase } from '../../../utils/supabaseClient';

export default function ChangePasswordScreen({ session, onBack }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleUpdate = async () => {
    setError('');
    setSuccess('');
    setBusy(true);

    try {
      if (!currentPassword) {
        throw new Error('Current password is required');
      }
      if (newPassword !== confirmPassword) {
        throw new Error('New passwords do not match');
      }
      if (newPassword.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }

      // Verify current password by attempting to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: session.user.email,
        password: currentPassword
      });
      if (signInError) throw new Error('Current password is incorrect');

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });
      if (updateError) throw updateError;
      
      setSuccess('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const inputClass = (forceError) =>
    `auth-input${forceError ? ' auth-input-error' : ''}`;

  return (
    <div className="glass-screen">
      <h1 className="title">Change Password</h1>

      <div className="password-wrapper">
        <input
          className={inputClass(!!error)}
          type={showCurrentPassword ? 'text' : 'password'}
          placeholder="Current Password"
          autoComplete="current-password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          disabled={busy}
        />
        <button
          type="button"
          className="password-toggle-btn"
          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
        >
          {showCurrentPassword ? <EyeOff size={22} /> : <Eye size={22} />}
        </button>
      </div>

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

      <button className="event-btn" onClick={handleUpdate} disabled={busy}>
        {busy ? (
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <Loader2 className="animate-spin" size={30} strokeWidth={4} />
            Updating...
          </span>
        ) : (
          'Update Password'
        )}
      </button>

      <button className="event-btn" onClick={onBack} disabled={busy}>
        Back to Profile
      </button>
    </div>
  );
}