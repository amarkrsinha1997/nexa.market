import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { AuthService, ApiError } from "@/lib/services/auth.service";

// GET /api/users - Admin only: List all users
export async function GET(req: NextRequest) {
    try {
        const user = await AuthService.authenticate(req);
        AuthService.isAdminOrThrowError(user); // Ensure only admins can list all users

        const users = await prisma.user.findMany();
        return NextResponse.json(users);
    } catch (error: any) {
        if (error instanceof ApiError) {
            return NextResponse.json({ error: error.message }, { status: error.statusCode });
        }
        return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }
}

// POST /api/users - Admin Create
export async function POST(req: NextRequest) {
    try {
        const user = await AuthService.authenticate(req);
        AuthService.isAdminOrThrowError(user);

        const body = await req.json();
        const { email, name, role } = body;
        const newUser = await prisma.user.create({
            data: {
                email,
                name,
                role: role || 'USER',
            },
        });
        return NextResponse.json(newUser);
    } catch (error: any) {
        if (error instanceof ApiError) {
            return NextResponse.json({ error: error.message }, { status: error.statusCode });
        }
        return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
    }
}
