import { authenticateRequest } from '@/lib/auth';
import { dbMethods } from '@/lib/database';
import { NextRequest, NextResponse } from 'next/server';

// GET - Resumo mensal
export async function GET(request: NextRequest) {
    try {
        const user = await authenticateRequest(request);
        if (!user) {
            return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const month = searchParams.get('month');
        const year = searchParams.get('year');

        if (!month || !year) {
            return NextResponse.json({ error: 'Mês e ano são obrigatórios' }, { status: 400 });
        }

        // Resumo do mês
        const monthlySummary = await dbMethods.all(
            `SELECT
        type,
        SUM(amount) as total,
        COUNT(*) as count
      FROM transactions
      WHERE user_id = ? AND strftime('%m', date) = ? AND strftime('%Y', date) = ?
      GROUP BY type`,
            [user.id, month.padStart(2, '0'), year]
        ) as Array<{ type: string; total: number; count: number }>;

        const income = monthlySummary.find(s => s.type === 'income')?.total || 0;
        const expense = monthlySummary.find(s => s.type === 'expense')?.total || 0;
        const incomeCount = monthlySummary.find(s => s.type === 'income')?.count || 0;
        const expenseCount = monthlySummary.find(s => s.type === 'expense')?.count || 0;

        // Transações parceladas pendentes
        const pendingParcels = await dbMethods.all(
            `SELECT
        parent_transaction_id,
        description,
        total_parcels,
        current_parcel,
        amount,
        date,
        type,
        category
      FROM transactions
      WHERE user_id = ? AND is_parceled = 1 AND parent_transaction_id IS NOT NULL
      AND date >= date('now')
      ORDER BY date ASC`,
            [user.id]
        );

        // Categorias mais gastas
        const topCategories = await dbMethods.all(
            `SELECT
        category,
        SUM(amount) as total,
        COUNT(*) as count
      FROM transactions
      WHERE user_id = ? AND type = 'expense'
      AND strftime('%m', date) = ? AND strftime('%Y', date) = ?
      GROUP BY category
      ORDER BY total DESC
      LIMIT 5`,
            [user.id, month.padStart(2, '0'), year]
        );

        return NextResponse.json({
            summary: {
                month: parseInt(month),
                year: parseInt(year),
                totalIncome: income,
                totalExpense: expense,
                balance: income - expense,
                incomeCount,
                expenseCount,
                transactionCount: incomeCount + expenseCount
            },
            pendingParcels,
            topCategories
        });
    } catch (error) {
        console.error('Erro ao buscar resumo:', error);
        return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
    }
}
