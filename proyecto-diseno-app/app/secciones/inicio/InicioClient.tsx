'use client';

import { useState, useCallback, useEffect } from 'react';
import { PlusCircle, MinusCircle, Tags, MoreVertical, Target, Users } from 'lucide-react';
import SummaryCard from '../../../components/SummaryCard';
import CategoryExpenses, { CategoryData } from '../../../components/CategoryExpenses';
import ModalIngreso from '../../../components/modals/ModalIngreso';
import ModalGasto from '../../../components/modals/ModalGasto';
import ModalCategorias from '../../../components/modals/ModalCategorias';
import ModalObjetivos from '../../../components/modals/ModalObjetivos';

type ModalTipo = 'ingreso' | 'gasto' | 'categorias' | 'objetivos' | null;

interface Transaccion {
  id_transaccion: number;
  descripcion: string | null;
  metodo: string;
  fecha: Date | string;
  tipo: string;
  monto: number | string;
}

interface Categoria {
  id_categoria: number;
  nombre: string;
  tipo: string;
}

interface GrupoData {
  nombre: string;
  totalGastoCompartido: number;
  miembros: { nombre: string; apellido: string }[];
}

interface Props {
  userName: string;
  transactions: Transaccion[];
  balanceTotal: number;
  ingresosTotal: number;
  gastosTotal: number;
  pctIngresos: string;
  pctGastos: string;
  chartData: CategoryData[];
  categoriasIniciales: Categoria[];
  grupoData: GrupoData | null;
}

const ICONOS_OBJ: Record<string, string> = {
  Videojuegos: '🎮', Vacaciones: '⛺', Verano: '🏖️', Viaje: '✈️',
  Auto: '🚗', Casa: '🏠', Educación: '📚', Salud: '💊', Meta: '🎯', Otro: '💰',
};

interface ObjetivoDemo {
  id_objetivo: number;
  nombre: string;
  icono: string;
  monto: number;
  fecha_limite: string | null;
}

const AVATAR_COLORES = [
  'bg-pink-400', 'bg-purple-400', 'bg-blue-400',
  'bg-green-400', 'bg-yellow-400', 'bg-rose-400', 'bg-teal-400',
];

function iniciales(nombre: string, apellido?: string): string {
  const a = nombre?.[0] ?? '';
  const b = apellido?.[0] ?? nombre?.[1] ?? '';
  return (a + b).toUpperCase();
}

