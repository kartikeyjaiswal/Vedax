'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

const links = [
    { href: '/student', label: 'My Dashboard', icon: '🏠', roles: ['student'] },
    { href: '/student/learn', label: 'Learning Modules', icon: '📚', roles: ['student'] },
    { href: '/student/tasks', label: 'Eco Tasks', icon: '📸', roles: ['student'] },
    { href: '/leaderboard', label: 'Leaderboard', icon: '🏆', roles: ['student', 'teacher', 'admin'] },

    { href: '/teacher', label: 'Teacher Dashboard', icon: '👨‍🏫', roles: ['teacher', 'institution_admin', 'super_admin'] },
    { href: '/teacher/verify', label: 'Verify Tasks', icon: '✅', roles: ['teacher', 'institution_admin'] },

    { href: '/institution', label: 'Institution Admin', icon: '🏛️', roles: ['institution_admin', 'super_admin'] },
    { href: '/admin', label: 'Platform Admin', icon: '⚙️', roles: ['super_admin'] },
];

export default function Sidebar() {
    const pathname = usePathname();
    const { user, logout } = useAuth();
    const currentRole = user?.role || 'guest';

    return (
        <aside className="w-64 bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 h-screen fixed left-0 top-0 overflow-y-auto">
            <div className="p-6">
                <Link href="/" className="text-2xl font-bold text-primary flex items-center gap-2">
                    <span>🌿</span>
                    <span>Vedax</span>
                </Link>
            </div>

            <nav className="px-4 space-y-2 mt-4">
                {links.filter(link => link.roles.includes(currentRole)).map((link) => (
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
                        {(user?.full_name || user?.email || 'GU').substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                        <div className="text-sm font-medium">{user?.full_name || user?.email || 'Guest'}</div>
                        <div className="text-xs text-neutral-500 capitalize">{user?.role?.replace('_', ' ') || 'Visitor'}</div>
                    </div>
                    {user && (
                        <button onClick={logout} className="ml-auto text-xs text-red-500 hover:text-red-700">
                            Logout
                        </button>
                    )}
                </div>
            </div>
        </aside>
    );
}
