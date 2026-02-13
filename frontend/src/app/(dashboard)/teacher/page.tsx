export default function TeacherDashboard() {
    return (
        <div>
            <header className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Teacher Dashboard</h1>
                    <p className="text-neutral-600 dark:text-neutral-400">Manage your class progress and verify tasks.</p>
                </div>
                <button className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                    + Create Challenge
                </button>
            </header>

            {/* Class Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl shadow-sm border border-neutral-100 dark:border-neutral-800">
                    <div className="text-sm text-neutral-500 mb-1">Total Students</div>
                    <div className="text-3xl font-bold text-neutral-800 dark:text-neutral-200">42</div>
                </div>
                <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl shadow-sm border border-neutral-100 dark:border-neutral-800">
                    <div className="text-sm text-neutral-500 mb-1">Tasks Pending</div>
                    <div className="text-3xl font-bold text-orange-500">18</div>
                    <div className="text-xs text-neutral-400 mt-2">Needs verification</div>
                </div>
                <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl shadow-sm border border-neutral-100 dark:border-neutral-800">
                    <div className="text-sm text-neutral-500 mb-1">Class XP</div>
                    <div className="text-3xl font-bold text-blue-600">45k</div>
                </div>
                <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl shadow-sm border border-neutral-100 dark:border-neutral-800">
                    <div className="text-sm text-neutral-500 mb-1">Top Student</div>
                    <div className="text-3xl font-bold text-green-600">Alice</div>
                </div>
            </div>

            {/* Verification Queue */}
            <h2 className="text-xl font-bold mb-4">Pending Verifications</h2>
            <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-100 dark:border-neutral-800 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-neutral-50 dark:bg-neutral-800 text-neutral-500 text-sm">
                        <tr>
                            <th className="p-4 font-medium">Student</th>
                            <th className="p-4 font-medium">Task</th>
                            <th className="p-4 font-medium">Submitted</th>
                            <th className="p-4 font-medium">Proof</th>
                            <th className="p-4 font-medium">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                        <tr>
                            <td className="p-4 font-medium">Bob Smith</td>
                            <td className="p-4 text-neutral-600 dark:text-neutral-300">Plant a Tree</td>
                            <td className="p-4 text-neutral-500 text-sm">2 hrs ago</td>
                            <td className="p-4">
                                <span className="text-primary underline cursor-pointer text-sm">View Image</span>
                            </td>
                            <td className="p-4">
                                <div className="flex gap-2">
                                    <button className="text-green-600 hover:bg-green-50 p-1 rounded">✅</button>
                                    <button className="text-red-500 hover:bg-red-50 p-1 rounded">❌</button>
                                </div>
                            </td>
                        </tr>
                        {/* More rows... */}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
