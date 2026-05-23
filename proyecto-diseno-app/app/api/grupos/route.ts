import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { nombre, descripcion, miembros } = await request.json();

    if (!nombre || !nombre.trim()) {
      return NextResponse.json({ error: 'El nombre del grupo es requerido' }, { status: 400 });
    }

    const memberIds = Array.isArray(miembros) ? miembros : [];
    const normalizedIds = memberIds
      .map((code: string) => String(code).trim())
      .map((code: string) => code.replace(/^U/i, ''))
      .map((id: string) => Number(id))
      .filter((id: number) => Number.isInteger(id) && id > 0 && id !== session.userId);

    const uniqueIds = Array.from(new Set(normalizedIds));

    const users = uniqueIds.length
      ? await prisma.usuarios.findMany({
          where: { id_usuario: { in: uniqueIds } },
          select: { id_usuario: true },
        })
      : [];

    if (uniqueIds.length && users.length !== uniqueIds.length) {
      const foundIds = new Set(users.map((u) => u.id_usuario));
      const missing = uniqueIds.filter((id) => !foundIds.has(id));
      return NextResponse.json(
        { error: `Codigos no encontrados: ${missing.map((id) => `U${id}`).join(', ')}` },
        { status: 400 }
      );
    }

    const grupo = await prisma.grupos.create({
      data: {
        nombre: nombre.trim(),
        descripcion: descripcion?.trim() || null,
        id_creador: session.userId,
        grupo_usuarios: {
          create: [
            { id_usuario: session.userId, rol: 'admin' },
            ...uniqueIds.map((id_usuario) => ({ id_usuario, rol: 'miembro' })),
          ],
        },
      },
      select: {
        id_group: true,
        nombre: true,
        descripcion: true,
        fecha_creacion: true,
      },
    });

    return NextResponse.json({ success: true, grupo }, { status: 201 });
  } catch (err) {
    console.error('Error al crear grupo:', err);
    return NextResponse.json({ error: 'Error en el servidor' }, { status: 500 });
  }
}
