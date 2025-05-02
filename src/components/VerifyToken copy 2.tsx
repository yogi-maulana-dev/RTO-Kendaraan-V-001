import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { verifyToken, resendToken } from '../services/api'; // Pastikan fungsi resendToken ada di API services

const VerifyToken = () => {
    const navigate = useNavigate();
    const userId = localStorage.getItem('userIdForVerification');
    const email = localStorage.getItem('userEmailForVerification'); // Ambil email juga

    const [token, setToken] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [isTokenSent, setIsTokenSent] = useState(false); // Untuk handle status resend

    useEffect(() => {
        if (!userId || !email) {
            navigate('/login');
        }
    }, [navigate, userId, email]);

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            if (!email) throw new Error('Email tidak tersedia');

            const result = await verifyToken(email, token);

            if (result.success) {
                localStorage.removeItem('userIdForVerification');
                localStorage.removeItem('userEmailForVerification');
                navigate('/login');
            } else {
                setError(result.message || 'Verifikasi gagal');
            }
        } catch (error) {
            setError('Terjadi kesalahan jaringan');
            console.error('Verification error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendToken = async () => {
        if (isResending) return;

        setIsResending(true);
        setError('');

        try {
            if (!email) throw new Error('Email tidak tersedia');

            const response = await resendToken(email); // Fungsi baru untuk mengirimkan token
            if (response.success) {
                setIsTokenSent(true); // Menandakan token berhasil dikirim
            } else {
                setError(response.message || 'Gagal mengirim token');
            }
        } catch (error) {
            setError('Terjadi kesalahan jaringan');
        } finally {
            setIsResending(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="text-center text-3xl font-extrabold text-gray-900">
                    Verifikasi Email Anda
                </h2>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <form onSubmit={handleVerify} className="space-y-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl text-gray-800 font-semibold">Verifikasi Akun Baru</h2>
                            <button
                                type="button"
                                onClick={() => navigate('/login')}
                                className="text-sm text-indigo-600 hover:text-indigo-700"
                            >
                                ← Kembali ke Login
                            </button>
                        </div>

                        {error && (
                            <div className="text-center text-sm font-medium text-red-600 mb-4">
                                {error}
                            </div>
                        )}
                        {isTokenSent && (
                            <div className="text-center text-sm font-medium text-green-600 mb-4">
                                Token baru sudah dikirim ke email Anda!
                            </div>
                        )}

                        <div>
                            <label htmlFor="token" className="block text-sm font-medium text-gray-700">
                                Token 6 Digit
                            </label>
                            <div className="mt-1">
                                <input
                                    id="token"
                                    name="token"
                                    type="text"
                                    maxLength={6}
                                    required
                                    value={token}
                                    onChange={(e) => setToken(e.target.value)}
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                {isLoading ? 'Verifying...' : 'Verifikasi'}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6 text-center">
                        <button
                            onClick={handleResendToken}
                            disabled={isResending}
                            className="text-sm text-indigo-600 hover:text-indigo-700"
                        >
                            {isResending ? 'Mengirim token...' : 'Kirim ulang token?'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VerifyToken;
