'use client';

import { useState, useMemo, useEffect, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Wallet } from 'lucide-react';
import AuthLayout from '@/components/AuthLayout';
import { countries, countriesData } from '@/lib/locations';

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    nombre: '', apellido: '', email: '', contrasena: '',
    telefono: '', pais: '', provincia: '',
  });
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; telefono?: string }>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => { document.title = 'Registrarse | Countoid'; }, []);
  const provincias = useMemo(() => (form.pais ? countriesData[form.pais] ?? [] : []), [form.pais]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setFieldErrors({});

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
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Error al registrarse');
        setLoading(false);
        return;
      }
      router.push('/secciones/inicio');
    } catch {
      setError('Error de conexión. Intente de nuevo.');
      setLoading(false);
    }
  }

  const inputCls =
  "w-full rounded-md bg-gray-100 border border-gray-200 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent";

  return (
    <AuthLayout>
      <div className="w-full max-w-sm py-8">
        <div className="flex items-center gap-2 mb-6">
          <div className="p-2 rounded-xl bg-[#106A37]">
            <Wallet className="w-5 h-5 text-white" aria-hidden="true" />
          </div>
          <span className="text-xl font-bold text-gray-900">Countoid</span>
        </div>
        <h1 className="text-2xl text-gray-700 font-bold mb-6">Bienvenido</h1>

        <form onSubmit={handleSubmit} noValidate aria-describedby={error ? 'register-error' : undefined}>
          {error && (
            <div
              id="register-error"
              role="alert"
              aria-live="polite"
              className="mb-4 rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-800"
            >
              {error}
            </div>
          )}

          <div className="mb-3">
            <label htmlFor="nombre" className="block text-sm text-gray-700 font-medium mb-1">Nombre</label>
            <input
              id="nombre" type="text" required autoComplete="given-name"
              value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              placeholder="Ingrese su nombre" className={inputCls}
            />
          </div>

          <div className="mb-3">
            <label htmlFor="apellido" className="block text-sm text-gray-700 font-medium mb-1">Apellido</label>
            <input
              id="apellido" type="text" required autoComplete="family-name"
              value={form.apellido} onChange={(e) => setForm({ ...form, apellido: e.target.value })}
              placeholder="Ingrese su apellido" className={inputCls}
            />
          </div>

          <div className="mb-3">
            <label htmlFor="email" className="block text-sm text-gray-700 font-medium mb-1">Correo electrónico</label>
            <input
              id="email" type="email" required autoComplete="email"
              value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="Ingrese su correo electrónico" className={inputCls}
              aria-invalid={Boolean(fieldErrors.email)}
              aria-describedby={fieldErrors.email ? 'email-error' : undefined}
            />
            {fieldErrors.email && (
              <p id="email-error" className="text-xs text-red-600 mt-1">
                {fieldErrors.email}
              </p>
            )}
          </div>

          <div className="mb-3">
            <label htmlFor="contrasena" className="block text-sm text-gray-700 font-medium mb-1">Contraseña</label>
            <div className="relative">
              <input
                id="contrasena" type={showPassword ? 'text' : 'password'} required
                autoComplete="new-password" minLength={8}
                value={form.contrasena} onChange={(e) => setForm({ ...form, contrasena: e.target.value })}
                placeholder="Ingrese su contraseña"
                aria-describedby="contrasena-hint"
                className={`${inputCls} pr-10`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                aria-pressed={showPassword}
                aria-controls="contrasena"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-700 hover:text-gray-700 p-1 rounded focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                {showPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
              </button>
            </div>
            <p id="contrasena-hint" className="text-xs text-gray-700 mt-1">Mínimo 8 caracteres.</p>
          </div>

          <div className="mb-3">
            <label htmlFor="telefono" className="block text-sm text-gray-700 font-medium mb-1">Teléfono</label>
            <input
              id="telefono" type="tel" required autoComplete="tel"
              value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })}
              placeholder="Ingrese su teléfono" className={inputCls}
              aria-invalid={Boolean(fieldErrors.telefono)}
              aria-describedby={fieldErrors.telefono ? 'telefono-error' : undefined}
            />
            {fieldErrors.telefono && (
              <p id="telefono-error" className="text-xs text-red-600 mt-1">
                {fieldErrors.telefono}
              </p>
            )}
          </div>

          <div className="mb-3">
            <label htmlFor="pais" className="block text-sm text-gray-700 font-medium mb-1">País</label>
            <select
              id="pais" required autoComplete="country-name"
              value={form.pais}
              onChange={(e) => setForm({ ...form, pais: e.target.value, provincia: '' })}
              className={inputCls}
            >
              <option value="" disabled>Seleccione</option>
              {countries.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="mb-5">
            <label htmlFor="provincia" className="block text-sm text-gray-700 font-medium mb-1">Provincia/Estado</label>
            <select
              id="provincia" required disabled={!form.pais}
              value={form.provincia}
              onChange={(e) => setForm({ ...form, provincia: e.target.value })}
              className={`${inputCls} disabled:opacity-60 disabled:cursor-not-allowed`}
            >
              <option value="" disabled>Seleccione</option>
              {provincias.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          <button
            type="submit" disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-md transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
          >
            {loading ? 'Registrando...' : 'Registrarse'}
          </button>

          <button
            type="button"
            onClick={() => alert('Registro con Google: pendiente de integrar')}
            className="w-full mt-3 bg-black hover:bg-gray-800 text-white font-medium py-2.5 rounded-md transition-colors flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-500"
          >
            <span className="bg-white rounded-full p-1" aria-hidden="true">
              <svg width="14" height="14" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
                <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
                <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
                <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
              </svg>
            </span>
            <span>o regístrese con Google</span>
          </button>

          <p className="text-sm text-center mt-4 text-gray-600">
            Si ya tiene una cuenta{' '}
            <Link href="/login" className="text-blue-600 underline hover:text-blue-800">
              Inicie sesión
            </Link>
          </p>
        </form>
      </div>
    </AuthLayout>
  );
}