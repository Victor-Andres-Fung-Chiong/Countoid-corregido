import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const objetivos = await prisma.objetivos.findMany({
      where: { id_usuario: session.userId },
      orderBy: { fecha_creacion: 'desc' },
    });

    return NextResponse.json({ objetivos });
  } catch (err) {
    console.error('Error al obtener objetivos:', err);
    return NextResponse.json({ error: 'Error en el servidor' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const { nombre, icono, monto, fecha_limite } = await request.json();

    if (!nombre?.trim()) return NextResponse.json({ error: 'El nombre es requerido' }, { status: 400 });
    const montoNum = parseFloat(monto);
    if (isNaN(montoNum) || montoNum <= 0) return NextResponse.json({ error: 'Monto inválido' }, { status: 400 });

    const objetivo = await prisma.objetivos.create({
      data: {
        id_usuario: session.userId,
        nombre: nombre.trim(),
        icono: icono || 'Meta',
        monto: montoNum,
        fecha_limite: fecha_limite ? new Date(fecha_limite) : null,
      },
    });

    return NextResponse.json({ objetivo }, { status: 201 });
  } catch (err) {
    console.error('Error al crear objetivo:', err);
    return NextResponse.json({ error: 'Error en el servidor' }, { status: 500 });
  }
}
