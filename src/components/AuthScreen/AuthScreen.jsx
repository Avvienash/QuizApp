import { useState } from 'react';
import LoginForm from './LoginForm';
import SignUpForm from './SignUpForm';
import ForgotPasswordForm from './ForgotPasswordForm';
import ResetPasswordForm from './ResetPasswordForm';
import VerifyOTPForm from './VerifyOTPForm';
import '../Components.css';
import './AuthScreen.css';

export default function AuthScreen({ authMode, onChangeMode, onLoginSuccess, onHome }) {
  const [busy, setBusy] = useState(false);
  const [verifyEmail, setVerifyEmail] = useState('');

  const handleChangeMode = (mode, email = '') => {
    if (mode === 'verifyOTP' && email) {
      setVerifyEmail(email);
    }
    onChangeMode?.(mode);
  };

  return (
    <>
      {authMode === 'login' && <LoginForm onChangeMode={handleChangeMode} onLoginSuccess={onLoginSuccess} onHome={onHome} busy={busy} setBusy={setBusy} />}
      {authMode === 'signup' && <SignUpForm onChangeMode={handleChangeMode} onHome={onHome} busy={busy} setBusy={setBusy} />}
      {authMode === 'forgotPassword' && <ForgotPasswordForm onChangeMode={handleChangeMode} busy={busy} setBusy={setBusy} />}
      {authMode === 'resetPassword' && <ResetPasswordForm onChangeMode={handleChangeMode} busy={busy} setBusy={setBusy} />}
      {authMode === 'verifyOTP' && <VerifyOTPForm onChangeMode={handleChangeMode} onLoginSuccess={onLoginSuccess} email={verifyEmail} busy={busy} setBusy={setBusy} />}
    </>
  );
}