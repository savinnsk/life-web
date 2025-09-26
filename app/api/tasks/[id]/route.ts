import { authenticateRequest } from '@/lib/auth';
import { dbMethods } from '@/lib/database';
import { NextRequest, NextResponse } from 'next/server';

// GET - Buscar tarefa específica
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const user = await authenticateRequest(request);
        if (!user) {
            return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
        }

        const task = await dbMethods.get(
            `SELECT *
             FROM tasks
             WHERE id = ? AND user_id = ?`,
            [params.id, user.id]
        );

        if (!task) {
            return NextResponse.json({ error: 'Tarefa não encontrada' }, { status: 404 });
        }

        return NextResponse.json(task);
    } catch (error) {
        console.error('Erro ao buscar tarefa:', error);
        return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
    }
}

// PUT - Atualizar tarefa
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const user = await authenticateRequest(request);
        if (!user) {
            return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
        }

        const body = await request.json();
        const { title, description, tags, status, priority, due_date } = body;

        if (!title) {
            return NextResponse.json({ error: 'Título é obrigatório' }, { status: 400 });
        }

        // Se mudou para completed, definir completed_at
        const completed_at = status === 'completed' ? new Date().toISOString() : null;

        await dbMethods.run(
            `UPDATE tasks
             SET title = ?, description = ?, tags = ?, status = ?, priority = ?, due_date = ?, completed_at = ?, updated_at = CURRENT_TIMESTAMP
             WHERE id = ? AND user_id = ?`,
            [title, description || null, tags || null, status || 'pending', priority || 'medium', due_date || null, completed_at, params.id, user.id]
        );

        return NextResponse.json({ message: 'Tarefa atualizada com sucesso' });
    } catch (error) {
        console.error('Erro ao atualizar tarefa:', error);
        return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
    }
}

// DELETE - Deletar tarefa
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const user = await authenticateRequest(request);
        if (!user) {
            return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
        }

        await dbMethods.run(
            'DELETE FROM tasks WHERE id = ? AND user_id = ?',
            [params.id, user.id]
        );

        return NextResponse.json({ message: 'Tarefa deletada com sucesso' });
    } catch (error) {
        console.error('Erro ao deletar tarefa:', error);
        return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
    }
}
