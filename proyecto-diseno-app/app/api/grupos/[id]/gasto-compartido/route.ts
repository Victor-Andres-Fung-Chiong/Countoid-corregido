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
  return parts[parts.length - 2];
}

export async function POST(
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
      select: {
        id_creador: true,
        grupo_usuarios: { select: { id_usuario: true, rol: true } },
      },
    });

    if (!grupo) {
      return NextResponse.json({ error: 'Grupo no encontrado' }, { status: 404 });
    }

    const isAdmin =
      grupo.id_creador === session.userId ||
      grupo.grupo_usuarios.some(
        (member) => member.id_usuario === session.userId && member.rol === 'admin'
      );

    if (!isAdmin) {
      return NextResponse.json({ error: 'No autorizado para registrar gastos' }, { status: 403 });
    }

    const { monto, fecha, id_categoria, descripcion, metodo } = await request.json();

    if (!monto || !id_categoria || !metodo) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 });
    }

    const montoNum = parseFloat(monto);
    if (Number.isNaN(montoNum) || montoNum <= 0) {
      return NextResponse.json({ error: 'Monto invalido' }, { status: 400 });
    }

    const categoria = await prisma.categorias.findFirst({
      where: { id_categoria: Number(id_categoria), id_usuario: session.userId },
    });

    if (!categoria) {
      return NextResponse.json({ error: 'Categoria no encontrada' }, { status: 404 });
    }

    const cuenta = await prisma.cuentas.findFirst({
      where: { id_usuario: session.userId },
    });

    if (!cuenta) {
      return NextResponse.json({ error: 'No se encontro una cuenta para el usuario' }, { status: 404 });
    }

    const memberIds = Array.from(
      new Set(grupo.grupo_usuarios.map((member) => member.id_usuario))
    );

    if (memberIds.length === 0) {
      return NextResponse.json({ error: 'El grupo no tiene miembros' }, { status: 400 });
    }

    const perPerson = Number((montoNum / memberIds.length).toFixed(2));

    await prisma.$transaction(async (tx) => {
      const transaccion = await tx.transacciones.create({
        data: {
          id_usuario: session.userId,
          id_cuenta: cuenta.id_cuenta,
          id_categoria: Number(id_categoria),
          tipo: 'Gasto',
          metodo,
          monto: montoNum,
          descripcion: descripcion || null,
          fecha: fecha ? new Date(fecha) : new Date(),
          es_compartido: true,
        },
      });

      const gastoCompartido = await tx.gasto_compartido.create({
        data: {
          id_transaccion: transaccion.id_transaccion,
          id_grupo: groupId,
        },
      });

      await tx.division_gasto.createMany({
        data: memberIds.map((id_usuario) => ({
          id_gasto: gastoCompartido.id_gasto,
          id_usuario,
          monto: perPerson,
          pagado: false,
        })),
      });

      await tx.cuentas.update({
        where: { id_cuenta: cuenta.id_cuenta },
        data: {
          saldo_actual: { decrement: montoNum },
        },
      });
    });

    return NextResponse.json({
      success: true,
      split: {
        total: montoNum,
        perPerson,
        members: memberIds.length,
      },
    }, { status: 201 });
  } catch (err) {
    console.error('Error al crear gasto compartido:', err);
    return NextResponse.json({ error: 'Error en el servidor' }, { status: 500 });
  }
}
