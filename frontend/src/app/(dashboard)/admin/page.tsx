export default function AdminDashboard() {
    return (
        <div>
            <header className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Admin Panel</h1>
                <p className="text-neutral-600 dark:text-neutral-400">Platform overview and school management.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl shadow-sm border border-neutral-100 dark:border-neutral-800">
                    <h2 className="text-xl font-bold mb-4">School Leaderboard</h2>
                    <ul className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <li key={i} className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <span className="font-bold text-neutral-400">#{i}</span>
                                    <span className="font-medium">Green Valley High</span>
                                </div>
                                <div className="font-bold text-primary">120k XP</div>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl shadow-sm border border-neutral-100 dark:border-neutral-800">
                    <h2 className="text-xl font-bold mb-4">Recent Activities</h2>
                    <div className="space-y-4">
                        <div className="text-sm">
                            <span className="font-bold">New School Joined:</span> Springfield Elementary
                        </div>
                        <div className="text-sm">
                            <span className="font-bold">Challenge Created:</span> "No Plastic Week" (Global)
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
