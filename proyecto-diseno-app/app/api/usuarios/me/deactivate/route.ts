import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { randomUUID } from 'crypto';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function POST() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  const user = await prisma.usuarios.findUnique({
    where: { id_usuario: session.userId },
    select: { id_usuario: true, email: true },
  });

  if (!user) {
    return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
  }

  const randomPassword = `${randomUUID()}${randomUUID()}`;
  const hashed = await bcrypt.hash(randomPassword, 10);
  const disabledEmail = `disabled+${user.id_usuario}.${Date.now()}@example.invalid`;

  await prisma.usuarios.update({
    where: { id_usuario: user.id_usuario },
    data: {
      email: disabledEmail,
      contrasena: hashed,
    },
  });

  const cookieStore = await cookies();
  cookieStore.delete('session');

  return NextResponse.json({ success: true });
}
