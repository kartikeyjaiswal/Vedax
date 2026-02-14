'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // 1. Get Token
            const response = await axios.post('http://localhost:8000/api-token-auth/', {
                username,
                password,
            });

            if (response.data.token) {
                const token = response.data.token;

                // 2. Fetch User Details for Role
                try {
                    const userResponse = await axios.get('http://localhost:8000/api/users/me/', {
                        headers: { Authorization: `Token ${token}` }
                    });

                    const user = userResponse.data;
                    const role = user.role;

                    // Update Context
                    login(token, user);

                    // 3. Redirect based on role
                    if (role === 'super_admin') {
                        router.push('/admin');
                    } else if (role === 'institution_admin') {
                        router.push('/institution');
                    } else if (role === 'teacher') {
                        router.push('/teacher');
                    } else {
                        router.push('/student');
                    }
                } catch (userErr) {
                    console.error("Failed to fetch user details", userErr);
                    router.push('/student');
                }
            }
        } catch (err: any) {
            setError('Invalid credentials. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-900 px-4">
            <div className="max-w-md w-full bg-white dark:bg-neutral-950 p-8 rounded-2xl shadow-xl border border-neutral-100 dark:border-neutral-800">
                <div className="text-center mb-8">
                    <Link href="/" className="text-3xl font-bold text-primary mb-2 inline-block">
                        🌿 Vedax
                    </Link>
                    <h2 className="text-xl font-semibold text-neutral-800 dark:text-neutral-200">Welcome Back</h2>
                    <p className="text-neutral-500 text-sm">Sign in to continue your journey</p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                            placeholder="your@email.com"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 rounded-lg font-bold transition-transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Signing In...' : 'Sign In'}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-neutral-500">
                    Don't have an account?{' '}
                    <Link href="/register" className="text-primary hover:underline font-medium">
                        Sign Up
                    </Link>
                </div>
            </div>
        </div>
    );
}
