import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/api';

const Login = () => {
  const savedEmail = localStorage.getItem('savedEmail') || '';
  const savedRemember = localStorage.getItem('rememberEmail') === 'true';

  const [email, setEmail] = useState(savedEmail);
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(savedRemember);
  const [error, setError] = useState('');
  const { login: authLogin } = useAuth();
  const navigate = useNavigate();

  // Menyimpan email hanya jika checkbox dicentang
  useEffect(() => {
    if (remember) {
      localStorage.setItem('savedEmail', email);
      localStorage.setItem('rememberEmail', 'true');
    } else {
      localStorage.removeItem('savedEmail');
      localStorage.setItem('rememberEmail', 'false');
    }
  }, [email, remember]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const result = await login(email, password);

      if (result.success && result.token) {
        authLogin(result.token);
        navigate('/dashboard');
      } else {
        setError(result.message || 'Email atau password salah');
      }
    } catch (error) {
      setError('Terjadi kesalahan jaringan');
      console.error('Login error:', error);
    }
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: '#f0f2f5'
    }}>
      <form onSubmit={handleSubmit} style={{
        padding: '2rem',
        background: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '400px'
      }}>
        <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Login</h2>

        {error && (
          <div style={{
            color: 'red',
            marginBottom: '1rem',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '1rem'
            }}
            required
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '1rem'
            }}
            required
          />
        </div>

        {/* Checkbox untuk mengingat email */}
        <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center' }}>
          <input
            type="checkbox"
            id="remember"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            style={{ marginRight: '0.5rem' }}
          />
          <label htmlFor="remember">Ingat Email Anda</label>
        </div>

        <button
          type="submit"
          style={{
            width: '100%',
            padding: '0.75rem',
            background: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '1rem',
            cursor: 'pointer',
            transition: 'background-color 0.2s'
          }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#0056b3')}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#007bff')}
        >
          Login
        </button>

        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <button
            onClick={() => navigate('/forgot-password')}
            style={{
              background: 'none',
              border: 'none',
              color: '#007bff',
              cursor: 'pointer'
            }}
          >
            Lupa Password?
          </button>
        </div>
      </form>
    </div>
  );
};

export default Login;
