import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { createSessionToken } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { email, contrasena, recordar } = await request.json();

    if (!email || !contrasena) {
      return NextResponse.json({ error: 'Correo y contraseña son requeridos' }, { status: 400 });
    }

    const user = await prisma.usuarios.findUnique({ where: { email } });
    // Mismo mensaje genérico para no revelar si el correo existe (mejor seguridad)
    if (!user || !(await bcrypt.compare(contrasena, user.contrasena))) {
      return NextResponse.json({ error: 'Credenciales incorrectas' }, { status: 401 });
    }

    const token = await createSessionToken(
      { userId: user.id_usuario, email: user.email },
      recordar ? '30d' : '1d'
    );

    const cookieStore = await cookies();
    cookieStore.set('session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: recordar ? 60 * 60 * 24 * 30 : 60 * 60 * 24,
      path: '/',
    });

    return NextResponse.json({
      success: true,
      user: { id: user.id_usuario, nombre: user.nombre, email: user.email },
    });
  } catch (err) {
    console.error('Error de login:', err);
    return NextResponse.json({ error: 'Error en el servidor' }, { status: 500 });
  }
}