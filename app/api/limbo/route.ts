import { authenticateRequest } from '@/lib/auth';
import { dbMethods } from '@/lib/database';
import { NextRequest, NextResponse } from 'next/server';

// GET - Buscar dívidas do Limbo
export async function GET(request: NextRequest) {
    try {
        const user = await authenticateRequest(request);
        if (!user) {
            return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
        }

        const debts = await dbMethods.all('SELECT * FROM limbo_debts WHERE user_id = ? ORDER BY created_at DESC', [user.id]);
        return NextResponse.json(debts);
    } catch (error) {
        console.error('Erro ao buscar dívidas do Limbo:', error);
        return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
    }
}

// POST - Criar dívida no Limbo
export async function POST(request: NextRequest) {
    try {
        const user = await authenticateRequest(request);
        if (!user) {
            return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
        }

        const body = await request.json();
        const { description, amount } = body;

        if (!description || !amount) {
            return NextResponse.json({ error: 'Descrição e valor são obrigatórios' }, { status: 400 });
        }

        const result = await dbMethods.runWithId(
            'INSERT INTO limbo_debts (user_id, description, amount) VALUES (?, ?, ?)',
            user.id, description, amount
        );

        return NextResponse.json({ id: result.lastID, message: 'Dívida criada com sucesso' });
    } catch (error) {
        console.error('Erro ao criar dívida:', error);
        return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
    }
}
