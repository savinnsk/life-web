'use client';

import BottomNavigation from '@/components/BottomNavigation';
import NoteCard from '@/components/NoteCard';
import NoteFilters from '@/components/NoteFilters';
import NoteForm from '@/components/NoteForm';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { Note } from '@/lib/types';
import { AlertTriangle, BarChart3, CheckCircle2, CreditCard, Home, Plus, Settings, StickyNote } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function NotesPage() {
    const { user } = useAuth();
    const [notes, setNotes] = useState<Note[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingNote, setEditingNote] = useState<Note | null>(null);
    const [filters, setFilters] = useState({
        search: '',
        tag: 'all'
    });

    useEffect(() => {
        if (user) {
            fetchNotes();
        }
    }, [filters, user]);

    const fetchNotes = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filters.search) params.append('search', filters.search);
            if (filters.tag && filters.tag !== 'all') params.append('tag', filters.tag);

            const response = await fetch(`/api/notes?${params.toString()}`, {
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                setNotes(data);
            }
        } catch (error) {
            console.error('Erro ao buscar anotações:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveNote = async (noteData: Partial<Note>) => {
        try {
            const url = editingNote ? `/api/notes/${editingNote.id}` : '/api/notes';
            const method = editingNote ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(noteData)
            });

            if (response.ok) {
                await fetchNotes();
                setShowForm(false);
                setEditingNote(null);
            } else {
                const errorData = await response.json();
                alert(`Erro ao salvar anotação: ${errorData.error || 'Erro desconhecido'}`);
            }
        } catch (error) {
            console.error('Erro ao salvar anotação:', error);
            alert('Erro ao salvar anotação. Tente novamente.');
        }
    };

    const handleEditNote = (note: Note) => {
        setEditingNote(note);
        setShowForm(true);
    };

    const handleDeleteNote = async (id: number) => {
        if (!confirm('Tem certeza que deseja excluir esta anotação?')) return;

        try {
            const response = await fetch(`/api/notes/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (response.ok) {
                await fetchNotes();
            }
        } catch (error) {
            console.error('Erro ao excluir anotação:', error);
        }
    };

    const filteredNotes = notes.filter(note => {
        const matchesSearch = !filters.search ||
            note.title.toLowerCase().includes(filters.search.toLowerCase()) ||
            (note.content && note.content.toLowerCase().includes(filters.search.toLowerCase()));

        const matchesTag = !filters.tag || filters.tag === 'all' ||
            (note.tags && note.tags.toLowerCase().includes(filters.tag.toLowerCase()));

        return matchesSearch && matchesTag;
    });

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
                {/* Layout Desktop */}
                <div className="hidden lg:flex min-h-screen">
                    {/* Sidebar */}
                    <div className="w-64 bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 flex flex-col">
                        <div className="p-6 border-b border-gray-200 dark:border-slate-700">
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100 flex items-center">
                                <StickyNote className="w-6 h-6 mr-2 text-blue-600" />
                                Anotações
                            </h1>
                            <p className="text-gray-600 dark:text-slate-400 text-sm mt-1">
                                Suas ideias e lembretes
                            </p>
                        </div>

                        <nav className="flex-1 p-4">
                            <div className="space-y-1">
                                <a href="/" className="flex items-center px-3 py-2 text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                                    <Home className="w-5 h-5 mr-3" />
                                    Home
                                </a>
                                <a href="/summary" className="flex items-center px-3 py-2 text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                                    <BarChart3 className="w-5 h-5 mr-3" />
                                    Resumos
                                </a>
                                <a href="/parcels" className="flex items-center px-3 py-2 text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                                    <CreditCard className="w-5 h-5 mr-3" />
                                    Parcelas
                                </a>
                                <a href="/limbo" className="flex items-center px-3 py-2 text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                                    <AlertTriangle className="w-5 h-5 mr-3" />
                                    Limbo
                                </a>
                                <a href="/tasks" className="flex items-center px-3 py-2 text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                                    <CheckCircle2 className="w-5 h-5 mr-3" />
                                    Tarefas
                                </a>
                                <a href="/notes" className="flex items-center px-3 py-2 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                    <StickyNote className="w-5 h-5 mr-3" />
                                    Anotações
                                </a>
                                <a href="/settings" className="flex items-center px-3 py-2 text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                                    <Settings className="w-5 h-5 mr-3" />
                                    Configurações
                                </a>
                            </div>
                        </nav>

                        <div className="p-4 border-t border-gray-200 dark:border-slate-700">
                            <button
                                onClick={() => setShowForm(true)}
                                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Nova Anotação
                            </button>
                        </div>
                    </div>

                    {/* Conteúdo Principal */}
                    <div className="flex-1 p-6">
                        <div className="max-w-4xl mx-auto">
                            <div className="mb-6">
                                <NoteFilters
                                    onFilterChange={setFilters}
                                    currentFilters={filters}
                                />
                            </div>

                            {loading ? (
                                <div className="text-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                                    <p className="text-gray-500 dark:text-slate-400 mt-2">Carregando anotações...</p>
                                </div>
                            ) : filteredNotes.length === 0 ? (
                                <div className="text-center py-12">
                                    <StickyNote className="w-16 h-16 text-gray-400 dark:text-slate-600 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-slate-100 mb-2">
                                        {filters.search || filters.tag !== 'all' ? 'Nenhuma anotação encontrada' : 'Nenhuma anotação ainda'}
                                    </h3>
                                    <p className="text-gray-500 dark:text-slate-400 mb-6">
                                        {filters.search || filters.tag !== 'all'
                                            ? 'Tente ajustar os filtros de busca'
                                            : 'Comece criando sua primeira anotação'
                                        }
                                    </p>
                                    {!filters.search && filters.tag === 'all' && (
                                        <button
                                            onClick={() => setShowForm(true)}
                                            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                                        >
                                            <Plus className="w-4 h-4 mr-2 inline" />
                                            Criar Primeira Anotação
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {filteredNotes.map((note) => (
                                        <NoteCard
                                            key={note.id}
                                            note={note}
                                            onEdit={handleEditNote}
                                            onDelete={handleDeleteNote}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Layout Mobile */}
                <div className="lg:hidden">
                    <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 px-4 py-3 flex items-center justify-between">
                        <h1 className="text-xl font-bold text-gray-900 dark:text-slate-100 flex items-center">
                            <StickyNote className="w-5 h-5 mr-2 text-blue-600" />
                            Anotações
                        </h1>
                        <button
                            onClick={() => setShowForm(true)}
                            className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Plus className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="p-4">
                        <div className="mb-6">
                            <NoteFilters
                                onFilterChange={setFilters}
                                currentFilters={filters}
                            />
                        </div>

                        {loading ? (
                            <div className="text-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                                <p className="text-gray-500 dark:text-slate-400 mt-2">Carregando anotações...</p>
                            </div>
                        ) : filteredNotes.length === 0 ? (
                            <div className="text-center py-12">
                                <StickyNote className="w-16 h-16 text-gray-400 dark:text-slate-600 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 dark:text-slate-100 mb-2">
                                    {filters.search || filters.tag !== 'all' ? 'Nenhuma anotação encontrada' : 'Nenhuma anotação ainda'}
                                </h3>
                                <p className="text-gray-500 dark:text-slate-400 mb-6">
                                    {filters.search || filters.tag !== 'all'
                                        ? 'Tente ajustar os filtros de busca'
                                        : 'Comece criando sua primeira anotação'
                                    }
                                </p>
                                {!filters.search && filters.tag === 'all' && (
                                    <button
                                        onClick={() => setShowForm(true)}
                                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        <Plus className="w-4 h-4 mr-2 inline" />
                                        Criar Primeira Anotação
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {filteredNotes.map((note) => (
                                    <NoteCard
                                        key={note.id}
                                        note={note}
                                        onEdit={handleEditNote}
                                        onDelete={handleDeleteNote}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Bottom Navigation apenas no mobile */}
                    <div className="lg:hidden">
                        <BottomNavigation />
                    </div>
                </div>

                {/* Formulário */}
                <NoteForm
                    isOpen={showForm || !!editingNote}
                    onClose={() => {
                        setShowForm(false);
                        setEditingNote(null);
                    }}
                    onSave={handleSaveNote}
                    note={editingNote}
                />
            </div>
        </ProtectedRoute>
    );
}