export default function InicioClient({
  userName,
  transactions,
  balanceTotal,
  ingresosTotal,
  gastosTotal,
  pctIngresos,
  pctGastos,
  chartData,
  categoriasIniciales,
  grupoData,
}: Props) {
  const [modalAbierto, setModalAbierto] = useState<ModalTipo>(null);
  const [categorias, setCategorias] = useState<Categoria[]>(categoriasIniciales);
  const [objetivos, setObjetivos] = useState<ObjetivoDemo[]>([]);

  useEffect(() => { document.title = 'Inicio | Countoid'; }, []);

  useEffect(() => {
    fetch('/api/objetivos')
      .then((r) => r.json())
      .then((data) => {
        setObjetivos(
          (data.objetivos ?? []).map((o: any) => ({ ...o, monto: Number(o.monto) }))
        );
      })
      .catch(() => {});
  }, []);

  const cerrarModal = useCallback(() => {
    setModalAbierto(null);
    fetch('/api/objetivos')
      .then((r) => r.json())
      .then((data) => setObjetivos((data.objetivos ?? []).map((o: any) => ({ ...o, monto: Number(o.monto) }))))
      .catch(() => {});
  }, []);
  const handleTransaccionExitosa = useCallback(() => {}, []);

  return (
    <>
      {/* BACKDROP con blur cuando hay modal abierto */}
      {modalAbierto && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          aria-hidden="true"
          onClick={cerrarModal}
        />
      )}

      {/* MODALES */}
      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {modalAbierto === 'ingreso' && (
            <ModalIngreso categorias={categorias} onClose={cerrarModal} onSuccess={handleTransaccionExitosa} />
          )}
          {modalAbierto === 'gasto' && (
            <ModalGasto categorias={categorias} onClose={cerrarModal} onSuccess={handleTransaccionExitosa} />
          )}
          {modalAbierto === 'categorias' && (
            <ModalCategorias categorias={categorias} onClose={cerrarModal} onCambio={setCategorias} />
          )}
          {modalAbierto === 'objetivos' && (
            <ModalObjetivos onClose={cerrarModal} />
          )}
        </div>
      )}

      {/* CONTENIDO PRINCIPAL */}
      <main id="contenido-principal" tabIndex={-1} className="max-w-7xl mx-auto px-4 md:px-6 pt-8 pb-10 space-y-6">

        {/* ENCABEZADO */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-3xl font-bold text-gray-900">Hola, {userName}</h1>
        </div>

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

        {/* ACCIONES RÁPIDAS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button
            onClick={() => setModalAbierto('ingreso')}
            className="flex items-center gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition text-left focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:outline-none"
            aria-label="Agregar ingreso"
          >
            <div className="p-3 bg-green-50 rounded-full text-green-600" aria-hidden="true">
              <PlusCircle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">Agregar ingreso</h2>
              <p className="text-xs text-gray-400">Crear ingreso manualmente</p>
            </div>
          </button>

          <button
            onClick={() => setModalAbierto('gasto')}
            className="flex items-center gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition text-left focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:outline-none"
            aria-label="Agregar gasto"
          >
            <div className="p-3 bg-red-50 rounded-full text-red-600" aria-hidden="true">
              <MinusCircle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">Agregar gasto</h2>
              <p className="text-xs text-gray-400">Crear gasto manualmente</p>
            </div>
          </button>

          <button
            onClick={() => setModalAbierto('categorias')}
            className="flex items-center gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition text-left focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
            aria-label="Ver y gestionar mis categorías"
          >
            <div className="p-3 bg-blue-50 rounded-full text-blue-600" aria-hidden="true">
              <Tags className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">Mis categorías</h2>
              <p className="text-xs text-gray-400">Ver todas mis categorías</p>
            </div>
          </button>
        </div>

        {/* SECCIÓN INFERIOR */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* COLUMNA IZQUIERDA */}
          <div className="space-y-6">
            <CategoryExpenses data={chartData} />

            {/* SECCIÓN GRUPO */}
            <section
              aria-label={grupoData ? `Grupo ${grupoData.nombre}` : 'Sin grupo'}
              className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm"
            >
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-4 h-4 text-gray-400" aria-hidden="true" />
                <h2 className="font-bold text-gray-900">
                  {grupoData ? grupoData.nombre : 'Familia'}
                </h2>
              </div>

              {grupoData && grupoData.miembros.length > 0 ? (
                <div className="flex items-end gap-3 flex-wrap mb-4">
                  {grupoData.miembros.map((m, i) => (
                    <div key={i} className="flex flex-col items-center gap-1">
                      <div
                        className={`w-9 h-9 rounded-full ${AVATAR_COLORES[i % AVATAR_COLORES.length]} flex items-center justify-center text-white text-[11px] font-bold`}
                        aria-label={`${m.nombre} ${m.apellido}`}
                      >
                        {iniciales(m.nombre, m.apellido)}
                      </div>
                      <span className="text-[10px] text-gray-500">{m.nombre}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 mb-4">No perteneces a ningún grupo aún.</p>
              )}

              <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                <p className="text-xs text-gray-500 mb-0.5">Gasto compartido total</p>
                <p className="text-lg font-bold text-gray-900">
                  CRC {grupoData ? grupoData.totalGastoCompartido.toFixed(2) : '0.00'}
                </p>
                {grupoData && grupoData.miembros.length > 0 && grupoData.totalGastoCompartido > 0 && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    CRC {(grupoData.totalGastoCompartido / grupoData.miembros.length).toFixed(2)} por persona
                  </p>
                )}
              </div>
            </section>
          </div>

          {/* COLUMNA DERECHA */}
          <div className="lg:col-span-2 space-y-6">

            {/* SECCIÓN OBJETIVOS */}
            <section aria-label="Mis objetivos de ahorro">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-bold text-gray-900">Objetivos</h2>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {objetivos.slice(0, 4).map((obj) => (
                  <article
                    key={obj.id_objetivo}
                    className="flex-shrink-0 bg-white border border-gray-100 rounded-xl shadow-sm p-4 w-36 text-center hover:shadow-md transition"
                    aria-label={`Objetivo ${obj.nombre}: CRC ${obj.monto}`}
                  >
                    <p className="text-sm font-semibold text-gray-800">CRC {obj.monto.toFixed(2)}</p>
                    <p className="text-[10px] text-gray-400 mb-2">
                      {obj.fecha_limite
                        ? new Date(obj.fecha_limite).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: '2-digit' })
                        : '—'}
                    </p>
                    <div className="text-2xl mb-1" aria-hidden="true">{ICONOS_OBJ[obj.icono] ?? '🎯'}</div>
                    <p className="text-xs font-medium text-gray-700">{obj.nombre}</p>
                  </article>
                ))}
                <button
                  onClick={() => setModalAbierto('objetivos')}
                  className="flex-shrink-0 bg-white border border-gray-100 rounded-xl shadow-sm p-4 w-36 flex flex-col items-center justify-center gap-2 hover:shadow-md transition focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:outline-none"
                  aria-label="Ver y gestionar mis objetivos"
                >
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center" aria-hidden="true">
                    <Target className="w-4 h-4 text-gray-500" />
                  </div>
                  <span className="text-xs font-medium text-gray-700">Mis Objetivos</span>
                </button>
              </div>
            </section>

            {/* ÚLTIMAS TRANSACCIONES */}
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
        </div>
      </main>
    </>
  );
}
