'use client';

import Link from 'next/link';
import { Wallet } from 'lucide-react';
import { FaInstagram, FaLinkedin } from 'react-icons/fa';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <main id="contenido-principal" tabIndex={-1} className="flex-1 flex flex-col md:flex-row">
        {/* Lado del arte — decorativo, oculto a lectores de pantalla */}
        <aside
          className="hidden md:flex md:w-1/2 lg:w-3/5 bg-[#FDE7E9] items-center justify-center p-8"
          aria-hidden="true"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/login-countoid.png"
            alt=""
            className="max-w-md w-full h-auto object-contain"
          />
        </aside>

        {/* Lado del formulario */}
        <section className="w-full md:w-1/2 lg:w-2/5 flex items-center justify-center p-6 md:p-12">
          {children}
        </section>
      </main>

      <footer className="bg-green-800 text-white px-6 md:px-10 py-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg">
              <Wallet size={22} aria-hidden="true" />
              Countoid
            </Link>
            <nav aria-label="Enlaces del pie de página">
              <ul className="flex gap-6 text-sm">
                <li><Link href="/caracteristicas" className="hover:underline">Características</Link></li>
                <li><Link href="/aprender-mas" className="hover:underline">Aprender más</Link></li>
                <li><Link href="/ayuda" className="hover:underline">Ayuda</Link></li>
              </ul>
            </nav>
          </div>
          <ul className="flex gap-4">
            <li>
              <a href="https://instagram.com" aria-label="Instagram de Countoid"
                 className="inline-flex p-1.5 rounded hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white">
                <FaInstagram size={20} aria-hidden="true" />
              </a>
            </li>
            <li>
              <a href="https://linkedin.com" aria-label="LinkedIn de Countoid"
                 className="inline-flex p-1.5 rounded hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white">
                <FaLinkedin size={20} aria-hidden="true" />
              </a>
            </li>
            <li>
              <a href="https://x.com" aria-label="X (anteriormente Twitter) de Countoid"
                 className="inline-flex p-1.5 rounded hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white font-bold">
                <span aria-hidden="true">𝕏</span>
              </a>
            </li>
          </ul>
        </div>
      </footer>
    </div>
  );
}