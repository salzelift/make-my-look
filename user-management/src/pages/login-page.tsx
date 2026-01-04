import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Login</h1>
        <form onSubmit={handleSubmit} style={styles.form}>
          {error && <div style={styles.error}>{error}</div>}
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
          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={styles.input}
              placeholder="Enter your password"
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
            {loading ? 'Logging in...' : 'Login'}
          </button>
          <Link to="/forgot-password" style={styles.link}>
            Forgot Password?
          </Link>
        </form>
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
};

export default LoginPage;

