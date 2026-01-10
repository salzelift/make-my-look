import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { authAPI } from '../lib/api';

const ForgotPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const redirectUrl = searchParams.get('redirect');
  
  const [step, setStep] = useState<'email' | 'otp' | 'reset'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const response = await authAPI.forgotPassword(email);
      setMessage(response.message);
      setStep('otp');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authAPI.verifyOTP(email, otp);
      setStep('reset');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await authAPI.resetPassword(email, otp, newPassword);
      setMessage('Password reset successfully! Redirecting...');
      
      setTimeout(() => {
        // If redirect URL is provided (from mobile app), redirect to that URL
        // Otherwise, redirect to login page
        if (redirectUrl) {
          window.location.href = redirectUrl;
        } else {
          window.location.href = '/login';
        }
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Forgot Password</h1>

        {step === 'email' && (
          <form onSubmit={handleSendOTP} style={styles.form}>
            {error && <div style={styles.error}>{error}</div>}
            {message && <div style={styles.message}>{message}</div>}
            <div style={styles.inputGroup}>
              <label style={styles.label}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={styles.input}
                placeholder="Enter your email"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{
                ...styles.button,
                opacity: loading ? 0.6 : 1,
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'Sending...' : 'Send OTP'}
            </button>
            <Link to="/login" style={styles.link}>
              Back to Login
            </Link>
          </form>
        )}

        {step === 'otp' && (
          <form onSubmit={handleVerifyOTP} style={styles.form}>
            {error && <div style={styles.error}>{error}</div>}
            {message && <div style={styles.message}>{message}</div>}
            <div style={styles.inputGroup}>
              <label style={styles.label}>Enter OTP</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                required
                style={styles.input}
                placeholder="Enter 6-digit OTP"
                maxLength={6}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{
                ...styles.button,
                opacity: loading ? 0.6 : 1,
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
            <button
              type="button"
              onClick={() => setStep('email')}
              style={styles.secondaryButton}
            >
              Resend OTP
            </button>
          </form>
        )}

        {step === 'reset' && (
          <form onSubmit={handleResetPassword} style={styles.form}>
            {error && <div style={styles.error}>{error}</div>}
            {message && <div style={styles.message}>{message}</div>}
            <div style={styles.inputGroup}>
              <label style={styles.label}>New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                style={styles.input}
                placeholder="Enter new password"
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                style={styles.input}
                placeholder="Confirm new password"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{
                ...styles.button,
                opacity: loading ? 0.6 : 1,
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    padding: '20px',
  },
  card: {
    width: '100%',
    maxWidth: '400px',
    border: '2px solid #000000',
    padding: '40px',
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: '30px',
    textAlign: 'center' as const,
  },
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '20px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#000000',
  },
  input: {
    padding: '12px',
    border: '2px solid #000000',
    fontSize: '16px',
    backgroundColor: '#ffffff',
    color: '#000000',
    outline: 'none',
  },
  button: {
    padding: '12px',
    backgroundColor: '#000000',
    color: '#ffffff',
    border: 'none',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '10px',
    transition: 'opacity 0.2s',
  },
  secondaryButton: {
    padding: '12px',
    backgroundColor: '#ffffff',
    color: '#000000',
    border: '2px solid #000000',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '10px',
    transition: 'opacity 0.2s',
  },
  link: {
    textAlign: 'center' as const,
    color: '#000000',
    textDecoration: 'underline',
    fontSize: '14px',
    marginTop: '10px',
  },
  error: {
    padding: '12px',
    backgroundColor: '#f5f5f5',
    border: '2px solid #000000',
    color: '#000000',
    fontSize: '14px',
    textAlign: 'center' as const,
  },
  message: {
    padding: '12px',
    backgroundColor: '#f5f5f5',
    border: '2px solid #000000',
    color: '#000000',
    fontSize: '14px',
    textAlign: 'center' as const,
  },
};

export default ForgotPasswordPage;

