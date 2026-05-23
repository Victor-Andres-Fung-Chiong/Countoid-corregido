import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { email, contrasena } = await request.json();

    if (!email || !contrasena) {
      return NextResponse.json({ error: 'Correo y contraseña son requeridos' }, { status: 400 });
    }

    if (contrasena.length < 8) {
      return NextResponse.json({ error: 'La contraseña debe tener al menos 8 caracteres' }, { status: 400 });
    }

    const user = await prisma.usuarios.findUnique({ where: { email: email.trim() } });

    if (!user) {
      return NextResponse.json({ error: 'No se encontró una cuenta con ese correo' }, { status: 404 });
    }

    const hashed = await bcrypt.hash(contrasena, 10);

    await prisma.usuarios.update({
      where: { email: email.trim() },
      data: { contrasena: hashed },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error en reset-password:', err);
    return NextResponse.json({ error: 'Error en el servidor' }, { status: 500 });
  }
}
