'use client';

import { useState, useEffect, useRef, FormEvent } from 'react';
import { X, Trash2, Tags } from 'lucide-react';

const ICONOS: Record<string, string> = {
  Casa: '🏠',
  Transporte: '🚌',
  Alimentos: '🥗',
  Compras: '🛒',
  Salud: '💊',
  Entretenimiento: '🎬',
  Educación: '📚',
  Viajes: '✈️',
  General: '📂',
  Otro: '📌',
};

function obtenerIcono(nombre: string): string {
  const clave = Object.keys(ICONOS).find((k) =>
    nombre.toLowerCase().includes(k.toLowerCase())
  );
  return clave ? ICONOS[clave] : '📂';
}

interface Categoria {
  id_categoria: number;
  nombre: string;
  tipo: string;
}

interface Props {
  categorias: Categoria[];
  onClose: () => void;
  onCambio: (categoriasActualizadas: Categoria[]) => void;
}

export default function ModalCategorias({ categorias: iniciales, onClose, onCambio }: Props) {
  const [lista, setLista] = useState<Categoria[]>(iniciales);
  const [nombre, setNombre] = useState('');
  const [icono, setIcono] = useState('General');
  const [error, setError] = useState('');
  const [errorEliminar, setErrorEliminar] = useState('');
  const [loading, setLoading] = useState(false);
  const [eliminando, setEliminando] = useState<number | null>(null);
  const [confirmarEliminar, setConfirmarEliminar] = useState<number | null>(null);

  const primerCampoRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    primerCampoRef.current?.focus();

    function manejarEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', manejarEsc);
    return () => document.removeEventListener('keydown', manejarEsc);
  }, [onClose]);

  async function handleCrear(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (!nombre.trim()) {
      setError('El nombre de la categoría es requerido.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/categorias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: nombre.trim(), tipo: icono }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Error al crear la categoría.');
        setLoading(false);
        return;
      }
      const nuevaLista = [...lista, data.categoria];
      setLista(nuevaLista);
      onCambio(nuevaLista);
      setNombre('');
      setIcono('General');
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
      const res = await fetch(`/api/categorias/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        setErrorEliminar(data.error || 'Error al eliminar la categoría.');
        return;
      }
      const nuevaLista = lista.filter((c) => c.id_categoria !== id);
      setLista(nuevaLista);
      onCambio(nuevaLista);
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
      aria-labelledby="modal-categorias-titulo"
      className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 p-6"
    >
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-full text-blue-600" aria-hidden="true">
            <Tags className="w-5 h-5" />
          </div>
          <h2 id="modal-categorias-titulo" className="text-xl font-bold text-gray-900">
            Categorías
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar modal de categorías"
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-blue-500 transition"
        >
          <X className="w-5 h-5" aria-hidden="true" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Lista de categorías */}
        <section aria-label="Mis categorías">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Mis categorías
          </h3>

          {errorEliminar && (
            <div role="alert" aria-live="polite" className="mb-3 rounded-lg bg-red-50 border border-red-200 p-2 text-xs text-red-800">
              {errorEliminar}
            </div>
          )}

          {lista.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">No hay categorías aún.</p>
          ) : (
            <ul className="space-y-2 max-h-56 overflow-y-auto pr-1" aria-label="Lista de categorías">
              {lista.map((cat) => (
                <li
                  key={cat.id_categoria}
                  className="rounded-lg border border-gray-100"
                >
                  <div className="flex items-center justify-between p-2.5 hover:bg-gray-50">
                    <div className="flex items-center gap-2">
                      <span className="text-lg" aria-hidden="true">{obtenerIcono(cat.nombre)}</span>
                      <span className="text-sm font-medium text-gray-800">{cat.nombre}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setErrorEliminar('');
                        setConfirmarEliminar(cat.id_categoria);
                      }}
                      disabled={eliminando === cat.id_categoria}
                      aria-label={`Eliminar categoría ${cat.nombre}`}
                      className="p-1.5 text-gray-400 hover:text-red-500 disabled:opacity-50 rounded focus-visible:ring-2 focus-visible:ring-red-500 transition"
                    >
                      <Trash2 className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </div>
                  {confirmarEliminar === cat.id_categoria && (
                    <div className="flex items-center justify-between gap-2 px-2.5 pb-2.5 pt-0">
                      <p className="text-xs text-gray-600">¿Eliminar esta categoría?</p>
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
                          onClick={() => handleEliminar(cat.id_categoria)}
                          disabled={eliminando === cat.id_categoria}
                          className="px-2.5 py-1 text-xs rounded-md bg-red-500 hover:bg-red-600 text-white disabled:opacity-50 transition focus-visible:ring-2 focus-visible:ring-red-500"
                        >
                          {eliminando === cat.id_categoria ? 'Eliminando…' : 'Confirmar'}
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Formulario nueva categoría */}
        <section aria-label="Crear nueva categoría">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Nueva categoría
          </h3>

          {error && (
            <div role="alert" aria-live="polite" className="mb-3 rounded-lg bg-red-50 border border-red-200 p-2 text-xs text-red-800">
              {error}
            </div>
          )}

          <form onSubmit={handleCrear} noValidate className="space-y-3">
            <div>
              <label htmlFor="cat-nombre" className="block text-sm font-medium text-gray-700 mb-1">
                Nombre <span aria-hidden="true">*</span>
              </label>
              <input
                ref={primerCampoRef}
                id="cat-nombre"
                type="text"
                required
                placeholder="Ingrese el nombre de la categoría"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className={inputCls}
                aria-required="true"
              />
            </div>

            <div>
              <label htmlFor="cat-icono" className="block text-sm font-medium text-gray-700 mb-1">
                Ícono
              </label>
              <select
                id="cat-icono"
                value={icono}
                onChange={(e) => setIcono(e.target.value)}
                className={inputCls}
              >
                {Object.entries(ICONOS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v} {k}
                  </option>
                ))}
              </select>
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
