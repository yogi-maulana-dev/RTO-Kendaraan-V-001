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
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Masuk ke Akun Anda
        </h2>

        <p className="mt-2 text-center text-sm text-gray-600">
          Belum punya akun?{' '}
          <button
            onClick={() => navigate('/register')}
            className="font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none"
          >
            Daftar disini
          </button>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="text-center text-sm font-medium text-red-600">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Ingat email saya
                </label>
              </div>

              <div className="text-sm">
                <button
                  onClick={() => navigate('/forgot-password')}
                  className="font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none"
                >
                  Lupa password?
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Masuk
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;