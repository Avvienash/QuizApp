import { useState } from "react";
import { Loader2 } from "lucide-react";
import "../../Components.css";
import "./ChangeNameScreen.css";
import { editUserData, getUserData } from "../../../utils/supabaseClient";
import { useEffect } from "react";

export default function ChangeNameScreen({ session, onBack, userName, setUserName }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [displayName, setDisplayName] = useState(userName || '');



  const handleUpdate = async () => {
    setError('');
    setSuccess('');
    setBusy(true);

    try {
      if (!displayName.trim()) {
        throw new Error('Name cannot be empty');
      }
      
      const { error: updateError } = await editUserData(session.user.id, 'name', displayName.trim());
      
      if (updateError) throw updateError;
      setUserName(displayName.trim());
      setSuccess('Name updated successfully!');
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
      <h1 className="title">Change Name</h1>

      <input
        className={inputClass(!!error)}
        type="text"
        placeholder="Enter your name"
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
        disabled={busy}
      />

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
          'Update Name'
        )}
      </button>

      <button className="event-btn" onClick={onBack} disabled={busy}>
        Back to Profile
      </button>
    </div>
  );
}