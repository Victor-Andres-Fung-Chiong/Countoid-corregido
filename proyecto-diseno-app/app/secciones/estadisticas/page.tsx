import { redirect } from 'next/navigation';
import { prisma } from "../../../lib/prisma";
import { getSession } from '@/lib/auth';
import SummaryCard from '../../../components/SummaryCard';
import { PlusCircle, MinusCircle, Tags, MoreVertical, Target, Users } from 'lucide-react';
import CategoryExpenses from "../../../components/CategoryExpenses";
import IncomeVsExpensesChart from "../../../components/IncomesVsExpensesChart";
import DailyExpensesChart from "../../../components/DailyExpensesChart";
import SavingGoalsChart from "../../../components/SavingGoalsChart";
import BalanceHistoryChart from "../../../components/BalanceHistoryChart";
import PaymentMethods from "../../../components/PaymentMethodsChart";

function calcularPorcentajeCambio(actual: number, anterior: number): string {
  if (anterior === 0) return actual > 0 ? '+100%' : '0%';
  const cambio = ((actual - anterior) / anterior) * 100;
  const signo = cambio >= 0 ? '+' : '';
  return `${signo}${cambio.toFixed(1)}%`;
}

export default async function Estadisticas() {
  const session = await getSession();
  if (!session) redirect('/login');

  const USER_ID = session.userId;

  const ahora = new Date();

  const inicioMesActual = new Date(
    ahora.getFullYear(),
    ahora.getMonth(),
    1
  );

  const finMesActual = new Date(
    ahora.getFullYear(),
    ahora.getMonth() + 1,
    0,
    23,
    59,
    59,
    999
  );

  const inicioMesAnterior = new Date(
    ahora.getFullYear(),
    ahora.getMonth() - 1,
    1
  );

  const finMesAnterior = new Date(
    ahora.getFullYear(),
    ahora.getMonth(),
    0,
    23,
    59,
    59,
    999
  );

    const [
      aggregateCuentas,
      aggregateIngresosMes,
      aggregateGastosMes,
      aggregateIngresosMesAnterior,
      aggregateGastosMesAnterior,
      allGastos,
      categorias,
      userTransactions,
      monthlyTransactions,
    ] = await Promise.all([
      prisma.cuentas.aggregate({
        where: { id_usuario: USER_ID },
        _sum: { saldo_actual: true },
      }),
      prisma.transacciones.aggregate({
        where: {
          id_usuario: USER_ID,
          tipo: 'Ingreso',
          fecha: {
            gte: inicioMesActual,
            lte: finMesActual,
          },
        },
        _sum: { monto: true },
      }),
      prisma.transacciones.aggregate({
        where: {
          id_usuario: USER_ID,
          tipo: 'Gasto',
          fecha: {
            gte: inicioMesActual,
            lte: finMesActual,
          },
        },
        _sum: { monto: true },
      }),
      prisma.transacciones.aggregate({
        where: {
          id_usuario: USER_ID,
          tipo: 'Ingreso',
          fecha: {
            gte: inicioMesAnterior,
            lte: finMesAnterior,
          },
        },
        _sum: { monto: true },
      }),
      prisma.transacciones.aggregate({
        where: {
          id_usuario: USER_ID,
          tipo: 'Gasto',
          fecha: {
            gte: inicioMesAnterior,
            lte: finMesAnterior,
          },
        },
        _sum: { monto: true },
      }),
      prisma.transacciones.findMany({
        where: { id_usuario: USER_ID, tipo: 'Gasto' },
      }),
      prisma.categorias.findMany({
        where: { id_usuario: USER_ID },
        orderBy: { nombre: 'asc' },
      }),
      prisma.transacciones.findMany({
        where: { id_usuario: USER_ID },
        orderBy: { fecha: 'desc' },
        take: 5,
      }),
      prisma.transacciones.findMany({
        where: {
          id_usuario: USER_ID,
        },
        orderBy: {
          fecha: 'asc',
        },
      }),
    ]);

    const balanceTotal = Number(aggregateCuentas._sum.saldo_actual || 0);
    const ingresosTotal = Number(aggregateIngresosMes._sum.monto || 0);

    const gastosTotal = Number(aggregateGastosMes._sum.monto || 0);

    const ingresosAnterior = Number(
      aggregateIngresosMesAnterior._sum.monto || 0
    );

    const gastosAnterior = Number(
      aggregateGastosMesAnterior._sum.monto || 0
    );

    const pctIngresos = calcularPorcentajeCambio(
      ingresosTotal,
      ingresosAnterior
    );

    const pctGastos = calcularPorcentajeCambio(
      gastosTotal,
      gastosAnterior
    );
    const gastosPorCategoria: Record<number, number> = {};

    allGastos.forEach((tx: any) => {
      const monto = Number(tx.monto);

      gastosPorCategoria[tx.id_categoria] =
        (gastosPorCategoria[tx.id_categoria] || 0) + monto;
    });

    const chartData = Object.entries(gastosPorCategoria)
      .map(([idStr, monto]) => {
        const idCat = parseInt(idStr);

        const cat = categorias.find(
          (c: any) => c.id_categoria === idCat
        );

        const porcentaje =
          gastosTotal > 0
            ? (Number(monto) / gastosTotal) * 100
            : 0;

        return {
          name: cat ? cat.nombre : 'Sin categoría',
          value: Number(porcentaje.toFixed(2)),
          rawAmount: Number(monto),
        };
      })
      .sort((a, b) => b.value - a.value);

      const transactions = userTransactions.map((tx: any) => ({
        id_transaccion: tx.id_transaccion,
        descripcion: tx.descripcion,
        metodo: tx.metodo,
        fecha: tx.fecha.toISOString(),
        tipo: tx.tipo,
        monto: Number(tx.monto),
      }));

      const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

    const monthlyMap: Record<string, { ingresos: number; gastos: number }> = {};

    monthlyTransactions.forEach((tx: any) => {
      const fecha = new Date(tx.fecha);

      const mes = meses[fecha.getMonth()];

      if (!monthlyMap[mes]) {
        monthlyMap[mes] = {
          ingresos: 0,
          gastos: 0,
        };
      }

      const monto = Number(tx.monto);

      if (tx.tipo === 'Ingreso') {
          monthlyMap[mes].ingresos += monto;
        } else {
          monthlyMap[mes].gastos += monto;
        }
      });

    const monthlyData = Object.entries(monthlyMap).map(
      ([mes, valores]) => ({
        mes,
        ingresos: valores.ingresos,
        gastos: valores.gastos,
      })
    );

    const diasSemanaCortos = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];
    const ultimos7DiasMap: Record<string, { fechaStr: string; label: string; monto: number }> = {};

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(ahora.getDate() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const label = `${diasSemanaCortos[d.getDay()]}${d.getDate()}`;
      
      ultimos7DiasMap[key] = {
        fechaStr: key,
        label,
        monto: 0
      };
    }

    const hace7Dias = new Date();
    hace7Dias.setDate(ahora.getDate() - 6);
    hace7Dias.setHours(0, 0, 0, 0);

    allGastos.forEach((tx: any) => {
      const fechaTx = new Date(tx.fecha);
      if (fechaTx >= hace7Dias) {
        const key = `${fechaTx.getFullYear()}-${String(fechaTx.getMonth() + 1).padStart(2, '0')}-${String(fechaTx.getDate()).padStart(2, '0')}`;
        if (ultimos7DiasMap[key]) {
          ultimos7DiasMap[key].monto += Number(tx.monto);
        }
      }
    });

    const dailyExpensesData = Object.values(ultimos7DiasMap);
    const sumaGastos7Dias = dailyExpensesData.reduce((sum, item) => sum + item.monto, 0);
    const promedioGastos7Dias = sumaGastos7Dias / 7;

    const MONTO_META_FIJO = 500000;
    const savingsGoalsData = categorias.map((cat: any) => {
        const totalIngresadoReal = monthlyTransactions
        .filter((tx: any) => tx.tipo === 'Ingreso' && tx.id_categoria === cat.id_categoria)
        .reduce((sum: number, tx: any) => sum + Number(tx.monto), 0);

      const colores = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
      const colorAsignado = colores[cat.id_categoria % colores.length];

      return {
        nombre: cat.nombre,
        actual: totalIngresadoReal,
        objetivo: MONTO_META_FIJO,
        color: colorAsignado,
      };
    });

  const META_BALANCE_FIJA = 200000;

  const balanceHistoryData = meses.map(mes => {
    const datosMes = monthlyMap[mes] || { ingresos: 0, gastos: 0 };
    const balanceMes = datosMes.ingresos - datosMes.gastos;
    
    return {
      mes,
      balance: balanceMes
    };
  }).filter(item => item.balance !== 0);

  const coloresCategorias = ['#15803d', '#3b82f6', '#f59e0b', '#a855f7', '#6b7280'];

  const topCategoriesData = chartData.slice(0, 5).map((item, idx) => ({
    index: idx + 1,
    nombre: item.name,
    monto: item.rawAmount,
    color: ['#15803d', '#3b82f6', '#f59e0b', '#a855f7', '#6b7280'][idx % 5]
  }));

  const conteoMetodos: Record<string, number> = {};
  let totalTransaccionesMetodo = 0;

  monthlyTransactions.forEach((tx: any) => {
    if (tx.metodo) {
      conteoMetodos[tx.metodo] = (conteoMetodos[tx.metodo] || 0) + 1;
      totalTransaccionesMetodo++;
    }
  });

  const paletaColoresMetodos = [
    '#3b82f6',
    '#10b981',
    '#f59e0b',
    '#8b5cf6',
    '#ec4899',
    '#06b6d4'
  ];

  const paymentMethodsData = Object.entries(conteoMetodos).map(([metodo, cantidad], idx) => {
    const porcentaje = totalTransaccionesMetodo > 0 ? Math.round((cantidad / totalTransaccionesMetodo) * 100) : 0;
    return {
      name: metodo,
      value: porcentaje,
      color: paletaColoresMetodos[idx % paletaColoresMetodos.length] 
    };
  }).sort((a, b) => b.value - a.value);

  return (
    <main className="max-w-7xl mx-auto px-4 md:px-6 pt-8 pb-10">
      <h1 className="text-3xl font-bold text-gray-900">Estadísticas</h1>
      
      {/* TARJETAS DE RESUMEN */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SummaryCard
          title="Balance"
          amount={`CRC ${balanceTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          percentage="—"
          isPositive={balanceTotal >= 0}
        />
        <SummaryCard
          title="Ingresos (este mes)"
          amount={`CRC ${ingresosTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          percentage={pctIngresos}
          isPositive={pctIngresos.startsWith('+')}
        />
        <SummaryCard
          title="Gastos (este mes)"
          amount={`CRC ${gastosTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          percentage={pctGastos}
          isPositive={!pctGastos.startsWith('+')}
        />
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Personal</h2>
      </div>

      {/* PERSONAL */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">

          <CategoryExpenses data={chartData} />
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">

          <SavingGoalsChart goals={savingsGoalsData} />
        </div>
      </div>

      {/* ANÁLISIS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Análisis</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 mb-4">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">

          <DailyExpensesChart data={dailyExpensesData} promedio={promedioGastos7Dias} />
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">

          <IncomeVsExpensesChart data={monthlyData} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-4 mb-4">
        <div className="md:col-span-6 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">

          <BalanceHistoryChart data={balanceHistoryData} metaFija={META_BALANCE_FIJA} />
        </div>
        <div className="md:col-span-6 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">

          <PaymentMethods categories={topCategoriesData} methods={paymentMethodsData} />
        </div>
      </div>

      {/* TRANSACCIONES */}
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm mt-4">
        <section aria-label="Últimas transacciones" className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h2 className="font-bold text-gray-900">Últimas transacciones</h2>
          <p className="text-xs text-gray-500 mb-6">Resumen de los últimas transacciones</p>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <caption className="sr-only">Últimas transacciones</caption>
              <thead className="text-xs text-gray-400 uppercase bg-gray-50 border-y border-gray-100">
                <tr>
                  <th scope="col" className="px-4 py-3 font-medium">Descripción</th>
                  <th scope="col" className="px-4 py-3 font-medium">Método</th>
                  <th scope="col" className="px-4 py-3 font-medium">Fecha</th>
                  <th scope="col" className="px-4 py-3 font-medium">Monto</th>
                  <th scope="col" className="px-4 py-3"><span className="sr-only">Acciones</span></th>
                </tr>
              </thead>
              <tbody>
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-500">
                      No hay transacciones recientes.
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx) => (
                    <tr key={tx.id_transaccion} className="border-b border-gray-50 hover:bg-gray-50 transition">
                      <td className="px-4 py-3 font-medium text-gray-900">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-[10px] text-gray-600 uppercase font-bold"
                            aria-hidden="true"
                          >
                            {tx.descripcion ? tx.descripcion.substring(0, 2) : 'TX'}
                          </div>
                          {tx.descripcion || 'Sin nombre'}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-500">{tx.metodo}</td>
                      <td className="px-4 py-3 text-gray-500">
                        {new Date(tx.fecha).toLocaleDateString('es-ES')}
                      </td>
                      <td className={`px-4 py-3 font-semibold ${tx.tipo === 'Ingreso' ? 'text-green-600' : 'text-gray-900'}`}>
                        {tx.tipo === 'Ingreso' ? '+' : '-'}CRC {Number(tx.monto).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-right">
                        <button
                          className="hover:text-gray-600 p-1 rounded focus-visible:ring-2 focus-visible:ring-gray-400"
                          aria-label={`Opciones para transacción ${tx.descripcion || 'sin nombre'}`}
                        >
                          <MoreVertical className="w-4 h-4" aria-hidden="true" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
          
      </div>

    </main>
  );
}
