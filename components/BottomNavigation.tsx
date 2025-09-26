'use client';

import { AlertTriangle, BarChart3, CheckSquare, CreditCard, Home, Settings, StickyNote } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';

export default function BottomNavigation() {
    const router = useRouter();
    const pathname = usePathname();

    const navItems = [
        { path: '/', icon: Home, label: 'Início' },
        { path: '/summary', icon: BarChart3, label: 'Resumos' },
        { path: '/parcels', icon: CreditCard, label: 'Parcelas' },
        { path: '/limbo', icon: AlertTriangle, label: 'Limbo' },
        { path: '/tasks', icon: CheckSquare, label: 'Tarefas' },
        { path: '/notes', icon: StickyNote, label: 'Anotações' },
        { path: '/settings', icon: Settings, label: 'Config' }
    ];

    const isActive = (path: string) => {
        if (path === '/') {
            return pathname === '/';
        }
        return pathname.startsWith(path);
    };

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-700 z-50">
            <div className="max-w-md mx-auto px-2 pb-safe">
                <div className="grid grid-cols-7 gap-0 py-2">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.path);

                        return (
                            <button
                                key={item.path}
                                onClick={() => router.push(item.path)}
                                className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-colors min-h-[60px] ${active
                                    ? 'text-primary-600 bg-primary-50 dark:bg-primary-600 dark:text-white'
                                    : 'text-gray-500 dark:text-white hover:text-gray-700 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-900'
                                    }`}
                            >
                                <Icon className={`w-5 h-5 mb-1 ${active ? 'text-primary-600' : ''}`} />
                                <span className={`text-xs font-medium leading-tight text-center ${active ? 'text-primary-600' : ''}`}>
                                    {item.label}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
}
