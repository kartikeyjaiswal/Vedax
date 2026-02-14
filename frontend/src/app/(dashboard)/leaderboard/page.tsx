'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

interface User {
    id: number;
    full_name: string;
    email: string;
    xp_points: number;
    badges: string[];
    school_name: string;
}

export default function LeaderboardPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const token = localStorage.getItem('token');
                // Endpoint exists on backend: /api/leaderboard/
                const response = await axios.get('http://localhost:8000/api/leaderboard/', {
                    headers: { Authorization: `Token ${token}` }
                });
                setUsers(response.data);
            } catch (error) {
                console.error('Failed to fetch leaderboard', error);
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboard();
    }, []);

    if (loading) return <div className="p-8 text-center text-neutral-500">Loading leaderboard...</div>;

    return (
        <div className="max-w-4xl mx-auto">
            <header className="mb-8 text-center">
                <h1 className="text-3xl font-bold mb-2">🏆 Eco Champions</h1>
                <p className="text-neutral-600 dark:text-neutral-400">Top students making a difference.</p>
            </header>

            <div className="bg-white dark:bg-neutral-900 rounded-3xl shadow-xl overflow-hidden border border-neutral-100 dark:border-neutral-800">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-neutral-50 dark:bg-neutral-950 border-b border-neutral-100 dark:border-neutral-800">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-neutral-500 uppercase tracking-wider">Rank</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-neutral-500 uppercase tracking-wider">Student</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-neutral-500 uppercase tracking-wider">School</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-neutral-500 uppercase tracking-wider">XP Points</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                            {users.map((user, index) => (
                                <tr key={user.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${index === 0 ? 'bg-yellow-100 text-yellow-700' :
                                            index === 1 ? 'bg-gray-100 text-gray-700' :
                                                index === 2 ? 'bg-orange-100 text-orange-700' :
                                                    'text-neutral-500'
                                            }`}>
                                            {index + 1}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold mr-3">
                                                {(user.full_name || user.email).charAt(0).toUpperCase()}
                                            </div>
                                            <div className="text-sm font-medium">{user.full_name || user.email}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                                        {user.school_name || 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <span className="text-sm font-bold text-primary">{user.xp_points} XP</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
