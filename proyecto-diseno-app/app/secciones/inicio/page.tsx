import { redirect } from 'next/navigation';
import { prisma } from '../../../lib/prisma';
import { getSession } from '@/lib/auth';
import { CategoryData } from '../../../components/CategoryExpenses';
import InicioClient from './InicioClient';

function calcularPorcentajeCambio(actual: number, anterior: number): string {
  if (anterior === 0) return actual > 0 ? '+100%' : '0%';
  const cambio = ((actual - anterior) / anterior) * 100;
  const signo = cambio >= 0 ? '+' : '';
  return `${signo}${cambio.toFixed(1)}%`;
}

export default async function InicioPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const USER_ID = session.userId;

  const user = await prisma.usuarios.findUnique({
    where: { id_usuario: USER_ID },
    select: { nombre: true },
  });
  if (!user) redirect('/login');

  // Rangos de fecha: mes actual y mes anterior
  const ahora = new Date();
  const inicioMesActual = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
  const finMesActual = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 0, 23, 59, 59, 999);
  const inicioMesAnterior = new Date(ahora.getFullYear(), ahora.getMonth() - 1, 1);
  const finMesAnterior = new Date(ahora.getFullYear(), ahora.getMonth(), 0, 23, 59, 59, 999);

  const [
    userTransactions,
    aggregateCuentas,
    aggregateIngresosMes,
    aggregateGastosMes,
    aggregateIngresosMesAnterior,
    aggregateGastosMesAnterior,
    gastosMes,
    categorias,
    grupoMembership,
  ] = await Promise.all([
    // Últimas 5 transacciones (sin filtro de fecha, para mostrar las más recientes)
    prisma.transacciones.findMany({
      where: { id_usuario: USER_ID },
      orderBy: { fecha: 'desc' },
      take: 5,
    }),
    // Balance total de cuentas (saldo actual, no filtrado por fecha)
    prisma.cuentas.aggregate({
      where: { id_usuario: USER_ID },
      _sum: { saldo_actual: true },
    }),
    // Ingresos del mes actual
    prisma.transacciones.aggregate({
      where: {
        id_usuario: USER_ID,
        tipo: 'Ingreso',
        fecha: { gte: inicioMesActual, lte: finMesActual },
      },
      _sum: { monto: true },
    }),
    // Gastos del mes actual
    prisma.transacciones.aggregate({
      where: {
        id_usuario: USER_ID,
        tipo: 'Gasto',
        fecha: { gte: inicioMesActual, lte: finMesActual },
      },
      _sum: { monto: true },
    }),
    // Ingresos del mes anterior (para calcular % cambio)
    prisma.transacciones.aggregate({
      where: {
        id_usuario: USER_ID,
        tipo: 'Ingreso',
        fecha: { gte: inicioMesAnterior, lte: finMesAnterior },
      },
      _sum: { monto: true },
    }),
    // Gastos del mes anterior (para calcular % cambio)
    prisma.transacciones.aggregate({
      where: {
        id_usuario: USER_ID,
        tipo: 'Gasto',
        fecha: { gte: inicioMesAnterior, lte: finMesAnterior },
      },
      _sum: { monto: true },
    }),
    // Gastos del mes actual para el gráfico
    prisma.transacciones.findMany({
      where: {
        id_usuario: USER_ID,
        tipo: 'Gasto',
        fecha: { gte: inicioMesActual, lte: finMesActual },
      },
    }),
    // Categorías del usuario
    prisma.categorias.findMany({
      where: { id_usuario: USER_ID },
      orderBy: { nombre: 'asc' },
    }),
    // Primer grupo al que pertenece el usuario
    prisma.grupo_usuarios.findFirst({
      where: { id_usuario: USER_ID },
      include: {
        grupos: {
          include: {
            grupo_usuarios: {
              include: {
                usuarios: { select: { nombre: true, apellido: true } },
              },
            },
            gasto_compartido: {
              include: { transacciones: true },
            },
          },
        },
      },
    }),
  ]);

  const balanceTotal = Number(aggregateCuentas._sum.saldo_actual || 0);
  const ingresosTotal = Number(aggregateIngresosMes._sum.monto || 0);
  const gastosTotal = Number(aggregateGastosMes._sum.monto || 0);
  const ingresosAnterior = Number(aggregateIngresosMesAnterior._sum.monto || 0);
  const gastosAnterior = Number(aggregateGastosMesAnterior._sum.monto || 0);

  const pctIngresos = calcularPorcentajeCambio(ingresosTotal, ingresosAnterior);
  const pctGastos = calcularPorcentajeCambio(gastosTotal, gastosAnterior);

  // Gráfico de gastos por categoría (mes actual)
  const gastosPorCategoria: Record<number, number> = {};
  gastosMes.forEach((tx: any) => {
    const monto = Number(tx.monto);
    gastosPorCategoria[tx.id_categoria] = (gastosPorCategoria[tx.id_categoria] || 0) + monto;
  });

  const chartData: CategoryData[] = Object.entries(gastosPorCategoria)
    .map(([idStr, monto]) => {
      const idCat = parseInt(idStr);
      const cat = categorias.find((c: any) => c.id_categoria === idCat);
      const porcentaje = gastosTotal > 0 ? (monto / gastosTotal) * 100 : 0;
      return {
        name: cat ? cat.nombre : 'Sin categoría',
        value: Number(porcentaje.toFixed(2)),
        rawAmount: monto,
      };
    })
    .sort((a, b) => b.value - a.value);

  // Serializar transacciones
  const transactions = userTransactions.map((tx: any) => ({
    id_transaccion: tx.id_transaccion,
    descripcion: tx.descripcion,
    metodo: tx.metodo,
    fecha: tx.fecha.toISOString(),
    tipo: tx.tipo,
    monto: Number(tx.monto),
  }));

  const categoriasSerializadas = categorias.map((c: any) => ({
    id_categoria: c.id_categoria,
    nombre: c.nombre,
    tipo: c.tipo,
  }));

  // Grupo real del usuario
  let grupoData: {
    nombre: string;
    totalGastoCompartido: number;
    miembros: { nombre: string; apellido: string }[];
  } | null = null;

  if (grupoMembership?.grupos) {
    const grupo = grupoMembership.grupos;
    const totalGasto = grupo.gasto_compartido.reduce((acc: number, gc: any) => {
      return acc + Number(gc.transacciones?.monto || 0);
    }, 0);

    grupoData = {
      nombre: grupo.nombre,
      totalGastoCompartido: totalGasto,
      miembros: grupo.grupo_usuarios.map((gu: any) => ({
        nombre: gu.usuarios.nombre,
        apellido: gu.usuarios.apellido,
      })),
    };
  }

  return (
    <InicioClient
      userName={user.nombre}
      transactions={transactions}
      balanceTotal={balanceTotal}
      ingresosTotal={ingresosTotal}
      gastosTotal={gastosTotal}
      pctIngresos={pctIngresos}
      pctGastos={pctGastos}
      chartData={chartData}
      categoriasIniciales={categoriasSerializadas}
      grupoData={grupoData}
    />
  );
}
