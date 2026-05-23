'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const inputCls =
  'w-full rounded-md bg-gray-100 border border-gray-200 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';

export default function NuevoGrupoPage() {
  const router = useRouter();
  const [form, setForm] = useState({ nombre: '', descripcion: '' });
  const [codesText, setCodesText] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const miembros = codesText
        .split(/[\s,]+/)
        .map((code) => code.trim())
        .filter(Boolean);

      const res = await fetch('/api/grupos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, miembros }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'No se pudo crear el grupo');
        setLoading(false);
        return;
      }
      router.push('/secciones/grupos');
      router.refresh();
    } catch {
      setError('Error de conexion. Intente de nuevo.');
      setLoading(false);
    }
  }

  return (
    <main className="max-w-3xl mx-auto px-4 md:px-6 pt-8 pb-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Nuevo grupo</h1>
        <Link
          href="/secciones/grupos"
          className="text-sm text-blue-600 hover:text-blue-800 underline"
        >
          Volver a grupos
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        {error && (
          <div
            role="alert"
            aria-live="polite"
            className="mb-4 rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-800"
          >
            {error}
          </div>
        )}

        <div className="mb-4">
          <label htmlFor="nombre" className="block text-sm font-medium mb-1">
            Nombre del grupo
          </label>
          <input
            id="nombre"
            required
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            placeholder="Ej. Familia, Roommates"
            className={inputCls}
          />
        </div>

        <div className="mb-6">
          <label htmlFor="descripcion" className="block text-sm font-medium mb-1">
            Descripcion (opcional)
          </label>
          <textarea
            id="descripcion"
            rows={4}
            value={form.descripcion}
            onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
            placeholder="Agrega un detalle o proposito del grupo"
            className={inputCls}
          />
        </div>

        <div className="mb-6">
          <label htmlFor="miembros" className="block text-sm font-medium mb-1">
            Agregar miembros (codigos)
          </label>
          <textarea
            id="miembros"
            rows={3}
            value={codesText}
            onChange={(e) => setCodesText(e.target.value)}
            placeholder="Ej. U5, U12, U27"
            className={inputCls}
          />
          <p className="text-xs text-gray-500 mt-1">
            Separe los codigos por comas o espacios. El creador se agrega automaticamente.
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#106A37] hover:bg-green-800 disabled:bg-green-700 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-md transition-colors"
        >
          {loading ? 'Creando...' : 'Crear grupo'}
        </button>
      </form>
    </main>
  );
}
