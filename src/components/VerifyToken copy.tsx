import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { verifyToken } from '../services/api'; // Pastikan ini ada

const VerifyToken = () => {
    const navigate = useNavigate();
    const userId = localStorage.getItem('userIdForVerification');
    const email = localStorage.getItem('userEmailForVerification'); // Ambil email juga

    const [token, setToken] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // Kalau tidak ada userId atau email di localStorage, langsung redirect ke login
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

            const result = await verifyToken(email, token); // Kirim email dan token ke API

            if (result.success) {
                // Berhasil verifikasi
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

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Verifikasi Email Anda
                </h2>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <form onSubmit={handleVerify} className="space-y-6">
                        {error && (
                            <div className="text-center text-sm font-medium text-red-600">
                                {error}
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
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                {isLoading ? 'Verifying...' : 'Verifikasi'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default VerifyToken;
