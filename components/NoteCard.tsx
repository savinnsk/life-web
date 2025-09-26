'use client';

import { Note } from '@/lib/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
    Edit,
    MoreVertical,
    Tag,
    Trash2,
    X
} from 'lucide-react';
import { useState } from 'react';

interface NoteCardProps {
    note: Note;
    onEdit: (note: Note) => void;
    onDelete: (id: number) => void;
}

export default function NoteCard({ note, onEdit, onDelete }: NoteCardProps) {
    const [showActions, setShowActions] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    const formatDate = (date: string) => {
        return format(new Date(date), 'dd/MM/yyyy HH:mm', { locale: ptBR });
    };

    // Parse tags from string
    const noteTags = note.tags ? note.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [];

    // Se estiver expandido, mostra modal de leitura
    if (isExpanded) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center p-4">
                <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl">
                    <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 px-6 py-4 flex items-center justify-between rounded-t-2xl">
                        <div className="flex items-center">
                            <div
                                className="w-4 h-4 rounded-full mr-3"
                                style={{ backgroundColor: note.color }}
                            />
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100">
                                {note.title}
                            </h2>
                        </div>
                        <button
                            onClick={() => setIsExpanded(false)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors"
                        >
                            <X className="w-6 h-6 text-gray-500 dark:text-slate-400" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-8">
                        {note.content && (
                            <div className="mb-8">
                                <div className="prose prose-lg max-w-none dark:prose-invert">
                                    <div className="whitespace-pre-wrap leading-relaxed text-gray-900 dark:text-slate-100 text-lg">
                                        {note.content}
                                    </div>
                                </div>
                            </div>
                        )}

                        {noteTags.length > 0 && (
                            <div className="mb-8">
                                <h3 className="text-lg font-semibold text-gray-700 dark:text-slate-300 mb-4">Tags</h3>
                                <div className="flex items-center flex-wrap gap-3">
                                    {noteTags.map((tag, index) => (
                                        <span
                                            key={index}
                                            className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                                        >
                                            <Tag className="w-4 h-4 mr-2" />
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="text-sm text-gray-500 dark:text-slate-400 border-t border-gray-200 dark:border-slate-700 pt-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <span className="font-medium">Criado em:</span> {formatDate(note.created_at)}
                                </div>
                                <div>
                                    <span className="font-medium">Atualizado em:</span> {formatDate(note.updated_at)}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 border-t border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex-shrink-0 rounded-b-2xl">
                        <div className="flex space-x-4">
                            <button
                                onClick={() => {
                                    onEdit(note);
                                    setIsExpanded(false);
                                }}
                                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center font-medium"
                            >
                                <Edit className="w-5 h-5 mr-2" />
                                Editar
                            </button>
                            <button
                                onClick={() => {
                                    onDelete(note.id);
                                    setIsExpanded(false);
                                }}
                                className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center font-medium"
                            >
                                <Trash2 className="w-5 h-5 mr-2" />
                                Excluir
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-4 mb-3 transition-all duration-200 hover:shadow-md cursor-pointer"
            style={{ borderLeftColor: note.color, borderLeftWidth: '4px' }}
            onClick={() => setIsExpanded(true)}
        >
            <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-slate-100 text-lg mb-2">
                        {note.title}
                    </h3>

                    {note.content && (
                        <p className="text-gray-600 dark:text-slate-300 text-sm mb-3 whitespace-pre-wrap line-clamp-3">
                            {note.content}
                        </p>
                    )}

                    {/* Tags */}
                    {noteTags.length > 0 && (
                        <div className="flex items-center flex-wrap gap-2 mb-3">
                            {noteTags.map((tag, index) => (
                                <span
                                    key={index}
                                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                                >
                                    <Tag className="w-3 h-3 mr-1" />
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}

                    <p className="text-xs text-gray-500 dark:text-slate-400">
                        {formatDate(note.updated_at)}
                    </p>
                </div>

                <div className="relative ml-3">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowActions(!showActions);
                        }}
                        className="p-2 text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 transition-colors"
                    >
                        <MoreVertical className="w-4 h-4" />
                    </button>

                    {showActions && (
                        <div className="absolute right-0 top-8 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-lg z-10 min-w-[120px]">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onEdit(note);
                                    setShowActions(false);
                                }}
                                className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 flex items-center"
                            >
                                <Edit className="w-4 h-4 mr-2" />
                                Editar
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete(note.id);
                                    setShowActions(false);
                                }}
                                className="w-full px-3 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-slate-700 flex items-center"
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Excluir
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
