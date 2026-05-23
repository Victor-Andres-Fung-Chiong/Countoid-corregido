'use client';

import { useState, useEffect, useRef, FormEvent } from 'react';
import { X, Trash2, Target } from 'lucide-react';

const ICONOS_OBJETIVOS: Record<string, string> = {
  Videojuegos: '🎮',
  Vacaciones: '⛺',
  Verano: '🏖️',
  Viaje: '✈️',
  Auto: '🚗',
  Casa: '🏠',
  Educación: '📚',
  Salud: '💊',
  Meta: '🎯',
  Otro: '💰',
};

function obtenerIconoObjetivo(icono: string): string {
  return ICONOS_OBJETIVOS[icono] ?? '🎯';
}

interface Objetivo {
  id_objetivo: number;
  nombre: string;
  icono: string;
  monto: number;
  fecha_limite: string | null;
}

interface Props {
  onClose: () => void;
}

export default function ModalObjetivos({ onClose }: Props) {
  const [lista, setLista] = useState<Objetivo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [nombre, setNombre] = useState('');
  const [icono, setIcono] = useState('Meta');
  const [monto, setMonto] = useState('');
  const [fechaLimite, setFechaLimite] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmarEliminar, setConfirmarEliminar] = useState<number | null>(null);
  const [eliminando, setEliminando] = useState<number | null>(null);
  const [errorEliminar, setErrorEliminar] = useState('');

  const primerCampoRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    primerCampoRef.current?.focus();

    function manejarEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', manejarEsc);

    fetch('/api/objetivos')
      .then((r) => r.json())
      .then((data) => {
        setLista(
          (data.objetivos ?? []).map((o: any) => ({
            ...o,
            monto: Number(o.monto),
          }))
        );
      })
      .catch(() => {})
      .finally(() => setCargando(false));

    return () => document.removeEventListener('keydown', manejarEsc);
  }, [onClose]);

  async function handleCrear(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (!nombre.trim()) {
      setError('El nombre del objetivo es requerido.');
      return;
    }
    if (!monto || parseFloat(monto) <= 0) {
      setError('Ingrese un monto válido mayor a 0.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/objetivos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: nombre.trim(), icono, monto, fecha_limite: fechaLimite || null }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Error al crear el objetivo.');
        return;
      }
      setLista([{ ...data.objetivo, monto: Number(data.objetivo.monto) }, ...lista]);
      setNombre('');
      setMonto('');
      setFechaLimite('');
      setIcono('Meta');
    } catch {
      setError('Error de conexión. Intente de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  async function handleEliminar(id: number) {
    setErrorEliminar('');
    setEliminando(id);
    setConfirmarEliminar(null);
    try {
      const res = await fetch(`/api/objetivos/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        setErrorEliminar(data.error || 'Error al eliminar el objetivo.');
        return;
      }
      setLista(lista.filter((o) => o.id_objetivo !== id));
    } catch {
      setErrorEliminar('Error de conexión al eliminar.');
    } finally {
      setEliminando(null);
    }
  }

  const inputCls =
    'w-full rounded-lg bg-gray-100 border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-objetivos-titulo"
      className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 p-6"
    >
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-50 rounded-full text-purple-600" aria-hidden="true">
            <Target className="w-5 h-5" />
          </div>
          <h2 id="modal-objetivos-titulo" className="text-xl font-bold text-gray-900">
            Objetivos
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar modal de objetivos"
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-purple-500 transition"
        >
          <X className="w-5 h-5" aria-hidden="true" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Lista */}
        <section aria-label="Mis objetivos">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Mis objetivos
          </h3>

          {errorEliminar && (
            <div role="alert" aria-live="polite" className="mb-3 rounded-lg bg-red-50 border border-red-200 p-2 text-xs text-red-800">
              {errorEliminar}
            </div>
          )}

          {cargando ? (
            <p className="text-sm text-gray-400 py-4 text-center">Cargando...</p>
          ) : lista.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">No hay objetivos aún.</p>
          ) : (
            <ul className="space-y-2 max-h-56 overflow-y-auto pr-1" aria-label="Lista de objetivos">
              {lista.map((obj) => (
                <li key={obj.id_objetivo} className="rounded-lg border border-gray-100">
                  <div className="flex items-center justify-between p-2.5 hover:bg-gray-50">
                    <div className="flex items-center gap-2">
                      <span className="text-lg" aria-hidden="true">{obtenerIconoObjetivo(obj.icono)}</span>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{obj.nombre}</p>
                        <p className="text-xs text-gray-400">CRC {obj.monto.toFixed(2)}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setErrorEliminar(''); setConfirmarEliminar(obj.id_objetivo); }}
                      disabled={eliminando === obj.id_objetivo}
                      aria-label={`Eliminar objetivo ${obj.nombre}`}
                      className="p-1.5 text-gray-400 hover:text-red-500 disabled:opacity-50 rounded focus-visible:ring-2 focus-visible:ring-red-500 transition"
                    >
                      <Trash2 className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </div>
                  {confirmarEliminar === obj.id_objetivo && (
                    <div className="flex items-center justify-between gap-2 px-2.5 pb-2.5 pt-0">
                      <p className="text-xs text-gray-600">¿Eliminar este objetivo?</p>
                      <div className="flex gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => setConfirmarEliminar(null)}
                          className="px-2.5 py-1 text-xs rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 transition focus-visible:ring-2 focus-visible:ring-gray-400"
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleEliminar(obj.id_objetivo)}
                          disabled={eliminando === obj.id_objetivo}
                          className="px-2.5 py-1 text-xs rounded-md bg-red-500 hover:bg-red-600 text-white disabled:opacity-50 transition focus-visible:ring-2 focus-visible:ring-red-500"
                        >
                          {eliminando === obj.id_objetivo ? 'Eliminando…' : 'Confirmar'}
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Formulario */}
        <section aria-label="Crear nuevo objetivo">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Nuevo objetivo
          </h3>

          {error && (
            <div role="alert" aria-live="polite" className="mb-3 rounded-lg bg-red-50 border border-red-200 p-2 text-xs text-red-800">
              {error}
            </div>
          )}

          <form onSubmit={handleCrear} noValidate className="space-y-3">
            <div>
              <label htmlFor="obj-nombre" className="block text-sm font-medium text-gray-700 mb-1">
                Nombre <span aria-hidden="true">*</span>
              </label>
              <input
                ref={primerCampoRef}
                id="obj-nombre"
                type="text"
                required
                placeholder="Ingrese el nombre del objetivo"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className={inputCls}
                aria-required="true"
              />
            </div>

            <div>
              <label htmlFor="obj-icono" className="block text-sm font-medium text-gray-700 mb-1">
                Ícono
              </label>
              <select
                id="obj-icono"
                value={icono}
                onChange={(e) => setIcono(e.target.value)}
                className={inputCls}
              >
                {Object.entries(ICONOS_OBJETIVOS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v} {k}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="obj-monto" className="block text-sm font-medium text-gray-700 mb-1">
                Monto <span aria-hidden="true">*</span>
              </label>
              <input
                id="obj-monto"
                type="number"
                min="0.01"
                step="0.01"
                required
                placeholder="0.00"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                className={inputCls}
                aria-required="true"
              />
            </div>

            <div>
              <label htmlFor="obj-fecha" className="block text-sm font-medium text-gray-700 mb-1">
                Fecha límite
              </label>
              <input
                id="obj-fecha"
                type="date"
                value={fechaLimite}
                onChange={(e) => setFechaLimite(e.target.value)}
                className={inputCls}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium transition focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 text-sm"
              >
                Descartar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2.5 rounded-lg bg-green-600 hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed text-white font-medium transition focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 text-sm"
              >
                {loading ? 'Guardando...' : 'Finalizar'}
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
