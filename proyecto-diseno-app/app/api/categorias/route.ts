import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const categorias = await prisma.categorias.findMany({
      where: { id_usuario: session.userId },
      orderBy: { nombre: 'asc' },
    });

    return NextResponse.json({ categorias });
  } catch (err) {
    console.error('Error al obtener categorías:', err);
    return NextResponse.json({ error: 'Error en el servidor' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { nombre, tipo } = await request.json();

    if (!nombre || !nombre.trim()) {
      return NextResponse.json({ error: 'El nombre de la categoría es requerido' }, { status: 400 });
    }

    const categoria = await prisma.categorias.create({
      data: {
        nombre: nombre.trim(),
        tipo: tipo || 'General',
        id_usuario: session.userId,
      },
    });

    return NextResponse.json({ success: true, categoria }, { status: 201 });
  } catch (err) {
    console.error('Error al crear categoría:', err);
    return NextResponse.json({ error: 'Error en el servidor' }, { status: 500 });
  }
}
