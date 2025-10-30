import '../../Components.css';
import './ViewProfileScreen.css';
import { getUserData } from '../../../utils/supabaseClient';
import { useEffect, useState } from 'react';

export default function ViewProfileScreen({ session, onChangeName, onChangePassword, onBack, userName }) {
  const displayEmail = session?.user?.email || '';

  return (
    <div className="glass-screen">
      <h1 className="title">User Profile</h1>

      <div className="profile-info">
        <div className="profile-field">
          <span className="profile-label">Name:</span>
          <span className="profile-value">{userName}</span>
        </div>
        <div className="profile-field">
          <span className="profile-label">Email:</span>
          <span className="profile-value">{displayEmail}</span>
        </div>
      </div>

      <button className="event-btn" onClick={onChangeName}>
        Change Name
      </button>

      <button className="event-btn" onClick={onChangePassword}>
        Change Password
      </button>

      <button className="event-btn" onClick={onBack}>
        Home
      </button>
    </div>
  );
}