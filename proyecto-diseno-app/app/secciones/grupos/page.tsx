import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import GruposClient, { GroupCard } from './GruposClient';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=300&fit=crop';

export default async function Grupos() {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }

  const grupos = await prisma.grupos.findMany({
    where: {
      OR: [
        { id_creador: session.userId },
        { grupo_usuarios: { some: { id_usuario: session.userId } } },
      ],
    },
    include: {
      usuarios: { select: { nombre: true, apellido: true } },
      grupo_usuarios: {
        include: {
          usuarios: { select: { nombre: true, apellido: true } },
        },
      },
    },
    orderBy: { fecha_creacion: 'desc' },
  });

  const groupCards: GroupCard[] = grupos.map((group) => {
    const creador = group.usuarios ? `${group.usuarios.nombre} ${group.usuarios.apellido}` : 'Sin creador';
    const miembros = group.grupo_usuarios.map((member) => {
      const nombre = member.usuarios ? `${member.usuarios.nombre} ${member.usuarios.apellido}` : 'Sin nombre';
      return { id: String(member.id_usuario), nombre, rol: member.rol };
    });
    return {
      id: String(group.id_group),
      name: group.nombre,
      owner: group.descripcion || 'Sin descripcion',
      image: FALLBACK_IMAGE,
      isOwner: group.id_creador === session.userId,
      creator: creador,
      createdAt: group.fecha_creacion.toISOString(),
      members: miembros,
    };
  });

  return <GruposClient groups={groupCards} />;
}