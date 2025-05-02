import { useState, useEffect } from 'react';

import { useNavigate } from 'react-router-dom';
import { registerUser } from '../services/api';

const Register = () => {
    const [namaLengkap, setNamaLengkap] = useState('');
    const [alamat, setAlamat] = useState('');
    const [noTelepon, setNoTelepon] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [countdown, setCountdown] = useState<number | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (countdown === null) return;

        if (countdown > 0) {
            const timer = setTimeout(() => {
                setCountdown((prev) => (prev !== null ? prev - 1 : null));
                setMessage(`Registrasi berhasil! Anda akan diarahkan ke login dalam ${countdown - 1} detik.`);
            }, 1000);
            return () => clearTimeout(timer);
        } else if (countdown === 0) {
            navigate('/login');
        }
    }, [countdown, navigate]);


    const validateForm = () => {
        const errors: string[] = [];
        const nameRegex = /^[A-Za-z\s\u00C0-\u024F\u1E00-\u1EFF]+$/u; // Support karakter internasional
        const phoneRegex = /^[0-9]{10,20}$/;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

        if (!nameRegex.test(namaLengkap.trim())) {
            errors.push("Nama hanya boleh mengandung huruf dan spasi");
        }

        if (!phoneRegex.test(noTelepon.replace(/[^0-9]/g, ''))) {
            errors.push("Nomor telepon harus 10-20 digit angka");
        }

        if (!emailRegex.test(email.trim().toLowerCase())) {
            errors.push("Format email tidak valid");
        }

        if (password.length < 8) {
            errors.push("Password minimal 8 karakter");
        }

        if (!/[A-Z]/.test(password)) {
            errors.push("Password harus mengandung minimal 1 huruf besar");
        }

        if (!/[0-9]/.test(password)) {
            errors.push("Password harus mengandung minimal 1 angka");
        }

        if (alamat.trim().length < 10) {
            errors.push("Alamat terlalu pendek (minimal 10 karakter)");
        }

        return errors;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');

        const validationErrors = validateForm();
        if (validationErrors.length > 0) {
            setError(validationErrors.join('\n'));
            return;
        }

        try {
            const result = await registerUser({
                nama_lengkap: namaLengkap.trim(),
                alamat: alamat.trim(),
                no_telepon: noTelepon.replace(/[^0-9]/g, ''),
                email: email.trim().toLowerCase(),
                password,
            });

            if (result.success) {
                setMessage(result.message || 'Registrasi berhasil! Anda akan diarahkan ke login.');
                setNamaLengkap('');
                setAlamat('');
                setNoTelepon('');
                setEmail('');
                setPassword('');

                setMessage('Registrasi berhasil! Anda akan diarahkan ke login dalam 3 detik.');
                setCountdown(3); // Mulai hitung mundur 3 detik


            } else {
                setError(result.message || 'Registrasi gagal. Silakan coba lagi.');
            }
        } catch (error: any) {
            console.error('Registration error:', error);
            setError(error.message || 'Terjadi kesalahan sistem. Silakan coba lagi.');
        }
    };

    return (
        <div style={styles.container}>
            <form onSubmit={handleSubmit} style={styles.form}>
                <div style={styles.header}>
                    <h2 style={styles.title}>Registrasi Akun Baru</h2>
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
                        Nama Lengkap<span style={styles.required}>*</span>
                    </label>
                    <input
                        type="text"
                        value={namaLengkap}
                        onChange={(e) => setNamaLengkap(e.target.value)}
                        style={styles.input}
                        placeholder="Masukkan nama lengkap"
                        maxLength={100}
                        required
                    />
                </div>

                <div style={styles.formGroup}>
                    <label style={styles.label}>
                        Alamat Lengkap<span style={styles.required}>*</span>
                    </label>
                    <textarea
                        value={alamat}
                        onChange={(e) => setAlamat(e.target.value)}
                        style={styles.textarea}
                        placeholder="Masukkan alamat lengkap"
                        minLength={10}
                        maxLength={500}
                        required
                    />
                </div>

                <div style={styles.formGroup}>
                    <label style={styles.label}>
                        Nomor Telepon<span style={styles.required}>*</span>
                    </label>
                    <input
                        type="tel"
                        value={noTelepon}
                        onChange={(e) => setNoTelepon(e.target.value)}
                        style={styles.input}
                        placeholder="Contoh: 081234567890"
                        pattern="[0-9]*"
                        maxLength={20}
                        required
                    />
                </div>

                <div style={styles.formGroup}>
                    <label style={styles.label}>
                        Email<span style={styles.required}>*</span>
                    </label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={styles.input}
                        placeholder="Contoh: nama@email.com"
                        maxLength={255}
                        required
                    />
                </div>

                <div style={styles.formGroup}>
                    <label style={styles.label}>
                        Password<span style={styles.required}>*</span>
                    </label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={styles.input}
                        placeholder="Minimal 8 karakter dengan angka dan huruf besar"
                        minLength={8}
                        required
                    />
                </div>

                <button
                    type="submit"
                    style={styles.submitButton}
                    disabled={!!message} // Disable button setelah sukses
                >
                    {message ? 'Mengarahkan ke Login...' : 'Daftar Sekarang'}
                </button>
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
        ':hover': {
            backgroundColor: '#dfe6e9',
        },
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
        ':focus': {
            outline: 'none',
            borderColor: '#0984e3',
            boxShadow: '0 0 0 2px rgba(9, 132, 227, 0.1)',
        },
    },
    textarea: {
        width: '100%',
        padding: '0.8rem',
        border: '1px solid #b2bec3',
        borderRadius: '6px',
        fontSize: '1rem',
        height: '100px',
        resize: 'vertical',
        transition: 'border-color 0.2s',
        ':focus': {
            outline: 'none',
            borderColor: '#0984e3',
            boxShadow: '0 0 0 2px rgba(9, 132, 227, 0.1)',
        },
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
        ':hover': {
            backgroundColor: '#0873c4',
        },
        ':active': {
            transform: 'scale(0.98)',
        },
        ':disabled': {
            backgroundColor: '#b2bec3',
            cursor: 'not-allowed',
        },
    },
    error: {
        backgroundColor: '#ffebee',
        color: '#d32f2f',
        padding: '1rem',
        borderRadius: '6px',
        marginBottom: '1.5rem',
        whiteSpace: 'pre-line',
    },
    success: {
        backgroundColor: '#e8f5e9',
        color: '#2e7d32',
        padding: '1rem',
        borderRadius: '6px',
        marginBottom: '1.5rem',
        whiteSpace: 'pre-line',
    },
} as const;

export default Register;