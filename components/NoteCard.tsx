'use client';

import { Note } from '@/lib/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
    Edit,
    MoreVertical,
    Tag,
    Trash2
} from 'lucide-react';
import { useState } from 'react';

interface NoteCardProps {
    note: Note;
    onEdit: (note: Note) => void;
    onDelete: (id: number) => void;
}

export default function NoteCard({ note, onEdit, onDelete }: NoteCardProps) {
    const [showActions, setShowActions] = useState(false);

    const formatDate = (date: string) => {
        return format(new Date(date), 'dd/MM/yyyy HH:mm', { locale: ptBR });
    };

    // Parse tags from string
    const noteTags = note.tags ? note.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [];

    return (
        <div
            className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-4 mb-3 transition-all duration-200 hover:shadow-md"
            style={{ borderLeftColor: note.color, borderLeftWidth: '4px' }}
        >
            <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-slate-100 text-lg mb-2">
                        {note.title}
                    </h3>

                    {note.content && (
                        <p className="text-gray-600 dark:text-slate-300 text-sm mb-3 whitespace-pre-wrap">
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
                        onClick={() => setShowActions(!showActions)}
                        className="p-2 text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 transition-colors"
                    >
                        <MoreVertical className="w-4 h-4" />
                    </button>

                    {showActions && (
                        <div className="absolute right-0 top-8 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-lg z-10 min-w-[120px]">
                            <button
                                onClick={() => {
                                    onEdit(note);
                                    setShowActions(false);
                                }}
                                className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 flex items-center"
                            >
                                <Edit className="w-4 h-4 mr-2" />
                                Editar
                            </button>
                            <button
                                onClick={() => {
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
