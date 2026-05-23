'use client';

import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="flex items-center gap-2 px-4 py-2 rounded-md border border-green-500 hover:bg-green-700 transition text-sm font-medium focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
      aria-label="Cerrar sesión"
    >
      <LogOut className="w-4 h-4" aria-hidden="true" />
      <span>Cerrar sesión</span>
    </button>
  );
}
