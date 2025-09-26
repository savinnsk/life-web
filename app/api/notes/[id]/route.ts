import { authenticateRequest } from '@/lib/auth';
import { dbMethods } from '@/lib/database';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = await authenticateRequest(request);
        if (!user) {
            return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
        }

        const note = await dbMethods.get(
            'SELECT * FROM notes WHERE id = ? AND user_id = ?',
            [params.id, user.id]
        );

        if (!note) {
            return NextResponse.json({ error: 'Anotação não encontrada' }, { status: 404 });
        }

        return NextResponse.json(note);
    } catch (error) {
        console.error('Erro ao buscar anotação:', error);
        return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
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

        await dbMethods.run(
            `UPDATE notes SET title = ?, content = ?, tags = ?, color = ?, updated_at = CURRENT_TIMESTAMP
             WHERE id = ? AND user_id = ?`,
            [title, content || null, tags || null, color || '#3b82f6', params.id, user.id]
        );

        return NextResponse.json({ message: 'Anotação atualizada com sucesso' });
    } catch (error) {
        console.error('Erro ao atualizar anotação:', error);
        return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = await authenticateRequest(request);
        if (!user) {
            return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
        }

        await dbMethods.run(
            'DELETE FROM notes WHERE id = ? AND user_id = ?',
            [params.id, user.id]
        );

        return NextResponse.json({ message: 'Anotação excluída com sucesso' });
    } catch (error) {
        console.error('Erro ao excluir anotação:', error);
        return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
    }
}
