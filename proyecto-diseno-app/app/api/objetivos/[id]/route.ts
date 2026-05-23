import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const { id } = await params;
    const idObj = parseInt(id);
    if (isNaN(idObj)) return NextResponse.json({ error: 'ID inválido' }, { status: 400 });

    const objetivo = await prisma.objetivos.findFirst({
      where: { id_objetivo: idObj, id_usuario: session.userId },
    });

    if (!objetivo) return NextResponse.json({ error: 'Objetivo no encontrado' }, { status: 404 });

    await prisma.objetivos.delete({ where: { id_objetivo: idObj } });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error al eliminar objetivo:', err);
    return NextResponse.json({ error: 'Error en el servidor' }, { status: 500 });
  }
}
