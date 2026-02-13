'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';

interface Lesson {
    id: number;
    title: string;
    points_reward: number;
    has_quiz: boolean;
}

export default function LearnPage() {
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLessons = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('http://localhost:8000/api/lessons/', {
                    headers: { Authorization: `Token ${token}` }
                });
                setLessons(response.data);
            } catch (error) {
                console.error('Failed to fetch lessons', error);
            } finally {
                setLoading(false);
            }
        };

        fetchLessons();
    }, []);

    if (loading) {
        return <div className="p-8 text-center text-neutral-500">Loading modules...</div>;
    }

    return (
        <div>
            <header className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Learning Modules</h1>
                <p className="text-neutral-600 dark:text-neutral-400">Master sustainability concepts to earn XP.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {lessons.map((lesson) => (
                    <Link href={`/student/learn/${lesson.id}`} key={lesson.id} className="group block h-full">
                        <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-2xl p-6 h-full hover:border-primary/50 hover:shadow-lg transition-all">
                            <div className="flex justify-between items-start mb-4">
                                <span className="bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full">
                                    Module {lesson.id}
                                </span>
                                <span className="text-yellow-500 font-bold text-sm">
                                    +{lesson.points_reward} XP
                                </span>
                            </div>
                            <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                                {lesson.title}
                            </h3>
                            <div className="mt-4 flex items-center gap-2 text-sm text-neutral-500">
                                <span>📚 Read Lesson</span>
                                {lesson.has_quiz && <span>• 📝 Take Quiz</span>}
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
