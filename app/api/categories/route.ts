import { authenticateRequest } from '@/lib/auth';
import { dbMethods } from '@/lib/database';
import { NextRequest, NextResponse } from 'next/server';

// GET - Buscar categorias
export async function GET(request: NextRequest) {
    try {
        const user = await authenticateRequest(request);
        if (!user) {
            return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type');
        const month = searchParams.get('month');
        const year = searchParams.get('year');

        // Se month e year foram fornecidos, retornar dados de gastos por categoria
        if (month && year) {
            const query = `
                SELECT
                    t.category,
                    c.color,
                    SUM(t.amount) as total,
                    ROUND((SUM(t.amount) * 100.0 / (SELECT SUM(amount) FROM transactions WHERE user_id = ? AND type = 'expense' AND strftime('%m', date) = ? AND strftime('%Y', date) = ?)), 2) as percentage
                FROM transactions t
                LEFT JOIN categories c ON t.category = c.name AND c.user_id = t.user_id
                WHERE t.user_id = ? AND t.type = 'expense'
                AND strftime('%m', t.date) = ?
                AND strftime('%Y', t.date) = ?
                AND (t.is_parceled = 0 OR t.is_parceled IS NULL)
                GROUP BY t.category, c.color
                ORDER BY total DESC
            `;

            const params = [user.id, month.padStart(2, '0'), year, user.id, month.padStart(2, '0'), year];
            const categories = await dbMethods.all(query, params);

            return NextResponse.json(categories);
        }

        // Buscar categorias normais
        let query = 'SELECT * FROM categories WHERE user_id = ?';
        const params: (string | number)[] = [user.id];

        if (type) {
            query += ' AND type = ?';
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
        const user = await authenticateRequest(request);
        if (!user) {
            return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
        }

        const body = await request.json();
        const { name, type, color } = body;

        if (!name || !type) {
            return NextResponse.json({ error: 'Nome e tipo são obrigatórios' }, { status: 400 });
        }

        const result = await dbMethods.runWithId(
            `INSERT INTO categories (user_id, name, type, color)
       VALUES (?, ?, ?, ?)`,
            user.id, name, type, color || '#3b82f6'
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
