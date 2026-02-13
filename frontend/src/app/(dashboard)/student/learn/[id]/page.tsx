'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

interface Lesson {
    id: number;
    title: string;
    content: string;
    points_reward: number;
    has_quiz: boolean;
}

export default function LessonDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [lesson, setLesson] = useState<Lesson | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchLesson = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`http://localhost:8000/api/lessons/${id}/`, {
                    headers: { Authorization: `Token ${token}` }
                });
                setLesson(response.data);
            } catch (error) {
                console.error('Failed to fetch lesson', error);
            } finally {
                setLoading(false);
            }
        };

        fetchLesson();
    }, [id]);

    if (loading) return <div className="p-8 text-center text-neutral-500">Loading...</div>;
    if (!lesson) return <div className="p-8 text-center text-red-500">Lesson not found</div>;

    return (
        <div className="max-w-4xl mx-auto">
            <Link href="/student/learn" className="inline-flex items-center text-neutral-500 hover:text-neutral-800 mb-6 transition-colors">
                ← Back to Modules
            </Link>

            <article className="bg-white dark:bg-neutral-900 rounded-2xl p-8 border border-neutral-100 dark:border-neutral-800 shadow-sm mb-8">
                <header className="mb-8 border-b border-neutral-100 dark:border-neutral-800 pb-8">
                    <div className="flex justify-between items-center mb-4">
                        <span className="bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full">
                            Read & Learn
                        </span>
                        <span className="text-green-600 font-bold bg-green-50 px-3 py-1 rounded-full text-sm">
                            Reward: {lesson.points_reward} XP
                        </span>
                    </div>
                    <h1 className="text-4xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
                        {lesson.title}
                    </h1>
                </header>

                <div className="prose prose-neutral dark:prose-invert max-w-none">
                    <ReactMarkdown>{lesson.content}</ReactMarkdown>
                </div>
            </article>

            {lesson.has_quiz && (
                <div className="flex justify-end">
                    <Link
                        href={`/student/learn/${id}/quiz`}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 flex items-center gap-3"
                    >
                        <span>Take Quiz to Earn Points</span>
                        <span>→</span>
                    </Link>
                </div>
            )}
        </div>
    );
}
