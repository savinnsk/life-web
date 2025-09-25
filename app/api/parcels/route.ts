import { dbMethods } from '@/lib/database';
import { NextRequest, NextResponse } from 'next/server';

// GET - Buscar parcelas
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const month = searchParams.get('month');
        const year = searchParams.get('year');
        const status = searchParams.get('status'); // 'pending', 'overdue', 'all'

        let query = `
      SELECT
        t.*,
        c.color as category_color
      FROM transactions t
      LEFT JOIN categories c ON t.category = c.name
      WHERE t.is_parceled = 1 AND t.parent_transaction_id IS NOT NULL
    `;

        const params: (string | number)[] = [];

        if (month && year) {
            query += ` AND strftime('%m', t.date) = ? AND strftime('%Y', t.date) = ?`;
            params.push(month.padStart(2, '0'), year);
        }

        if (status === 'pending') {
            query += ` AND t.date >= date('now')`;
        } else if (status === 'overdue') {
            query += ` AND t.date < date('now')`;
        }

        query += ` ORDER BY t.date ASC`;

        const parcels = await dbMethods.all(query, params);

        return NextResponse.json(parcels);
    } catch (error) {
        console.error('Erro ao buscar parcelas:', error);
        return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
    }
}

// PUT - Marcar parcela como paga
export async function PUT(request: NextRequest) {
    try {
        const { id, paid } = await request.json();

        if (!id || typeof paid !== 'boolean') {
            return NextResponse.json({ error: 'ID e status são obrigatórios' }, { status: 400 });
        }

        await dbMethods.runWithId(
            `UPDATE transactions
       SET paid = ?, paid_at = ?
       WHERE id = ?`,
            paid ? 1 : 0,
            paid ? new Date().toISOString() : null,
            id
        );

        return NextResponse.json({ message: 'Parcela atualizada com sucesso' });
    } catch (error) {
        console.error('Erro ao atualizar parcela:', error);
        return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
    }
}
