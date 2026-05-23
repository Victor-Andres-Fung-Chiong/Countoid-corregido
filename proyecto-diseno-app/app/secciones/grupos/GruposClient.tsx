'use client';

import { Plus, Trash2, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

export type GroupCard = {
  id: string;
  name: string;
  owner: string;
  image: string;
  isOwner: boolean;
  creator: string;
  createdAt: string;
  members: { id: string; nombre: string; rol: string }[];
};

type Props = {
  groups: GroupCard[];
};

type Categoria = {
  id_categoria: number;
  nombre: string;
  tipo: string;
};

const METODOS = ['Transferencia', 'Tarjeta de crédito', 'Efectivo', 'Débito automático'];

export default function GruposClient({ groups }: Props) {
  const router = useRouter();
  const [activeGroup, setActiveGroup] = useState<GroupCard | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({ nombre: '', descripcion: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [sharedForm, setSharedForm] = useState({
    monto: '',
    fecha: new Date().toISOString().split('T')[0],
    id_categoria: '',
    descripcion: '',
    metodo: '',
  });
  const [sharedError, setSharedError] = useState('');
  const [sharedLoading, setSharedLoading] = useState(false);
  const [lastSplit, setLastSplit] = useState<{ total: number; perPerson: number; members: number } | null>(null);

  const inputClassName = useMemo(() => {
    const base = 'w-full rounded-md border px-3 py-2 text-sm text-gray-700';
    return `${base} bg-white border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500`;
  }, []);

  const closeModal = () => {
    setActiveGroup(null);
    setIsEditing(false);
    setSaving(false);
    setError('');
    setSharedError('');
    setSharedLoading(false);
    setLastSplit(null);
  };

  useEffect(() => {
    if (!activeGroup || !activeGroup.isOwner) return;
    let cancelled = false;

    fetch('/api/categorias')
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        setCategorias(Array.isArray(data.categorias) ? data.categorias : []);
      })
      .catch(() => {
        if (cancelled) return;
        setCategorias([]);
      });

    return () => {
      cancelled = true;
    };
  }, [activeGroup]);

  const formatDate = (isoDate: string) =>
    new Date(isoDate).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    });

  return (
    <>
      {activeGroup && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          aria-hidden="true"
          onClick={closeModal}
        />
      )}

      {activeGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-xl bg-white shadow-lg border border-gray-100 max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Detalles del grupo</h2>
              <button
                type="button"
                onClick={closeModal}
                className="p-1 rounded text-gray-400 hover:text-gray-600 focus-visible:ring-2 focus-visible:ring-green-500"
                aria-label="Cerrar detalles del grupo"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            <div className="px-5 py-4 space-y-4 overflow-y-auto flex-1">
              <div className="relative w-full h-44 overflow-hidden rounded-lg bg-gray-100">
                <img
                  src={activeGroup.image}
                  alt={activeGroup.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {error && (
                <div
                  role="alert"
                  aria-live="polite"
                  className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-800"
                >
                  {error}
                </div>
              )}

              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label htmlFor="nombre-grupo" className="text-xs uppercase text-gray-400 tracking-wide">
                      Nombre
                    </label>
                    <input
                      id="nombre-grupo"
                      value={form.nombre}
                      onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                      className={inputClassName}
                    />
                  </div>

                  <div>
                    <label htmlFor="descripcion-grupo" className="text-xs uppercase text-gray-400 tracking-wide">
                      Descripción
                    </label>
                    <textarea
                      id="descripcion-grupo"
                      rows={3}
                      value={form.descripcion}
                      onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                      className={inputClassName}
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(false);
                        setForm({ nombre: activeGroup.name, descripcion: activeGroup.owner });
                        setError('');
                      }}
                      className="px-3 py-2 text-sm rounded-md border border-gray-200 text-gray-700 hover:bg-gray-50"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        setSaving(true);
                        setError('');
                        const groupId = String(activeGroup.id || '').trim();
                        if (!groupId || Number.isNaN(Number(groupId))) {
                          setError('Grupo inválido. Intente de nuevo.');
                          setSaving(false);
                          return;
                        }
                        const res = await fetch(`/api/grupos/${groupId}`, {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            nombre: form.nombre,
                            descripcion: form.descripcion,
                          }),
                        });
                        const data = await res.json();
                        if (!res.ok) {
                          setError(data.error || 'No se pudo actualizar el grupo');
                          setSaving(false);
                          return;
                        }
                        setSaving(false);
                        setIsEditing(false);
                        router.refresh();
                      }}
                      disabled={saving}
                      className="px-3 py-2 text-sm rounded-md bg-[#106A37] text-white hover:bg-green-800 disabled:opacity-60"
                    >
                      {saving ? 'Guardando...' : 'Guardar'}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <p className="text-xs uppercase text-gray-400 tracking-wide">Nombre</p>
                    <p className="text-base font-semibold text-gray-900">{activeGroup.name}</p>
                  </div>

              <div>
                <p className="text-xs uppercase text-gray-400 tracking-wide">Creador</p>
                <p className="text-sm text-gray-700">{activeGroup.creator}</p>
              </div>

              <div>
                <p className="text-xs uppercase text-gray-400 tracking-wide">Fecha de creación</p>
                <p className="text-sm text-gray-700">{formatDate(activeGroup.createdAt)}</p>
              </div>

                  <div>
                    <p className="text-xs uppercase text-gray-400 tracking-wide">Descripción</p>
                    <p className="text-sm text-gray-700">{activeGroup.owner}</p>
                  </div>

                  <div>
                    <p className="text-xs uppercase text-gray-400 tracking-wide">Miembros</p>
                    {activeGroup.members.length === 0 ? (
                      <p className="text-sm text-gray-500">Sin miembros registrados.</p>
                    ) : (
                      <ul className="space-y-2">
                        {activeGroup.members.map((member) => (
                          <li key={member.id} className="flex items-center justify-between text-sm text-gray-700">
                            <span>{member.nombre}</span>
                            <span className="text-xs uppercase text-gray-400">{member.rol}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {activeGroup.isOwner && (
                    <div className="space-y-4">
                      <div className="rounded-lg border border-green-100 bg-green-50 p-3">
                        <h3 className="text-sm font-semibold text-gray-900 mb-2">Gasto compartido</h3>

                        {sharedError && (
                          <div
                            role="alert"
                            aria-live="polite"
                            className="mb-3 rounded-md bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-800"
                          >
                            {sharedError}
                          </div>
                        )}

                        {lastSplit && (
                          <div className="mb-3 rounded-md border border-green-200 bg-white px-3 py-2 text-xs text-green-800">
                            Total: CRC {lastSplit.total.toFixed(2)} | Por persona: CRC {lastSplit.perPerson.toFixed(2)} ({lastSplit.members} miembros)
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label htmlFor="shared-monto" className="block text-[11px] text-gray-500 mb-1">
                              Monto
                            </label>
                            <input
                              id="shared-monto"
                              type="number"
                              min="0.01"
                              step="0.01"
                              value={sharedForm.monto}
                              onChange={(e) => setSharedForm({ ...sharedForm, monto: e.target.value })}
                              className="w-full rounded-md border border-gray-200 px-2.5 py-2 text-xs text-gray-700"
                            />
                          </div>
                          <div>
                            <label htmlFor="shared-fecha" className="block text-[11px] text-gray-500 mb-1">
                              Fecha
                            </label>
                            <input
                              id="shared-fecha"
                              type="date"
                              value={sharedForm.fecha}
                              onChange={(e) => setSharedForm({ ...sharedForm, fecha: e.target.value })}
                              className="w-full rounded-md border border-gray-200 px-2.5 py-2 text-xs text-gray-700"
                            />
                          </div>
                          <div>
                            <label htmlFor="shared-categoria" className="block text-[11px] text-gray-500 mb-1">
                              Categoría
                            </label>
                            <select
                              id="shared-categoria"
                              value={sharedForm.id_categoria}
                              onChange={(e) => setSharedForm({ ...sharedForm, id_categoria: e.target.value })}
                              className="w-full rounded-md border border-gray-200 px-2.5 py-2 text-xs text-gray-700"
                            >
                              <option value="" disabled>Seleccionar</option>
                              {categorias.map((cat) => (
                                <option key={cat.id_categoria} value={cat.id_categoria}>
                                  {cat.nombre}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label htmlFor="shared-metodo" className="block text-[11px] text-gray-500 mb-1">
                              Método
                            </label>
                            <select
                              id="shared-metodo"
                              value={sharedForm.metodo}
                              onChange={(e) => setSharedForm({ ...sharedForm, metodo: e.target.value })}
                              className="w-full rounded-md border border-gray-200 px-2.5 py-2 text-xs text-gray-700"
                            >
                              <option value="" disabled>Seleccionar</option>
                              {METODOS.map((m) => (
                                <option key={m} value={m}>{m}</option>
                              ))}
                            </select>
                          </div>
                          <div className="col-span-2">
                            <label htmlFor="shared-descripcion" className="block text-[11px] text-gray-500 mb-1">
                              Descripción
                            </label>
                            <input
                              id="shared-descripcion"
                              type="text"
                              value={sharedForm.descripcion}
                              onChange={(e) => setSharedForm({ ...sharedForm, descripcion: e.target.value })}
                              className="w-full rounded-md border border-gray-200 px-2.5 py-2 text-xs text-gray-700"
                            />
                          </div>
                        </div>

                        <div className="mt-3">
                          <button
                            type="button"
                            disabled={sharedLoading}
                            onClick={async () => {
                              setSharedError('');

                              if (!sharedForm.monto || Number(sharedForm.monto) <= 0) {
                                setSharedError('Ingrese un monto válido.');
                                return;
                              }
                              if (!sharedForm.id_categoria) {
                                setSharedError('Seleccione una categoría.');
                                return;
                              }
                              if (!sharedForm.metodo) {
                                setSharedError('Seleccione un método.');
                                return;
                              }

                              setSharedLoading(true);
                              const res = await fetch(`/api/grupos/${activeGroup.id}/gasto-compartido`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(sharedForm),
                              });
                              const data = await res.json();
                              if (!res.ok) {
                                setSharedError(data.error || 'No se pudo registrar el gasto.');
                                setSharedLoading(false);
                                return;
                              }

                              setLastSplit(data.split ?? null);
                              setSharedForm({
                                monto: '',
                                fecha: new Date().toISOString().split('T')[0],
                                id_categoria: '',
                                descripcion: '',
                                metodo: '',
                              });
                              setSharedLoading(false);
                              router.refresh();
                            }}
                            className="w-full rounded-md bg-green-600 text-white text-xs font-semibold py-2 hover:bg-green-700 disabled:opacity-60"
                          >
                            {sharedLoading ? 'Guardando...' : 'Registrar gasto compartido'}
                          </button>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setIsEditing(true);
                          setForm({ nombre: activeGroup.name, descripcion: activeGroup.owner });
                          setError('');
                        }}
                        className="w-full px-3 py-2 text-sm rounded-md border border-gray-200 text-gray-700 hover:bg-gray-50"
                      >
                        Editar información
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          const confirmed = window.confirm(
                            '¿Desea eliminar este grupo? Esta acción no se puede deshacer.'
                          );
                          if (!confirmed) return;
                          setDeleting(true);
                          setError('');
                          const res = await fetch(`/api/grupos/${activeGroup.id}`, {
                            method: 'DELETE',
                          });
                          const data = await res.json();
                          if (!res.ok) {
                            setError(data.error || 'No se pudo eliminar el grupo');
                            setDeleting(false);
                            return;
                          }
                          setDeleting(false);
                          closeModal();
                          router.refresh();
                        }}
                        disabled={deleting}
                        className="w-full px-3 py-2 text-sm rounded-md border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-60"
                      >
                        {deleting ? 'Eliminando...' : (
                          <span className="inline-flex items-center justify-center gap-2">
                            <Trash2 className="w-4 h-4" aria-hidden="true" />
                            Eliminar grupo
                          </span>
                        )}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 md:px-6 pt-8 pb-10 space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Mis Grupos</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.length === 0 ? (
            <div className="col-span-full rounded-xl border border-dashed border-gray-200 bg-white p-6 text-center text-sm text-gray-500">
              Aún no perteneces a ningún grupo.
            </div>
          ) : (
            groups.map((group) => (
              <button
                type="button"
                key={group.id}
                onClick={() => setActiveGroup(group)}
                className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow text-left"
                aria-label={`Ver detalles del grupo ${group.name}`}
              >
                <div className="relative w-full h-40 overflow-hidden bg-gray-100">
                  <img
                    src={group.image}
                    alt={group.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform"
                  />
                </div>

                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h2 className="text-sm font-semibold text-gray-900">{group.name}</h2>
                      <p className="text-xs text-gray-500 mt-1">{group.owner}</p>
                    </div>
                  </div>
                </div>
              </button>
            ))
          )}

          <Link
            href="/secciones/grupos/nuevo"
            className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center justify-center p-6 text-center"
          >
            <Plus className="w-8 h-8 text-gray-400 mb-2" aria-hidden="true" />
            <p className="text-sm font-medium text-gray-900">Nuevo grupo</p>
          </Link>
        </div>
      </main>
    </>
  );
}
