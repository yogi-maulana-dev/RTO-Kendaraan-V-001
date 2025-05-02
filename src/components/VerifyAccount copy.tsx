import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { verifyAccount, resendVerificationToken } from '../services/api';

const VerifyAccount = () => {
    const [token, setToken] = useState('');
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [resendDisabled, setResendDisabled] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        // Ambil email dari URL parameter jika ada
        const emailParam = searchParams.get('email');
        if (emailParam) {
            setEmail(emailParam);
        }
    }, [searchParams]);

    useEffect(() => {
        // Countdown timer untuk tombol kirim ulang
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        } else if (countdown === 0 && resendDisabled) {
            setResendDisabled(false);
        }
    }, [countdown, resendDisabled]);

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setIsLoading(true);

        if (!email || !token) {
            setError('Email dan token verifikasi harus diisi');
            setIsLoading(false);
            return;
        }

        try {
            const result = await verifyAccount({
                email: email.trim(),
                token: token.trim()
            });

            if (result.success) {
                setMessage(result.message || 'Akun berhasil diverifikasi!');
                // Redirect ke halaman login setelah 3 detik
                setTimeout(() => navigate('/login'), 3000);
            } else {
                setError(result.message || 'Verifikasi gagal. Silakan coba lagi.');
            }
        } catch (error: any) {
            console.error('Verification error:', error);
            setError(error.message || 'Terjadi kesalahan sistem. Silakan coba lagi.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendToken = async () => {
        setError('');
        setMessage('');
        setIsLoading(true);

        if (!email) {
            setError('Masukkan email Anda untuk mengirim ulang kode verifikasi');
            setIsLoading(false);
            return;
        }

        try {
            const result = await resendVerificationToken(email.trim());

            if (result.success) {
                setMessage(result.message || 'Kode verifikasi baru telah dikirim ke email Anda.');
                setResendDisabled(true);
                setCountdown(60); // Disable tombol selama 60 detik
            } else {
                setError(result.message || 'Gagal mengirim ulang kode verifikasi. Silakan coba lagi.');
            }
        } catch (error: any) {
            console.error('Resend verification error:', error);
            setError(error.message || 'Terjadi kesalahan sistem. Silakan coba lagi.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <form onSubmit={handleVerify} style={styles.form}>
                <div style={styles.header}>
                    <h2 style={styles.title}>Verifikasi Akun</h2>
                    <button
                        type="button"
                        onClick={() => navigate('/login')}
                        style={styles.backButton}
                    >
                        ← Kembali ke Login
                    </button>
                </div>

                {(error || message) && (
                    <div style={error ? styles.error : styles.success}>
                        {error || message}
                    </div>
                )}

                <div style={styles.formGroup}>
                    <label style={styles.label}>
                        Email<span style={styles.required}>*</span>
                    </label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={styles.input}
                        placeholder="Masukkan email anda"
                        disabled={isLoading || !!message}
                        required
                    />
                </div>

                <div style={styles.formGroup}>
                    <label style={styles.label}>
                        Kode Verifikasi<span style={styles.required}>*</span>
                    </label>
                    <input
                        type="text"
                        value={token}
                        onChange={(e) => setToken(e.target.value)}
                        style={styles.input}
                        placeholder="Masukkan kode 6 digit"
                        maxLength={6}
                        disabled={isLoading || !!message}
                        required
                    />
                </div>

                <button
                    type="submit"
                    style={styles.submitButton}
                    disabled={isLoading || !!message}
                >
                    {isLoading ? 'Memproses...' : 'Verifikasi Akun'}
                </button>

                <div style={styles.resendContainer}>
                    <button
                        type="button"
                        onClick={handleResendToken}
                        style={styles.resendButton}
                        disabled={isLoading || resendDisabled || !!message}
                    >
                        {resendDisabled
                            ? `Kirim ulang kode (${countdown})`
                            : 'Kirim ulang kode verifikasi'}
                    </button>
                </div>
            </form>
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f8f9fa',
        padding: '20px',
    },
    form: {
        backgroundColor: 'white',
        borderRadius: '10px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        padding: '2rem',
        width: '100%',
        maxWidth: '500px',
        margin: '0 20px',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
        position: 'relative',
    },
    title: {
        color: '#2d3436',
        fontSize: '1.8rem',
        margin: 0,
    },
    backButton: {
        background: 'none',
        border: 'none',
        color: '#0984e3',
        cursor: 'pointer',
        fontSize: '0.9rem',
        padding: '8px 12px',
        borderRadius: '5px',
        transition: 'background-color 0.2s',
    },
    formGroup: {
        marginBottom: '1.5rem',
    },
    label: {
        display: 'block',
        marginBottom: '0.5rem',
        color: '#636e72',
        fontSize: '0.9rem',
        fontWeight: '500',
    },
    required: {
        color: '#d63031',
        marginLeft: '3px',
    },
    input: {
        width: '100%',
        padding: '0.8rem',
        border: '1px solid #b2bec3',
        borderRadius: '6px',
        fontSize: '1rem',
        transition: 'border-color 0.2s',
    },
    submitButton: {
        width: '100%',
        padding: '1rem',
        backgroundColor: '#0984e3',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        fontSize: '1rem',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'background-color 0.2s, transform 0.1s',
    },
    resendContainer: {
        marginTop: '1rem',
        textAlign: 'center' as const,
    },
    resendButton: {
        background: 'none',
        border: 'none',
        color: '#0984e3',
        cursor: 'pointer',
        fontSize: '0.9rem',
        textDecoration: 'underline',
    },
    error: {
        backgroundColor: '#ffebee',
        color: '#d32f2f',
        padding: '1rem',
        borderRadius: '6px',
        marginBottom: '1.5rem',
        whiteSpace: 'pre-line' as const,
    },
    success: {
        backgroundColor: '#e8f5e9',
        color: '#2e7d32',
        padding: '1rem',
        borderRadius: '6px',
        marginBottom: '1.5rem',
        whiteSpace: 'pre-line' as const,
    },
} as const;

export default VerifyAccount;