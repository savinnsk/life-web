import { dbMethods } from '@/lib/database';
import { NextRequest, NextResponse } from 'next/server';

// GET - Buscar categorias
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type');

        let query = 'SELECT * FROM categories';
        const params: (string | number)[] = [];

        if (type) {
            query += ' WHERE type = ?';
            params.push(type);
        }

        query += ' ORDER BY name ASC';

        const categories = await dbMethods.all(query, params);

        return NextResponse.json(categories);
    } catch (error) {
        console.error('Erro ao buscar categorias:', error);
        return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
    }
}

// POST - Criar categoria
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, type, color } = body;

        if (!name || !type) {
            return NextResponse.json({ error: 'Nome e tipo são obrigatórios' }, { status: 400 });
        }

        const result = await dbMethods.runWithId(
            `INSERT INTO categories (name, type, color)
       VALUES (?, ?, ?)`,
            name, type, color || '#3b82f6'
        );

        const categoryId = result.lastID;
        return NextResponse.json({ id: categoryId, message: 'Categoria criada com sucesso' });
    } catch (error: any) {
        if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            return NextResponse.json({ error: 'Categoria já existe' }, { status: 400 });
        }
        console.error('Erro ao criar categoria:', error);
        return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
    }
}
