import { generateToken, getUserByUsername, verifyPassword } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const { username, password } = await request.json();

        if (!username || !password) {
            return NextResponse.json(
                { error: 'Username e senha são obrigatórios' },
                { status: 400 }
            );
        }

        // Buscar usuário
        const user = await getUserByUsername(username);
        if (!user) {
            return NextResponse.json(
                { error: 'Username ou senha incorretos' },
                { status: 401 }
            );
        }

        // Verificar senha
        const isValidPassword = await verifyPassword(password, user.password);
        if (!isValidPassword) {
            return NextResponse.json(
                { error: 'Username ou senha incorretos' },
                { status: 401 }
            );
        }

        // Gerar token
        const token = generateToken({
            id: user.id,
            username: user.username,
            name: user.name,
            created_at: user.created_at
        });

        return NextResponse.json({
            token,
            user: {
                id: user.id,
                username: user.username,
                name: user.name
            }
        });
    } catch (error) {
        console.error('Erro no login:', error);
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        );
    }
}
