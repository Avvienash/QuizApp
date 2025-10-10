import { useState, useEffect } from 'react';
import './styles/Components.css';
import './styles/LoadingScreen.css';

export default function LoadingScreen() {

  return (
    <div className="glass-screen">
      <h1 className="title">Loading facts, stay tuned…</h1>
      <div className="typewriter">
        <div className="slide"><i /></div>
        <div className="paper" />
        <div className="keyboard" />
      </div>
    </div>
  );
}
