import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import CuentaClient from './CuentaClient';

export default async function Cuenta() {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }

  const user = await prisma.usuarios.findUnique({
    where: { id_usuario: session.userId },
    select: {
      id_usuario: true,
      nombre: true,
      apellido: true,
      email: true,
      telefono: true,
      pais: true,
      provincia: true,
    },
  });

  if (!user) {
    redirect('/login');
  }

  return (
    <CuentaClient
      user={{
        id: user.id_usuario,
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
        telefono: user.telefono,
        pais: user.pais,
        provincia: user.provincia,
      }}
    />
  );
}
