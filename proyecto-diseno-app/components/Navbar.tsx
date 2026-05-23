import { Wallet } from "lucide-react";
import Link from "next/link";
import LogoutButton from "./LogoutButton";

export default function Navbar() {
  return (
    <header>
      <nav aria-label="Navegación principal" className="bg-[#106A37] text-white px-6 py-4 rounded-b-xl shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between">

        <Link href="/secciones/inicio" className="flex items-center gap-2 hover:opacity-90 transition" aria-label="Inicio de Countoid">
          <Wallet className="w-8 h-8" aria-hidden="true" />
          <span className="text-2xl font-bold tracking-wide">Countoid</span>
        </Link>

        <div className="hidden md:flex items-center gap-4 text-sm font-medium">
          <Link href="/secciones/inicio" className="bg-white text-[#106A37] px-4 py-2 rounded-md">
            Inicio
          </Link>
          <Link href="/secciones/estadisticas" className="px-4 py-2 border border-green-500 rounded-md hover:bg-green-700 transition">
            Estadísticas
          </Link>
          <Link href="/secciones/grupos" className="px-4 py-2 border border-green-500 rounded-md hover:bg-green-700 transition">
            Mis Grupos
          </Link>
          <Link href="/secciones/cuenta" className="px-4 py-2 border border-green-500 rounded-md hover:bg-green-700 transition">
            Mi Cuenta
          </Link>
          <LogoutButton />
        </div>
      </div>
    </nav>
    </header>
  );
}