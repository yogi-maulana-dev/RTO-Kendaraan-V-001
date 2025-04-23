import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { resetPassword } from '../services/api';

const ResetPassword = () => {
    const [email, setEmail] = useState('');
    const [token, setToken] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            const response = await resetPassword(email, token, newPassword);

            if (response.success) {
                setSuccess(true);
                setTimeout(() => navigate('/login'), 3000);
            } else {
                setError(response.message || 'Gagal mereset password');
            }
        } catch (error) {
            setError('Terjadi kesalahan jaringan');
            console.error('Reset password error:', error);
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
                <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Reset Password</h2>

                {success ? (
                    <div style={{ color: 'green', textAlign: 'center' }}>
                        Password berhasil direset. Mengarahkan ke halaman login...
                    </div>
                ) : (
                    <>
                        {error && (
                            <div style={{ color: 'red', marginBottom: '1rem', textAlign: 'center' }}>
                                {error}
                            </div>
                        )}

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Email:</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                style={{
                                    width: '100%',
                                    padding: '0.5rem',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    fontSize: '1rem'
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Kode Reset:</label>
                            <input
                                type="text"
                                value={token}
                                onChange={(e) => setToken(e.target.value)}
                                required
                                style={{
                                    width: '100%',
                                    padding: '0.5rem',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    fontSize: '1rem'
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Password Baru:</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                style={{
                                    width: '100%',
                                    padding: '0.5rem',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    fontSize: '1rem'
                                }}
                            />
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
                                cursor: 'pointer'
                            }}
                        >
                            Reset Password
                        </button>
                    </>
                )}

                <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                    <button
                        onClick={() => navigate('/login')}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#007bff',
                            cursor: 'pointer'
                        }}
                    >
                        Kembali ke Login
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ResetPassword;