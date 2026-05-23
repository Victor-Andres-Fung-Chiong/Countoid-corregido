'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';

const HIDDEN_PREFIXES = ['/login', '/register', '/forgot-password'];

export default function ConditionalNavbar() {
  const pathname = usePathname();

  if (HIDDEN_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return null;
  }

  return <Navbar />;
}
