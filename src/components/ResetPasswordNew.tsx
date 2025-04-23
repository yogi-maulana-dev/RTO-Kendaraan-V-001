import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { resetPassword } from '../services/api';

interface LocationState {
    email: string;
    token: string;
}

const ResetPasswordNew = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [email, setEmail] = useState('');
    const [token, setToken] = useState('');

    useEffect(() => {
        // Check if state exists and contains necessary data
        const state = location.state as LocationState;
        if (!state || !state.email || !state.token) {
            // Redirect back to forgot password if data is missing
            navigate('/forgot-password');
            return;
        }

        setEmail(state.email);
        setToken(state.token);
    }, [location, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage('');

        // Validate passwords
        if (password.length < 6) {
            setErrorMessage('Password harus minimal 6 karakter');
            return;
        }

        if (password !== confirmPassword) {
            setErrorMessage('Password tidak cocok');
            return;
        }

        setIsLoading(true);

        try {
            const response = await resetPassword(token, password);

            if (response.success) {
                setSuccessMessage(response.message);

                // Redirect to login after 3 seconds
                setTimeout(() => {
                    navigate('/login');
                }, 3000);
            } else {
                setErrorMessage(response.message || 'Gagal reset password');
            }
        } catch (error) {
            setErrorMessage('Terjadi kesalahan jaringan. Silakan coba lagi nanti.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Reset Password</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Masukkan password baru untuk akun <span className="font-semibold">{email}</span>
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Password Baru
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="new-password"
                                required
                                className="appearance-none mt-1 rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                placeholder="Password Baru"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={isLoading}
                            />
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                                Konfirmasi Password
                            </label>
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                autoComplete="new-password"
                                required
                                className="appearance-none mt-1 rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                placeholder="Konfirmasi Password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    {errorMessage && (
                        <div className="rounded-md bg-red-50 p-4">
                            <div className="text-sm text-red-700">{errorMessage}</div>
                        </div>
                    )}

                    {successMessage && (
                        <div className="rounded-md bg-green-50 p-4">
                            <div className="text-sm text-green-700">
                                {successMessage}
                                <div className="mt-1">Redirect ke halaman login dalam 3 detik...</div>
                            </div>
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300"
                        >
                            {isLoading ? 'Memproses...' : 'Reset Password'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ResetPasswordNew;