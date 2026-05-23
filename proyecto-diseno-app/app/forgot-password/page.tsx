'use client';

import { useState, useEffect, useRef, FormEvent, KeyboardEvent, ClipboardEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Wallet, KeyRound } from 'lucide-react';
import AuthLayout from '@/components/AuthLayout';

type Paso = 'email' | 'codigo' | 'nueva-contrasena';

const CODIGO_VALIDO = '00000';
const DURACION_TIMER = 2 * 60 + 35; // 2 min 35 seg en segundos

function formatearTiempo(segundos: number): string {
  const m = Math.floor(segundos / 60);
  const s = segundos % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [paso, setPaso] = useState<Paso>('email');
  const [email, setEmail] = useState('');
  const [telefonoEnmascarado, setTelefonoEnmascarado] = useState('');
  const [digitos, setDigitos] = useState(['', '', '', '', '']);
  const [timerSegundos, setTimerSegundos] = useState(DURACION_TIMER);
  const [timerActivo, setTimerActivo] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [contrasena, setContrasena] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [loading, setLoading] = useState(false);

  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // Temporizador de reenvío
  useEffect(() => {
    if (!timerActivo || timerSegundos <= 0) return;
    const id = setInterval(() => setTimerSegundos((s) => s - 1), 1000);
    return () => clearInterval(id);
  }, [timerActivo, timerSegundos]);

  //solicitar código
  async function handleSolicitarCodigo(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Ingrese su correo electrónico.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('El correo electrónico no tiene un formato válido.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Error al enviar el código.');
        setLoading(false);
        return;
      }
      setTelefonoEnmascarado(data.telefonoEnmascarado);
      setDigitos(['', '', '', '', '']);
      setTimerSegundos(DURACION_TIMER);
      setTimerActivo(true);
      setPaso('codigo');
      setTimeout(() => inputsRef.current[0]?.focus(), 100);
    } catch {
      setError('Error de conexión. Intente de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  // Reenviar código (reinicia el timer, misma llamada API)
  async function handleReenviar() {
    if (timerSegundos > 0) return;
    setError('');
    setLoading(true);
    try {
      await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      setDigitos(['', '', '', '', '']);
      setTimerSegundos(DURACION_TIMER);
      setTimerActivo(true);
      setTimeout(() => inputsRef.current[0]?.focus(), 100);
    } catch {
      setError('Error de conexión. Intente de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  // Manejo de los 5 inputs del código
  function handleDigito(index: number, valor: string) {
    const solo = valor.replace(/\D/g, '').slice(-1);
    const nuevos = [...digitos];
    nuevos[index] = solo;
    setDigitos(nuevos);
    if (solo && index < 4) {
      inputsRef.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !digitos[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pegado = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 5);
    const nuevos = ['', '', '', '', ''];
    pegado.split('').forEach((c, i) => { nuevos[i] = c; });
    setDigitos(nuevos);
    const foco = Math.min(pegado.length, 4);
    inputsRef.current[foco]?.focus();
  }

  // validar código
  function handleValidarCodigo(e: FormEvent) {
    e.preventDefault();
    setError('');
    const codigo = digitos.join('');
    if (codigo.length < 5) {
      setError('Ingrese los 5 dígitos del código.');
      return;
    }
    if (codigo !== CODIGO_VALIDO) {
      setError('El código es incorrecto. Intente de nuevo.');
      return;
    }
    setPaso('nueva-contrasena');
  }

  // cambiar contraseña
  async function handleCambiarContrasena(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (contrasena.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (contrasena !== confirmar) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, contrasena }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Error al actualizar la contraseña.');
        setLoading(false);
        return;
      }
      setExito('Contraseña actualizada correctamente. Redirigiendo...');
      setTimeout(() => router.push('/login'), 2000);
    } catch {
      setError('Error de conexión. Intente de nuevo.');
      setLoading(false);
    }
  }

  const inputCls =
    'w-full rounded-md bg-gray-100 border border-gray-200 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';

  return (
    <AuthLayout>
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-6">
          <div className="p-2 rounded-xl bg-[#106A37]">
            <Wallet className="w-5 h-5 text-white" aria-hidden="true" />
          </div>
          <span className="text-xl font-bold text-gray-900">Countoid</span>
        </div>

        {/*EMAIL*/}
        {paso === 'email' && (
          <>
            <h1 className="text-2xl font-bold mb-2">Recuperar contraseña</h1>
            <p className="text-sm text-gray-500 mb-6">
              Ingrese su correo y le enviaremos un código de verificación a su teléfono.
            </p>

            {error && (
              <div role="alert" aria-live="polite" className="mb-4 rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-800">
                {error}
              </div>
            )}

            <form onSubmit={handleSolicitarCodigo} noValidate>
              <div className="mb-5">
                <label htmlFor="fp-email" className="block text-sm font-medium mb-1">
                  Correo electrónico
                </label>
                <input
                  id="fp-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Correo o código de usuario"
                  className={inputCls}
                  aria-required="true"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-md transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
              >
                {loading ? 'Enviando...' : 'Reenviar código'}
              </button>
            </form>

            <p className="text-sm text-center mt-4 text-gray-600">
              <Link href="/login" className="text-blue-600 underline hover:text-blue-800 focus-visible:ring-2 focus-visible:ring-blue-500 rounded">
                Volver al inicio de sesión
              </Link>
            </p>
          </>
        )}

        {/*CÓDIGO*/}
        {paso === 'codigo' && (
          <>
            <h1 className="text-2xl font-bold mb-2">Recuperar contraseña</h1>

            {error && (
              <div role="alert" aria-live="polite" className="mb-4 rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-800">
                {error}
              </div>
            )}

            <p className="text-sm text-gray-700 mb-1">
              Se envió un código de 5 dígitos al{' '}
              <strong>{telefonoEnmascarado}</strong>.
            </p>

            <div className="flex items-center justify-between mb-5">
              <p className="text-sm text-gray-500">
                {timerSegundos > 0 ? (
                  <>
                    Faltan:{' '}
                    <strong className="text-gray-700">{formatearTiempo(timerSegundos)} min</strong>{' '}
                    Faltan para poder reenviar el código.
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={handleReenviar}
                    disabled={loading}
                    className="text-blue-600 underline hover:text-blue-800 focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
                  >
                    Reenviar código
                  </button>
                )}
              </p>
            </div>

            <form onSubmit={handleValidarCodigo} noValidate>
              <fieldset className="mb-5">
                <legend className="sr-only">Código de verificación de 5 dígitos</legend>
                <div className="flex gap-3 justify-center" aria-label="Ingrese el código de 5 dígitos">
                  {digitos.map((d, i) => (
                    <input
                      key={i}
                      ref={(el) => { inputsRef.current[i] = el; }}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]"
                      maxLength={1}
                      value={d}
                      onChange={(e) => handleDigito(i, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(i, e)}
                      onPaste={i === 0 ? handlePaste : undefined}
                      aria-label={`Dígito ${i + 1} de 5`}
                      className="w-12 h-12 text-center text-lg font-semibold rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    />
                  ))}
                </div>
              </fieldset>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-md transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
              >
                Validar
              </button>
            </form>

            <p className="text-sm text-center mt-4 text-gray-600">
              <Link href="/login" className="text-blue-600 underline hover:text-blue-800 focus-visible:ring-2 focus-visible:ring-blue-500 rounded">
                Volver al inicio de sesión
              </Link>
            </p>
          </>
        )}

        {/*NUEVA CONTRASEÑA*/}
        {paso === 'nueva-contrasena' && (
          <>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-full bg-green-50 text-green-600" aria-hidden="true">
                <KeyRound className="w-5 h-5" />
              </div>
              <h1 className="text-2xl font-bold">Nueva contraseña</h1>
            </div>
            <p className="text-sm text-gray-500 mb-6">
              Ingrese y confirme su nueva contraseña para la cuenta{' '}
              <strong className="text-gray-700">{email}</strong>.
            </p>

            {error && (
              <div role="alert" aria-live="polite" className="mb-4 rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-800">
                {error}
              </div>
            )}

            {exito && (
              <div role="status" aria-live="polite" className="mb-4 rounded-md bg-green-50 border border-green-200 p-3 text-sm text-green-800">
                {exito}
              </div>
            )}

            <form onSubmit={handleCambiarContrasena} noValidate>
              <div className="mb-4">
                <label htmlFor="np-contrasena" className="block text-sm font-medium mb-1">
                  Nueva contraseña
                </label>
                <div className="relative">
                  <input
                    id="np-contrasena"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="new-password"
                    minLength={8}
                    value={contrasena}
                    onChange={(e) => setContrasena(e.target.value)}
                    placeholder="Ingrese su nueva contraseña"
                    aria-describedby="np-hint"
                    className={`${inputCls} pr-10`}
                    aria-required="true"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    aria-pressed={showPassword}
                    aria-controls="np-contrasena"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 p-1 rounded focus-visible:ring-2 focus-visible:ring-blue-500"
                  >
                    {showPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
                  </button>
                </div>
                <p id="np-hint" className="text-xs text-gray-500 mt-1">Mínimo 8 caracteres.</p>
              </div>

              <div className="mb-6">
                <label htmlFor="np-confirmar" className="block text-sm font-medium mb-1">
                  Confirmar contraseña
                </label>
                <div className="relative">
                  <input
                    id="np-confirmar"
                    type={showConfirm ? 'text' : 'password'}
                    required
                    autoComplete="new-password"
                    value={confirmar}
                    onChange={(e) => setConfirmar(e.target.value)}
                    placeholder="Repita su nueva contraseña"
                    className={`${inputCls} pr-10`}
                    aria-required="true"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    aria-label={showConfirm ? 'Ocultar confirmación' : 'Mostrar confirmación'}
                    aria-pressed={showConfirm}
                    aria-controls="np-confirmar"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 p-1 rounded focus-visible:ring-2 focus-visible:ring-blue-500"
                  >
                    {showConfirm ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !!exito}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-md transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
              >
                {loading ? 'Guardando...' : 'Cambiar contraseña'}
              </button>
            </form>
          </>
        )}
      </div>
    </AuthLayout>
  );
}
