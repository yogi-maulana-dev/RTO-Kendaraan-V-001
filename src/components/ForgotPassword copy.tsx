import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { forgotPassword } from '../services/api';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            const response = await forgotPassword(email);

            if (response.success) {
                setSuccess(true);
            } else {
                setError(response.message || 'Gagal mengirim permintaan');
            }
        } catch (error) {
            setError('Terjadi kesalahan jaringan');
            console.error('Forgot password error:', error);
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
                <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Lupa Password</h2>

                {success ? (
                    <div style={{ color: 'green', textAlign: 'center' }}>
                        Instruksi reset password telah dikirim ke email Anda
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
                            Kirim Instruksi
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

export default ForgotPassword;