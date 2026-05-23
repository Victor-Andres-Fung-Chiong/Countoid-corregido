'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';

export type CuentaUser = {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  pais: string;
  provincia: string;
};

type Props = {
  user: CuentaUser;
};

const EMPTY_MESSAGE = '';

export default function CuentaClient({ user }: Props) {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<CuentaUser>(user);
  const [form, setForm] = useState<CuentaUser>(user);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [error, setError] = useState(EMPTY_MESSAGE);
  const [success, setSuccess] = useState(EMPTY_MESSAGE);
  const [deactivateError, setDeactivateError] = useState(EMPTY_MESSAGE);
  const [highlightedFields, setHighlightedFields] = useState<Set<keyof CuentaUser>>(new Set());
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; telefono?: string }>({});

  const getInputClassName = useCallback((key: keyof CuentaUser) => {
    const base = 'w-full rounded-md border px-3 py-2 text-sm text-gray-700';
    if (isEditing) {
      return `${base} bg-white border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500`;
    }
    if (highlightedFields.has(key)) {
      return `${base} bg-white border-green-400 focus:outline-none focus:ring-2 focus:ring-green-500`;
    }
    return `${base} bg-gray-100 border-gray-200`;
  }, [highlightedFields, isEditing]);

  const handleEditToggle = () => {
    setError(EMPTY_MESSAGE);
    setSuccess(EMPTY_MESSAGE);
    setFieldErrors({});
    setIsEditing(true);
  };

  const handleCancel = () => {
    setForm(currentUser);
    setError(EMPTY_MESSAGE);
    setSuccess(EMPTY_MESSAGE);
    setFieldErrors({});
    setIsEditing(false);
  };

  const handleChange = (key: keyof CuentaUser, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setError(EMPTY_MESSAGE);
    setSuccess(EMPTY_MESSAGE);
    setFieldErrors({});
    setIsSaving(true);

    const email = form.email.trim();
    const telefonoDigits = form.telefono.replace(/\D/g, '');
    const nextErrors: { email?: string; telefono?: string } = {};

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      nextErrors.email = 'El correo no tiene un formato valido.';
    }

    if (telefonoDigits.length < 8 || telefonoDigits.length > 15) {
      nextErrors.telefono = 'El telefono debe tener entre 8 y 15 digitos.';
    }

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      setIsSaving(false);
      return;
    }

    const changedKeys = (Object.keys(form) as (keyof CuentaUser)[])
      .filter((key) => form[key] !== currentUser[key]);

    try {
      const res = await fetch('/api/usuarios/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: form.nombre,
          apellido: form.apellido,
          email,
          telefono: form.telefono,
          pais: form.pais,
          provincia: form.provincia,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'No se pudo actualizar el perfil.');
        setIsSaving(false);
        return;
      }

      setCurrentUser(data.user as CuentaUser);
      setForm(data.user as CuentaUser);
      setHighlightedFields(new Set(changedKeys));
      setSuccess('Perfil actualizado.');
      setIsEditing(false);
      setIsSaving(false);
      router.refresh();
    } catch {
      setError('Error de conexion. Intente de nuevo.');
      setIsSaving(false);
    }
  };

  const handleDeactivate = async () => {
    setDeactivateError(EMPTY_MESSAGE);

    const confirmed = window.confirm(
      'Esta accion desactiva tu cuenta y no podras iniciar sesion con tu correo actual.'
    );
    if (!confirmed) return;

    setIsDeactivating(true);
    try {
      const res = await fetch('/api/usuarios/me/deactivate', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        setDeactivateError(data.error || 'No se pudo desactivar la cuenta.');
        setIsDeactivating(false);
        return;
      }

      router.push('/login');
      router.refresh();
    } catch {
      setDeactivateError('Error de conexion. Intente de nuevo.');
    } finally {
      setIsDeactivating(false);
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-4 md:px-6 pt-8 pb-10 space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Mi Cuenta</h1>

      <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full overflow-hidden bg-gray-100">
              <img
                src="/images/avatar-generico.svg"
                alt="Avatar generico"
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-900">
                {currentUser.nombre} {currentUser.apellido}
              </p>
              <p className="text-xs text-gray-500">Codigo de usuario: U{currentUser.id}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isEditing ? (
              <>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="border border-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-50 transition"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-[#106A37] text-white px-4 py-2 rounded-md text-sm font-medium hover:opacity-90 transition disabled:opacity-60"
                >
                  {isSaving ? 'Guardando...' : 'Guardar cambios'}
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={handleEditToggle}
                className="bg-[#106A37] text-white px-4 py-2 rounded-md text-sm font-medium hover:opacity-90 transition"
              >
                Editar perfil
              </button>
            )}
          </div>
        </div>

        {(error || success) && (
          <div
            className={`rounded-md border px-4 py-2 text-sm ${
              error ? 'bg-red-50 border-red-200 text-red-800' : 'bg-green-50 border-green-200 text-green-800'
            }`}
            role={error ? 'alert' : 'status'}
            aria-live="polite"
          >
            {error || success}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-500" htmlFor="nombre">
              Nombre
            </label>
            <input
              id="nombre"
              className={getInputClassName('nombre')}
              value={form.nombre}
              onChange={(e) => handleChange('nombre', e.target.value)}
              readOnly={!isEditing}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-500" htmlFor="apellido">
              Apellidos
            </label>
            <input
              id="apellido"
              className={getInputClassName('apellido')}
              value={form.apellido}
              onChange={(e) => handleChange('apellido', e.target.value)}
              readOnly={!isEditing}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-500" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              className={getInputClassName('email')}
              value={form.email}
              onChange={(e) => handleChange('email', e.target.value)}
              readOnly={!isEditing}
              aria-invalid={Boolean(fieldErrors.email)}
              aria-describedby={fieldErrors.email ? 'email-error' : undefined}
            />
            {fieldErrors.email && (
              <p id="email-error" className="text-xs text-red-600">
                {fieldErrors.email}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-500" htmlFor="telefono">
              Telefono
            </label>
            <input
              id="telefono"
              type="tel"
              className={getInputClassName('telefono')}
              value={form.telefono}
              onChange={(e) => handleChange('telefono', e.target.value)}
              readOnly={!isEditing}
              aria-invalid={Boolean(fieldErrors.telefono)}
              aria-describedby={fieldErrors.telefono ? 'telefono-error' : undefined}
            />
            {fieldErrors.telefono && (
              <p id="telefono-error" className="text-xs text-red-600">
                {fieldErrors.telefono}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-500" htmlFor="contrasena">
              Contrasena
            </label>
            <input
              id="contrasena"
              type="password"
              className="w-full rounded-md bg-gray-100 border border-gray-200 px-3 py-2 text-sm text-gray-700"
              defaultValue="********"
              readOnly
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-500" htmlFor="pais">
              Pais
            </label>
            <input
              id="pais"
              className={getInputClassName('pais')}
              value={form.pais}
              onChange={(e) => handleChange('pais', e.target.value)}
              readOnly={!isEditing}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-500" htmlFor="provincia">
              Provincia / Estado
            </label>
            <input
              id="provincia"
              className={getInputClassName('provincia')}
              value={form.provincia}
              onChange={(e) => handleChange('provincia', e.target.value)}
              readOnly={!isEditing}
            />
          </div>
        </div>
      </section>

      <section className="bg-white rounded-xl border border-red-100 shadow-sm p-6 space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Eliminar cuenta</h2>
          <p className="text-sm text-gray-500">
            Esto desactiva tu cuenta y evita que puedas iniciar sesion con tu correo actual.
          </p>
        </div>

        {deactivateError && (
          <div
            className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800"
            role="alert"
            aria-live="polite"
          >
            {deactivateError}
          </div>
        )}

        <button
          type="button"
          onClick={handleDeactivate}
          disabled={isDeactivating}
          className="w-full md:w-auto bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 transition disabled:opacity-60"
        >
          {isDeactivating ? 'Desactivando...' : 'Desactivar cuenta'}
        </button>
      </section>
    </main>
  );
}
