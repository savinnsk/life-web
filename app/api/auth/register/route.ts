import { createUser, generateToken, getUserByUsername } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const { name, username, password } = await request.json();

        if (!name || !username || !password) {
            return NextResponse.json(
                { error: 'Nome, username e senha são obrigatórios' },
                { status: 400 }
            );
        }

        if (password.length < 6) {
            return NextResponse.json(
                { error: 'A senha deve ter pelo menos 6 caracteres' },
                { status: 400 }
            );
        }

        if (username.length < 3) {
            return NextResponse.json(
                { error: 'O username deve ter pelo menos 3 caracteres' },
                { status: 400 }
            );
        }

        // Verificar se username já existe
        const existingUser = await getUserByUsername(username);
        if (existingUser) {
            return NextResponse.json(
                { error: 'Este username já está em uso' },
                { status: 409 }
            );
        }

        // Criar usuário
        const user = await createUser(username, password, name);

        // Gerar token
        const token = generateToken(user);

        return NextResponse.json({
            token,
            user: {
                id: user.id,
                username: user.username,
                name: user.name
            }
        });
    } catch (error) {
        console.error('Erro no registro:', error);
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        );
    }
}
