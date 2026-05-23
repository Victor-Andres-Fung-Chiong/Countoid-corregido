import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { createSessionToken } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { nombre, apellido, email, contrasena, telefono, pais, provincia } = await request.json();

    if (!nombre || !apellido || !email || !contrasena || !telefono || !pais || !provincia) {
      return NextResponse.json({ error: 'Todos los campos son requeridos' }, { status: 400 });
    }
    const emailTrimmed = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed)) {
      return NextResponse.json({ error: 'Correo electrónico no válido' }, { status: 400 });
    }
    const telefonoDigits = String(telefono).replace(/\D/g, '');
    if (telefonoDigits.length < 8 || telefonoDigits.length > 15) {
      return NextResponse.json({ error: 'Telefono no valido' }, { status: 400 });
    }
    if (contrasena.length < 8) {
      return NextResponse.json({ error: 'La contraseña debe tener al menos 8 caracteres' }, { status: 400 });
    }

    const existing = await prisma.usuarios.findUnique({ where: { email: emailTrimmed } });
    if (existing) {
      return NextResponse.json({ error: 'Este correo ya está registrado' }, { status: 409 });
    }

    const hashed = await bcrypt.hash(contrasena, 10);

    const user = await prisma.usuarios.create({
      data: { nombre, apellido, email: emailTrimmed, telefono, pais, provincia, contrasena: hashed },
    });

    await prisma.cuentas.create({
      data: {
        id_usuario: user.id_usuario,
        nombre: 'Mi cuenta principal',
        tipo_moneda: 'CRC',
        saldo_actual: 0,
      },
    });

    const token = await createSessionToken({ userId: user.id_usuario, email: user.email });

    const cookieStore = await cookies();
    cookieStore.set('session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return NextResponse.json({
      success: true,
      user: { id: user.id_usuario, nombre: user.nombre, email: user.email },
    });
  } catch (err) {
    console.error('Error de registro:', err);
    return NextResponse.json({ error: 'Error en el servidor' }, { status: 500 });
  }
}