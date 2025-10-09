import { useState, useEffect } from 'react';
import './styles/Components.css';
import './styles/LoadingScreen.css';

export default function LoadingScreen() {

  return (
    <div className="glass-screen">
      <h1 className="title">Loading facts, stay tuned…</h1>
      <div className="loader">
        <span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
        </span>
        <div className="base">
          <span></span>
          <div className="face"></div>
        </div>
      </div>
      <div className="longfazers">
        <span></span>
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  );
}
