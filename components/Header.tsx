'use client';

import { ArrowLeft, Menu, Plus, Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';
import ThemeToggle from './ThemeToggle';

interface HeaderProps {
    title: string;
    showBack?: boolean;
    showAdd?: boolean;
    onAddClick?: () => void;
    onBackClick?: () => void;
    onMenuClick?: () => void;
}

export default function Header({
    title,
    showBack = false,
    showAdd = false,
    onAddClick,
    onBackClick,
    onMenuClick
}: HeaderProps) {
    const router = useRouter();

    return (
        <header className="sticky top-0 z-50 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 px-4 py-3 -mx-4 mb-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    {showBack && (
                        <button
                            onClick={onBackClick || (() => router.back())}
                            className="p-2 -ml-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 active:bg-gray-200 dark:active:bg-gray-700 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        </button>
                    )}
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h1>
                </div>

                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => router.push('/settings')}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600 transition-colors"
                    >
                        <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </button>
                    <ThemeToggle />
                    {showAdd && (
                        <button
                            onClick={onAddClick}
                            className="p-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-700 transition-colors"
                        >
                            <Plus className="w-5 h-5" />
                        </button>
                    )}
                    {onMenuClick && (
                        <button
                            onClick={onMenuClick}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600 transition-colors"
                        >
                            <Menu className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
}
