'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
    { href: '/student', label: 'My Dashboard', icon: '🏠', roles: ['student'] },
    { href: '/student/learn', label: 'Learning Modules', icon: '📚', roles: ['student'] },
    { href: '/student/tasks', label: 'Eco Tasks', icon: '📸', roles: ['student'] },
    { href: '/leaderboard', label: 'Leaderboard', icon: '🏆', roles: ['student', 'teacher', 'admin'] },

    { href: '/teacher', label: 'Teacher Dashboard', icon: '👨‍🏫', roles: ['teacher'] },
    { href: '/teacher/verify', label: 'Verify Tasks', icon: '✅', roles: ['teacher'] },

    { href: '/admin', label: 'Admin Panel', icon: '⚙️', roles: ['admin'] },
];

export default function Sidebar() {
    const pathname = usePathname();
    // In a real app, we would get the user role from auth context
    // For demo, we show all links or simulate a role
    const currentRole = 'student'; // Temporary hardcoded role for visual check

    return (
        <aside className="w-64 bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 h-screen fixed left-0 top-0 overflow-y-auto">
            <div className="p-6">
                <Link href="/" className="text-2xl font-bold text-primary flex items-center gap-2">
                    <span>🌿</span>
                    <span>Vedax</span>
                </Link>
            </div>

            <nav className="px-4 space-y-2 mt-4">
                {links.map((link) => (
                    <Link
                        key={link.href}
                        href={link.href}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${pathname === link.href
                            ? 'bg-primary/10 text-primary font-medium'
                            : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                            }`}
                    >
                        <span>{link.icon}</span>
                        <span>{link.label}</span>
                    </Link>
                ))}
            </nav>

            <div className="absolute bottom-0 w-full p-4 border-t border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                        JD
                    </div>
                    <div>
                        <div className="text-sm font-medium">John Doe</div>
                        <div className="text-xs text-neutral-500">Student</div>
                    </div>
                </div>
            </div>
        </aside>
    );
}
