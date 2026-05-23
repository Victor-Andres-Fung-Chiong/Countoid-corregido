import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

function parseGroupId(raw: string | undefined | null) {
  if (!raw) return null;
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function resolveGroupIdFromUrl(request: Request) {
  const { pathname } = new URL(request.url);
  const parts = pathname.split('/').filter(Boolean);
  return parts[parts.length - 1];
}

export async function PUT(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const params = await context.params;
    const groupId =
      parseGroupId(params?.id) ?? parseGroupId(resolveGroupIdFromUrl(request));
    if (!groupId) {
      return NextResponse.json({ error: 'Grupo invalido' }, { status: 400 });
    }

    const grupo = await prisma.grupos.findUnique({
      where: { id_group: groupId },
      select: { id_creador: true },
    });

    if (!grupo) {
      return NextResponse.json({ error: 'Grupo no encontrado' }, { status: 404 });
    }

    if (grupo.id_creador !== session.userId) {
      return NextResponse.json({ error: 'No autorizado para editar' }, { status: 403 });
    }

    const { nombre, descripcion } = await request.json();
    if (!nombre || !nombre.trim()) {
      return NextResponse.json({ error: 'El nombre del grupo es requerido' }, { status: 400 });
    }

    const updated = await prisma.grupos.update({
      where: { id_group: groupId },
      data: {
        nombre: nombre.trim(),
        descripcion: descripcion?.trim() || null,
      },
      select: {
        id_group: true,
        nombre: true,
        descripcion: true,
      },
    });

    return NextResponse.json({
      success: true,
      grupo: {
        id: updated.id_group,
        nombre: updated.nombre,
        descripcion: updated.descripcion ?? '',
      },
    });
  } catch (err) {
    console.error('Error al actualizar grupo:', err);
    return NextResponse.json({ error: 'Error en el servidor' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const params = await context.params;
    const groupId =
      parseGroupId(params?.id) ?? parseGroupId(resolveGroupIdFromUrl(request));
    if (!groupId) {
      return NextResponse.json({ error: 'Grupo invalido' }, { status: 400 });
    }

    const grupo = await prisma.grupos.findUnique({
      where: { id_group: groupId },
      select: { id_creador: true },
    });

    if (!grupo) {
      return NextResponse.json({ error: 'Grupo no encontrado' }, { status: 404 });
    }

    if (grupo.id_creador !== session.userId) {
      return NextResponse.json({ error: 'No autorizado para eliminar' }, { status: 403 });
    }

    await prisma.$transaction([
      prisma.division_gasto.deleteMany({
        where: { gasto_compartido: { id_grupo: groupId } },
      }),
      prisma.gasto_compartido.deleteMany({
        where: { id_grupo: groupId },
      }),
      prisma.grupo_usuarios.deleteMany({
        where: { id_grupo: groupId },
      }),
      prisma.grupos.delete({ where: { id_group: groupId } }),
    ]);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error al eliminar grupo:', err);
    return NextResponse.json({ error: 'Error en el servidor' }, { status: 500 });
  }
}
