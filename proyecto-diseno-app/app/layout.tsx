// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google"; 
import "./globals.css";
import ConditionalNavbar from "../components/ConditionalNavbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Countoid - Dashboard Financiero",
  description: "Maneja tus finanzas de forma profesional",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      {/* color de fondo general de la app aquí en el body */}
      <body className={`${inter.className} bg-[#F8FAFC] min-h-screen`}>
        <a
          href="#contenido-principal"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:bg-white focus:text-blue-700 focus:px-4 focus:py-2 focus:rounded-md focus:shadow-lg focus:underline focus:outline-none"
        >
          Saltar al contenido principal
        </a>
        {/* El Navbar queda fijo arriba */}
        <ConditionalNavbar />
        
        {/* {children} es la página actual */}
        {children}
      </body>
    </html>
  );
}