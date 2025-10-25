import { useState, useEffect } from 'react';
import '../Components.css';
import './AuthScreen.css';
import { supabase } from '../../utils/supabaseClient';
import LogInScreen from './LogInScreen/LogInScreen';
import SignUpScreen from './SignUpScreen/SignUpScreen';
import ForgotPasswordScreen from './ForgotPasswordScreen/ForgotPasswordScreen';
import ResetPasswordScreen from './ResetPasswordScreen/ResetPasswordScreen';
import OTPScreen from './OTPScreen/OTPScreen';

export default function AuthScreen({ onAuthSuccess, onHome }) {
  const [authMode, setAuthMode] = useState('login');
  const [busy, setBusy] = useState(false);
  const [pendingEmail, setPendingEmail] = useState('');
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event);
      
      if (event === 'PASSWORD_RECOVERY') {
        console.log('Password recovery event detected');
        setIsResettingPassword(true);
        setAuthMode('resetPassword');
      } else if (event === 'SIGNED_IN' && session) {
        console.log('User signed in');
        // Only trigger onAuthSuccess if we're not in password recovery mode
        if (!isResettingPassword) {
          console.log('Completing sign in via OAuth');
          if (onAuthSuccess) onAuthSuccess();
        } else {
          console.log('Signed in for password recovery, staying on reset screen');
        }
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [onAuthSuccess, isResettingPassword]);

  const handleLogin = async (email, password) => {
    console.log('Attempting login for email:', email);
    setBusy(true);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) throw signInError;
      console.log('Login successful');
      if (onAuthSuccess) onAuthSuccess();
    } catch (e) {
      console.error('Login error:', e.message, e);
      throw e;
    } finally {
      setBusy(false);
    }
  };

  const handleSignUp = async (name, email, password) => {
    console.log('Attempting signup for email:', email, 'with name:', name);
    setBusy(true);
    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } },
      });
      if (signUpError) throw signUpError;
      console.log('Signup successful');
      setPendingEmail(email);
      setAuthMode('verifyOTP');
    } catch (e) {
      console.error('Signup error:', e.message, e);
      throw e;
    } finally {
      setBusy(false);
    }
  };

  const handleGoogleSignIn = async () => {
    console.log('Initiating Google Sign-In');
    setBusy(true);
    try {
      const { data, error: signInError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
      if (signInError) throw signInError;
      console.log('Google sign-in initiated successfully');
    } catch (e) {
      console.error('Google sign-in error:', e.message, e);
      throw e;
    } finally {
      setBusy(false);
    }
  };

  const handleSendResetEmail = async (email) => {
    console.log('Attempting password reset for email:', email);
    setBusy(true);
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      if (resetError) throw resetError;
      console.log('Password reset email sent successfully');
    } catch (e) {
      console.error('Reset password error:', e.message, e);
      throw e;
    } finally {
      setBusy(false);
    }
  };

  const handleUpdatePassword = async (newPassword) => {
    console.log('Attempting to update password');
    setBusy(true);
    try {
      const { data, error: updateError } = await supabase.auth.updateUser({ 
        password: newPassword 
      });
      if (updateError) throw updateError;
      console.log('Password updated successfully');
      setIsResettingPassword(false);
      // Sign out and redirect to login
      await supabase.auth.signOut();
      setTimeout(() => setAuthMode('login'), 500);
    } catch (e) {
      console.error('Update password error:', e.message, e);
      throw e;
    } finally {
      setBusy(false);
    }
  };

  const handleVerifyOTP = async (email, otp) => {
    console.log('Attempting OTP verification for email:', email);
    setBusy(true);
    try {
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'signup'
      });
      if (verifyError) throw verifyError;
      console.log('OTP verified successfully, auto-login');
      setTimeout(() => {
        if (onAuthSuccess) onAuthSuccess();
      }, 1000);
    } catch (e) {
      console.error('OTP verification error:', e.message, e);
      throw e;
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      {authMode === 'login' && (
        <LogInScreen
          onLogin={handleLogin}
          onGoogleSignIn={handleGoogleSignIn}
          onSwitchToSignUp={() => setAuthMode('signup')}
          onForgotPassword={() => setAuthMode('forgotPassword')}
          onHome={onHome}
          busy={busy}
        />
      )}
      {authMode === 'signup' && (
        <SignUpScreen
          onSignUp={handleSignUp}
          onGoogleSignIn={handleGoogleSignIn}
          onSwitchToLogin={() => setAuthMode('login')}
          onHome={onHome}
          busy={busy}
        />
      )}
      {authMode === 'forgotPassword' && (
        <ForgotPasswordScreen
          onSendResetEmail={handleSendResetEmail}
          onBackToLogin={() => setAuthMode('login')}
          busy={busy}
        />
      )}
      {authMode === 'resetPassword' && (
        <ResetPasswordScreen
          onUpdatePassword={handleUpdatePassword}
          busy={busy}
        />
      )}
      {authMode === 'verifyOTP' && (
        <OTPScreen
          email={pendingEmail}
          onVerifyOTP={handleVerifyOTP}
          onBackToSignUp={() => setAuthMode('signup')}
          busy={busy}
        />
      )}
    </>
  );
}
