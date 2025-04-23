import { useState, useRef, KeyboardEvent, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { forgotPassword } from '../services/api';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [isEmailSent, setIsEmailSent] = useState(false);
    const [token, setToken] = useState(['', '', '', '', '', '']);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // References for token input fields
    const inputRefs = [
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null),
    ];

    const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
        setErrorMessage('');
    };

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMessage('');

        try {
            const response = await forgotPassword(email);

            if (response.success) {
                setSuccessMessage(response.message);
                setIsEmailSent(true);
            } else {
                setErrorMessage(response.message || 'Failed to send reset email');
            }
        } catch (error) {
            setErrorMessage('Network error. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleTokenChange = (e: ChangeEvent<HTMLInputElement>, index: number) => {
        const value = e.target.value;

        // Only accept numbers
        if (value && !/^\d+$/.test(value)) {
            return;
        }

        // Update token state
        const newToken = [...token];
        newToken[index] = value.charAt(0);
        setToken(newToken);

        // Auto-focus next input if current input is filled
        if (value && index < 5) {
            inputRefs[index + 1].current?.focus();
        }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
        // Handle backspace
        if (e.key === 'Backspace') {
            if (index > 0 && !token[index]) {
                inputRefs[index - 1].current?.focus();
            }
        }
    };

    const handleTokenSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const completeToken = token.join('');

        if (completeToken.length !== 6) {
            setErrorMessage('Please enter the complete 6-digit token');
            return;
        }

        // Navigate to reset password page with email and token
        navigate('/reset-password-new', {
            state: {
                email: email,
                token: completeToken
            }
        });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                        {isEmailSent ? 'Enter Verification Code' : 'Reset Your Password'}
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        {isEmailSent
                            ? `We've sent a 6-digit code to ${email}`
                            : 'Enter your email to receive a password reset link'}
                    </p>
                </div>

                {!isEmailSent ? (
                    <form className="mt-8 space-y-6" onSubmit={handleEmailSubmit}>
                        <div>
                            <label htmlFor="email" className="sr-only">Email address</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                placeholder="Email address"
                                value={email}
                                onChange={handleEmailChange}
                                disabled={isLoading}
                            />
                        </div>

                        {errorMessage && (
                            <div className="rounded-md bg-red-50 p-4">
                                <div className="text-sm text-red-700">{errorMessage}</div>
                            </div>
                        )}

                        {successMessage && (
                            <div className="rounded-md bg-green-50 p-4">
                                <div className="text-sm text-green-700">{successMessage}</div>
                            </div>
                        )}

                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300"
                            >
                                {isLoading ? 'Sending...' : 'Send Reset Code'}
                            </button>
                        </div>
                    </form>
                ) : (
                    <form className="mt-8 space-y-6" onSubmit={handleTokenSubmit}>
                        <div className="flex justify-between items-center">
                            {token.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={inputRefs[index]}
                                    type="text"
                                    maxLength={1}
                                    className="w-12 h-12 text-center text-xl font-bold rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    value={digit}
                                    onChange={(e) => handleTokenChange(e, index)}
                                    onKeyDown={(e) => handleKeyDown(e, index)}
                                    autoComplete="off"
                                />
                            ))}
                        </div>

                        {errorMessage && (
                            <div className="rounded-md bg-red-50 p-4">
                                <div className="text-sm text-red-700">{errorMessage}</div>
                            </div>
                        )}

                        <div>
                            <button
                                type="submit"
                                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Verify Code
                            </button>
                        </div>

                        <div className="text-center">
                            <button
                                type="button"
                                onClick={() => setIsEmailSent(false)}
                                className="text-sm text-indigo-600 hover:text-indigo-500"
                            >
                                Use different email address
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ForgotPassword;