import Link from 'next/link';

export default function StudentDashboard() {
    return (
        <div>
            <header className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Welcome back, John! 👋</h1>
                <p className="text-neutral-600 dark:text-neutral-400">Here's your eco-impact summary for this week.</p>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl shadow-sm border border-neutral-100 dark:border-neutral-800">
                    <div className="text-sm text-neutral-500 mb-1">Total XP</div>
                    <div className="text-3xl font-bold text-primary">1,250 XP</div>
                    <div className="text-xs text-green-600 mt-2">↑ 150 this week</div>
                </div>
                <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl shadow-sm border border-neutral-100 dark:border-neutral-800">
                    <div className="text-sm text-neutral-500 mb-1">Current Streak</div>
                    <div className="text-3xl font-bold text-orange-500">🔥 5 Days</div>
                    <div className="text-xs text-neutral-400 mt-2">Keep it up!</div>
                </div>
                <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl shadow-sm border border-neutral-100 dark:border-neutral-800">
                    <div className="text-sm text-neutral-500 mb-1">Trees Planted</div>
                    <div className="text-3xl font-bold text-green-700">🌳 3</div>
                    <div className="text-xs text-neutral-400 mt-2">Level 2 Forester</div>
                </div>
            </div>

            {/* Active Tasks */}
            <h2 className="text-xl font-bold mb-4">Active Challenges</h2>
            <div className="space-y-4">
                <div className="bg-white dark:bg-neutral-900 p-4 rounded-xl border border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-2xl">
                            💧
                        </div>
                        <div>
                            <h3 className="font-bold">Save Water Checklist</h3>
                            <p className="text-sm text-neutral-500">Complete daily water saving tasks</p>
                        </div>
                    </div>
                    <Link href="/student/tasks" className="px-4 py-2 bg-primary/10 text-primary font-medium rounded-lg hover:bg-primary/20 transition-colors">
                        Continue
                    </Link>
                </div>

                <div className="bg-white dark:bg-neutral-900 p-4 rounded-xl border border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-100 text-green-600 rounded-lg flex items-center justify-center text-2xl">
                            ♻️
                        </div>
                        <div>
                            <h3 className="font-bold">Recycling Drive</h3>
                            <p className="text-sm text-neutral-500">Upload photo of separated waste</p>
                        </div>
                    </div>
                    <Link href="/student/tasks" className="px-4 py-2 bg-primary/10 text-primary font-medium rounded-lg hover:bg-primary/20 transition-colors">
                        Start
                    </Link>
                </div>
            </div>
        </div>
    );
}
