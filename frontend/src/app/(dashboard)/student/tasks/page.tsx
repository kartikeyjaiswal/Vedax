'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

interface EcoTask {
    id: number;
    title: string;
    description: string;
    image: string | null;
    status: 'pending' | 'verified' | 'rejected';
    points_earned: number;
}

export default function TasksPage() {
    const [tasks, setTasks] = useState<EcoTask[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    // Form State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [image, setImage] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);

    const fetchTasks = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:8000/api/tasks/', {
                headers: { Authorization: `Token ${token}` }
            });
            setTasks(response.data);
        } catch (error) {
            console.error('Failed to fetch tasks', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setImage(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setUploading(true);

        try {
            const token = localStorage.getItem('token');
            const formData = new FormData();
            formData.append('title', title);
            formData.append('description', description);
            if (image) {
                formData.append('image', image);
            }

            await axios.post('http://localhost:8000/api/tasks/', formData, {
                headers: {
                    Authorization: `Token ${token}`,
                    'Content-Type': 'multipart/form-data',
                }
            });

            // Reset form and refresh
            setTitle('');
            setDescription('');
            setImage(null);
            setShowForm(false);
            fetchTasks(); // Refresh list
            alert('Task submitted successfully!');
        } catch (error) {
            console.error('Failed to submit task', error);
            alert('Failed to submit task. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div>
            <header className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Eco Tasks</h1>
                    <p className="text-neutral-600 dark:text-neutral-400">Complete tasks to earn points and save the planet.</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 rounded-xl font-bold transition-colors"
                >
                    {showForm ? 'Cancel' : '+ New Task'}
                </button>
            </header>

            {showForm && (
                <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-2xl p-6 mb-8 shadow-lg">
                    <h2 className="text-xl font-bold mb-4">Submit New Task</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Task Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent"
                                placeholder="e.g., Planted a Tree"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Description</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent"
                                placeholder="Describe what you did..."
                                rows={3}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Photo Proof</label>
                            <input
                                type="file"
                                onChange={handleImageChange}
                                accept="image/*"
                                className="w-full"
                            />
                        </div>
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={uploading}
                                className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 rounded-lg font-bold disabled:opacity-50"
                            >
                                {uploading ? 'Uploading...' : 'Submit Task'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {loading ? (
                <div className="text-center py-8 text-neutral-500">Loading tasks...</div>
            ) : tasks.length === 0 ? (
                <div className="text-center py-12 bg-neutral-50 dark:bg-neutral-900 rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-800">
                    <p className="text-neutral-500 mb-4">No tasks yet. Start your journey!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {tasks.map((task) => (
                        <div key={task.id} className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-2xl p-6">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-xl font-bold">{task.title}</h3>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${task.status === 'verified' ? 'bg-green-100 text-green-700' :
                                        task.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                            'bg-yellow-100 text-yellow-700'
                                    }`}>
                                    {task.status}
                                </span>
                            </div>
                            <p className="text-neutral-600 dark:text-neutral-400 mb-4 text-sm">{task.description}</p>

                            {task.image && (
                                <div className="mb-4 rounded-lg overflow-hidden h-48 bg-neutral-100 relative">
                                    {/* Using standard img for now as remote pattern not set up for Next/Image */}
                                    <img
                                        src={task.image}
                                        alt={task.title}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            )}

                            <div className="flex justify-between items-center text-sm">
                                <span className="text-neutral-500">Points: {task.points_earned}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
