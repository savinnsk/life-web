'use client';

import { Filter, Search, X } from 'lucide-react';
import { useState } from 'react';

interface NoteFiltersProps {
    onFilterChange: (filters: {
        search: string;
        tag: string;
    }) => void;
    currentFilters: {
        search: string;
        tag: string;
    };
}

export default function NoteFilters({ onFilterChange, currentFilters }: NoteFiltersProps) {
    const [showFilters, setShowFilters] = useState(false);

    const handleFilterChange = (key: string, value: string) => {
        onFilterChange({
            ...currentFilters,
            [key]: value
        });
    };

    const clearFilters = () => {
        onFilterChange({
            search: '',
            tag: 'all'
        });
    };

    const hasActiveFilters = currentFilters.search || (currentFilters.tag && currentFilters.tag !== 'all');

    return (
        <div className="space-y-4">
            {/* Barra de busca e filtros */}
            <div className="flex items-center space-x-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar anotações..."
                        value={currentFilters.search}
                        onChange={(e) => handleFilterChange('search', e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-slate-100"
                    />
                </div>
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`px-4 py-2 rounded-lg border transition-colors ${showFilters || hasActiveFilters
                        ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-600'
                        }`}
                >
                    <Filter className="w-4 h-4" />
                </button>
            </div>

            {/* Filtros expandidos */}
            {showFilters && (
                <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="font-medium text-gray-900 dark:text-slate-100">Filtros</h3>
                        {hasActiveFilters && (
                            <button
                                onClick={clearFilters}
                                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center"
                            >
                                <X className="w-4 h-4 mr-1" />
                                Limpar
                            </button>
                        )}
                    </div>

                    {/* Filtro por tag */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                            Filtrar por tag
                        </label>
                        <input
                            type="text"
                            placeholder="Digite uma tag para filtrar"
                            value={currentFilters.tag === 'all' ? '' : currentFilters.tag}
                            onChange={(e) => handleFilterChange('tag', e.target.value || 'all')}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-slate-100"
                        />
                        <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                            Deixe vazio para mostrar todas as anotações
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
