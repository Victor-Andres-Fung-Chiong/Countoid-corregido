import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id } = await params;
    const idCat = parseInt(id);

    if (isNaN(idCat)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    const categoria = await prisma.categorias.findFirst({
      where: { id_categoria: idCat, id_usuario: session.userId },
    });

    if (!categoria) {
      return NextResponse.json({ error: 'Categoría no encontrada' }, { status: 404 });
    }

    await prisma.categorias.delete({ where: { id_categoria: idCat } });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    // Violación de FK: la categoría tiene transacciones asociadas
    if (err?.code === 'P2003' || err?.code === 'P2014' || err?.message?.includes('REFERENCE')) {
      return NextResponse.json(
        { error: 'Esta categoría tiene transacciones asociadas y no puede eliminarse.' },
        { status: 409 }
      );
    }
    console.error('Error al eliminar categoría:', err);
    return NextResponse.json({ error: 'Error en el servidor' }, { status: 500 });
  }
}
