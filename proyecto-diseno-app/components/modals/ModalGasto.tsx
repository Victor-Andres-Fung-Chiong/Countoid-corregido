'use client';

import { useState, useEffect, useRef, FormEvent } from 'react';
import { X, MinusCircle } from 'lucide-react';

interface Categoria {
  id_categoria: number;
  nombre: string;
  tipo: string;
}

interface Props {
  categorias: Categoria[];
  onClose: () => void;
  onSuccess: () => void;
}

const METODOS = ['Transferencia', 'Tarjeta de crédito', 'Efectivo', 'Débito automático'];

export default function ModalGasto({ categorias, onClose, onSuccess }: Props) {
  const [form, setForm] = useState({
    monto: '',
    fecha: new Date().toISOString().split('T')[0],
    id_categoria: '',
    descripcion: '',
    metodo: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const primerCampoRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    primerCampoRef.current?.focus();

    function manejarEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', manejarEsc);
    return () => document.removeEventListener('keydown', manejarEsc);
  }, [onClose]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (!form.monto || parseFloat(form.monto) <= 0) {
      setError('Ingrese un monto válido mayor a 0.');
      return;
    }
    if (!form.id_categoria) {
      setError('Seleccione una categoría.');
      return;
    }
    if (!form.metodo) {
      setError('Seleccione un método de pago.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/transacciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, tipo: 'Gasto' }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Error al guardar el gasto.');
        setLoading(false);
        return;
      }
      onSuccess();
      onClose();
    } catch {
      setError('Error de conexión. Intente de nuevo.');
      setLoading(false);
    }
  }

  const inputCls =
    'w-full rounded-lg bg-gray-100 border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-gasto-titulo"
      className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-6"
    >
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-50 rounded-full text-red-600" aria-hidden="true">
            <MinusCircle className="w-5 h-5" />
          </div>
          <h2 id="modal-gasto-titulo" className="text-xl font-bold text-gray-900">
            Gasto
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar modal de gasto"
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-red-500 transition"
        >
          <X className="w-5 h-5" aria-hidden="true" />
        </button>
      </div>

      {error && (
        <div role="alert" aria-live="polite" className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="gasto-monto" className="block text-sm font-medium text-gray-700 mb-1">
              Cantidad <span aria-hidden="true">*</span>
            </label>
            <input
              ref={primerCampoRef}
              id="gasto-monto"
              type="number"
              min="0.01"
              step="0.01"
              required
              placeholder="0.00"
              value={form.monto}
              onChange={(e) => setForm({ ...form, monto: e.target.value })}
              className={inputCls}
              aria-required="true"
            />
          </div>
          <div>
            <label htmlFor="gasto-moneda" className="block text-sm font-medium text-gray-700 mb-1">
              Moneda
            </label>
            <select id="gasto-moneda" className={inputCls} disabled aria-describedby="gasto-moneda-nota">
              <option>CRC</option>
            </select>
            <p id="gasto-moneda-nota" className="sr-only">Moneda fija según la cuenta del usuario</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="gasto-fecha" className="block text-sm font-medium text-gray-700 mb-1">
              Fecha <span aria-hidden="true">*</span>
            </label>
            <input
              id="gasto-fecha"
              type="date"
              required
              value={form.fecha}
              onChange={(e) => setForm({ ...form, fecha: e.target.value })}
              className={inputCls}
              aria-required="true"
            />
          </div>
          <div>
            <label htmlFor="gasto-categoria" className="block text-sm font-medium text-gray-700 mb-1">
              Categoría / objetivo <span aria-hidden="true">*</span>
            </label>
            <select
              id="gasto-categoria"
              required
              value={form.id_categoria}
              onChange={(e) => setForm({ ...form, id_categoria: e.target.value })}
              className={inputCls}
              aria-required="true"
            >
              <option value="" disabled>Seleccionar</option>
              {categorias.map((cat) => (
                <option key={cat.id_categoria} value={cat.id_categoria}>
                  {cat.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label htmlFor="gasto-descripcion" className="block text-sm font-medium text-gray-700 mb-1">
              Descripción (opcional)
            </label>
            <input
              id="gasto-descripcion"
              type="text"
              placeholder="Descripción"
              value={form.descripcion}
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
              className={inputCls}
            />
          </div>
          <div>
            <label htmlFor="gasto-metodo" className="block text-sm font-medium text-gray-700 mb-1">
              Método <span aria-hidden="true">*</span>
            </label>
            <select
              id="gasto-metodo"
              required
              value={form.metodo}
              onChange={(e) => setForm({ ...form, metodo: e.target.value })}
              className={inputCls}
              aria-required="true"
            >
              <option value="" disabled>Seleccionar</option>
              {METODOS.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium transition focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
          >
            Descartar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-2.5 rounded-lg bg-green-600 hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed text-white font-medium transition focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2"
          >
            {loading ? 'Guardando...' : 'Finalizar'}
          </button>
        </div>
      </form>
    </div>
  );
}
