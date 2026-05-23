import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { tipo, monto, fecha, id_categoria, descripcion, metodo } = await request.json();

    if (!tipo || !monto || !id_categoria || !metodo) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 });
    }

    if (tipo !== 'Ingreso' && tipo !== 'Gasto') {
      return NextResponse.json({ error: 'Tipo inválido' }, { status: 400 });
    }

    const montoNum = parseFloat(monto);
    if (isNaN(montoNum) || montoNum <= 0) {
      return NextResponse.json({ error: 'Monto inválido' }, { status: 400 });
    }

    const cuenta = await prisma.cuentas.findFirst({
      where: { id_usuario: session.userId },
    });

    if (!cuenta) {
      return NextResponse.json({ error: 'No se encontró una cuenta para el usuario' }, { status: 404 });
    }

    const categoria = await prisma.categorias.findFirst({
      where: { id_categoria: Number(id_categoria), id_usuario: session.userId },
    });

    if (!categoria) {
      return NextResponse.json({ error: 'Categoría no encontrada o no pertenece al usuario' }, { status: 404 });
    }

    const transaccion = await prisma.transacciones.create({
      data: {
        id_usuario: session.userId,
        id_cuenta: cuenta.id_cuenta,
        id_categoria: Number(id_categoria),
        tipo,
        metodo,
        monto: montoNum,
        descripcion: descripcion || null,
        fecha: fecha ? new Date(fecha) : new Date(),
        es_compartido: false,
      },
    });

    await prisma.cuentas.update({
      where: { id_cuenta: cuenta.id_cuenta },
      data: {
        saldo_actual: { increment: tipo === 'Ingreso' ? montoNum : -montoNum },
      },
    });

    return NextResponse.json({ success: true, transaccion }, { status: 201 });
  } catch (err) {
    console.error('Error al crear transacción:', err);
    return NextResponse.json({ error: 'Error en el servidor' }, { status: 500 });
  }
}
