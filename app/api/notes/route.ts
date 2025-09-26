import { authenticateRequest } from '@/lib/auth';
import { dbMethods } from '@/lib/database';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const user = await authenticateRequest(request);
        if (!user) {
            return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search');
        const tag = searchParams.get('tag');

        let query = 'SELECT * FROM notes WHERE user_id = ?';
        const params: any[] = [user.id];

        if (search) {
            query += ' AND (title LIKE ? OR content LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }

        if (tag && tag !== 'all') {
            query += ' AND tags LIKE ?';
            params.push(`%${tag}%`);
        }

        query += ' ORDER BY updated_at DESC';

        const notes = await dbMethods.all(query, params);

        return NextResponse.json(notes);
    } catch (error) {
        console.error('Erro ao buscar anotações:', error);
        return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const user = await authenticateRequest(request);
        if (!user) {
            return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
        }

        const body = await request.json();
        const { title, content, tags, color } = body;

        if (!title) {
            return NextResponse.json({ error: 'Título é obrigatório' }, { status: 400 });
        }

        const result = await dbMethods.runWithId(
            `INSERT INTO notes (user_id, title, content, tags, color)
             VALUES (?, ?, ?, ?, ?)`,
            user.id, title, content || null, tags || null, color || '#3b82f6'
        );

        return NextResponse.json({ id: result.lastID, message: 'Anotação criada com sucesso' });
    } catch (error) {
        console.error('Erro ao criar anotação:', error);
        return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
    }
}
