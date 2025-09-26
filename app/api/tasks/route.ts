import { authenticateRequest } from '@/lib/auth';
import { dbMethods } from '@/lib/database';
import { NextRequest, NextResponse } from 'next/server';

// GET - Buscar tarefas
export async function GET(request: NextRequest) {
    try {
        const user = await authenticateRequest(request);
        if (!user) {
            return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const priority = searchParams.get('priority');
        const category = searchParams.get('category');

        let query = `
            SELECT *
            FROM tasks
            WHERE user_id = ?
        `;
        const params: any[] = [user.id];

        if (status && status !== 'all') {
            query += ' AND status = ?';
            params.push(status);
        }

        if (priority && priority !== 'all') {
            query += ' AND priority = ?';
            params.push(priority);
        }

        if (category && category !== 'all') {
            query += ' AND tags LIKE ?';
            params.push(`%${category}%`);
        }

        query += ' ORDER BY priority DESC, due_date ASC, created_at DESC';

        const tasks = await dbMethods.all(query, params);

        return NextResponse.json(tasks);
    } catch (error) {
        console.error('Erro ao buscar tarefas:', error);
        return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
    }
}

// POST - Criar tarefa
export async function POST(request: NextRequest) {
    try {
        const user = await authenticateRequest(request);
        if (!user) {
            return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
        }

        const body = await request.json();
        const { title, description, tags, priority, due_date } = body;

        if (!title) {
            return NextResponse.json({ error: 'Título é obrigatório' }, { status: 400 });
        }

        const result = await dbMethods.runWithId(
            `INSERT INTO tasks (user_id, title, description, tags, priority, due_date)
             VALUES (?, ?, ?, ?, ?, ?)`,
            user.id, title, description || null, tags || null, priority || 'medium', due_date || null
        );

        return NextResponse.json({ id: result.lastID, message: 'Tarefa criada com sucesso' });
    } catch (error) {
        console.error('Erro ao criar tarefa:', error);
        return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
    }
}
