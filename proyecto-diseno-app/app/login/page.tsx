'use client';

import { useState, useEffect, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Wallet } from 'lucide-react';
import AuthLayout from '@/components/AuthLayout';

export default function LoginPage() {
  const router = useRouter();
  useEffect(() => { document.title = 'Iniciar sesión | Countoid'; }, []);
  const [showPassword, setShowPassword] = useState(false);
  const [recordar, setRecordar] = useState(false);
  const [form, setForm] = useState({ email: '', contrasena: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, recordar }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Error al iniciar sesión');
        setLoading(false);
        return;
      }
      router.push('/secciones/inicio');
    } catch {
      setError('Error de conexión. Intente de nuevo.');
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 mb-6">
          <div className="p-2 rounded-xl bg-[#106A37]">
            <Wallet className="w-5 h-5 text-white" aria-hidden="true" />
          </div>
          <span className="text-xl font-bold text-gray-900">Countoid</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Bienvenido</h1>

        <form onSubmit={handleSubmit} noValidate aria-describedby={error ? 'login-error' : undefined}>
          {error && (
            <div
              id="login-error"
              role="alert"
              aria-live="polite"
              className="mb-4 rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-800"
            >
              {error}
            </div>
          )}

          <div className="mb-4">
            <label htmlFor="email" className="block text-sm text-gray-700 font-medium mb-1">
              Correo electrónico
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="Correo o código de usuario"
              className="w-full rounded-md bg-gray-100 border border-gray-200 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="contrasena" className="block text-sm text-gray-700 font-medium mb-1">
              Contraseña
            </label>
            <div className="relative">
              <input
                id="contrasena"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={form.contrasena}
                onChange={(e) => setForm({ ...form, contrasena: e.target.value })}
                placeholder="Ingrese su contraseña"
                className="w-full rounded-md bg-gray-100 border border-gray-200 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                aria-pressed={showPassword}
                aria-controls="contrasena"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 p-1 rounded focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                {showPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between mb-6 text-sm">
            <button
              type="button"
              role="switch"
              aria-checked={recordar}
              onClick={() => setRecordar(!recordar)}
              className="flex items-center gap-2 focus-visible:ring-2 focus-visible:ring-blue-500 rounded p-0.5"
            >
              <span
                className={`relative inline-block w-9 h-5 rounded-full transition-colors ${
                  recordar ? 'bg-blue-600' : 'bg-gray-300'
                }`}
                aria-hidden="true"
              >
                <span
                  className={`absolute top-0.5 left-0.5 bg-white rounded-full h-4 w-4 transition-transform ${
                    recordar ? 'translate-x-4' : ''
                  }`}
                />
              </span>
              <span className="text-gray-700">Recordar credenciales</span>
            </button>
            <Link
              href="/forgot-password"
              className="text-blue-600 underline hover:text-blue-800 focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
            >
              Olvidé mi contraseña
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-md transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </button>

          <p className="text-sm text-center mt-4 text-gray-600">
            No tengo una cuenta{' '}
            <Link href="/register" className="text-blue-600 underline hover:text-blue-800">
              Registrarme
            </Link>
          </p>
        </form>
      </div>
    </AuthLayout>
  );
}

