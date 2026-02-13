'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

interface EcoTask {
    id: number;
    title: string;
    description: string;
    image: string | null;
    status: 'pending' | 'verified' | 'rejected';
    student_name: string;
    submitted_at: string;
}

export default function VerifyTasksPage() {
    const [tasks, setTasks] = useState<EcoTask[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchTasks = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:8000/api/tasks/', {
                headers: { Authorization: `Token ${token}` }
            });
            // Client-side filter for MVP
            const pending = response.data.filter((t: EcoTask) => t.status === 'pending');
            setTasks(pending);
        } catch (error) {
            console.error('Failed to fetch tasks', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    const handleVerify = async (id: number, action: 'verify' | 'reject') => {
        try {
            const token = localStorage.getItem('token');

            if (action === 'verify') {
                await axios.post(`http://localhost:8000/api/tasks/${id}/verify/`, {}, {
                    headers: { Authorization: `Token ${token}` }
                });
            } else {
                // Reject logic (update status to rejected)
                await axios.patch(`http://localhost:8000/api/tasks/${id}/`, { status: 'rejected' }, {
                    headers: { Authorization: `Token ${token}` }
                });
            }

            // Remove from list
            setTasks(prev => prev.filter(t => t.id !== id));
            alert(`Task ${action === 'verify' ? 'verified' : 'rejected'} successfully!`);
        } catch (error) {
            console.error(`Failed to ${action} task`, error);
            alert(`Failed to ${action} task. Ensure you have teacher permissions.`);
        }
    };

    return (
        <div>
            <header className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Verify Student Tasks</h1>
                <p className="text-neutral-600 dark:text-neutral-400">Review and approve pending eco-tasks.</p>
            </header>

            {loading ? (
                <div className="text-center py-8 text-neutral-500">Loading tasks...</div>
            ) : tasks.length === 0 ? (
                <div className="text-center py-12 bg-neutral-50 dark:bg-neutral-900 rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-800">
                    <p className="text-neutral-500 mb-4">No pending tasks to review. Great job!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tasks.map((task) => (
                        <div key={task.id} className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                            {task.image && (
                                <div className="h-48 bg-neutral-100 relative">
                                    <img
                                        src={task.image}
                                        alt={task.title}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            )}
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-lg font-bold">{task.title}</h3>
                                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                                        {task.student_name}
                                    </span>
                                </div>
                                <p className="text-neutral-600 dark:text-neutral-400 text-sm mb-4 line-clamp-3">
                                    {task.description}
                                </p>
                                <div className="flex gap-3 mt-4">
                                    <button
                                        onClick={() => handleVerify(task.id, 'verify')}
                                        className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-bold text-sm"
                                    >
                                        Approve (+50 XP)
                                    </button>
                                    <button
                                        onClick={() => handleVerify(task.id, 'reject')}
                                        className="flex-1 bg-red-100 hover:bg-red-200 text-red-600 py-2 rounded-lg font-bold text-sm"
                                    >
                                        Reject
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
