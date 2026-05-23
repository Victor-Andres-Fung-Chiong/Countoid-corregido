import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type UpdatePayload = {
  nombre?: string;
  apellido?: string;
  email?: string;
  telefono?: string;
  pais?: string;
  provincia?: string;
};

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
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
    return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
  }

  return NextResponse.json({
    user: {
      id: user.id_usuario,
      nombre: user.nombre,
      apellido: user.apellido,
      email: user.email,
      telefono: user.telefono,
      pais: user.pais,
      provincia: user.provincia,
    },
  });
}

export async function PUT(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  let payload: UpdatePayload;
  try {
    payload = (await request.json()) as UpdatePayload;
  } catch {
    return NextResponse.json({ error: 'JSON invalido' }, { status: 400 });
  }

  const data: UpdatePayload = {};

  if (payload.nombre !== undefined) {
    const nombre = payload.nombre.trim();
    if (!nombre) {
      return NextResponse.json({ error: 'Nombre requerido' }, { status: 400 });
    }
    data.nombre = nombre;
  }

  if (payload.apellido !== undefined) {
    const apellido = payload.apellido.trim();
    if (!apellido) {
      return NextResponse.json({ error: 'Apellidos requeridos' }, { status: 400 });
    }
    data.apellido = apellido;
  }

  if (payload.email !== undefined) {
    const email = payload.email.trim();
    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json({ error: 'Correo no valido' }, { status: 400 });
    }
    data.email = email;
  }

  if (payload.telefono !== undefined) {
    const telefono = payload.telefono.trim();
    const telefonoDigits = telefono.replace(/\D/g, '');
    if (!telefono) {
      return NextResponse.json({ error: 'Telefono requerido' }, { status: 400 });
    }
    if (telefonoDigits.length < 8 || telefonoDigits.length > 15) {
      return NextResponse.json({ error: 'Telefono no valido' }, { status: 400 });
    }
    data.telefono = telefono;
  }

  if (payload.pais !== undefined) {
    const pais = payload.pais.trim();
    if (!pais) {
      return NextResponse.json({ error: 'Pais requerido' }, { status: 400 });
    }
    data.pais = pais;
  }

  if (payload.provincia !== undefined) {
    const provincia = payload.provincia.trim();
    if (!provincia) {
      return NextResponse.json({ error: 'Provincia requerida' }, { status: 400 });
    }
    data.provincia = provincia;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: 'Sin cambios para actualizar' }, { status: 400 });
  }

  if (data.email) {
    const existing = await prisma.usuarios.findUnique({ where: { email: data.email } });
    if (existing && existing.id_usuario !== session.userId) {
      return NextResponse.json({ error: 'Este correo ya esta registrado' }, { status: 409 });
    }
  }

  const updated = await prisma.usuarios.update({
    where: { id_usuario: session.userId },
    data,
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

  return NextResponse.json({
    user: {
      id: updated.id_usuario,
      nombre: updated.nombre,
      apellido: updated.apellido,
      email: updated.email,
      telefono: updated.telefono,
      pais: updated.pais,
      provincia: updated.provincia,
    },
  });
}
