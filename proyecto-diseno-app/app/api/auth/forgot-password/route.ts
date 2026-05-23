import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function enmascararTelefono(tel: string): string {
  if (!tel || tel.length < 4) return '****';
  const ultimos = tel.slice(-2);
  const inicio = tel.length > 6 ? tel.slice(0, 4) : tel.slice(0, 2);
  return `${inicio} **** **${ultimos}`;
}

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || !email.trim()) {
      return NextResponse.json({ error: 'El correo electrónico es requerido' }, { status: 400 });
    }

    // Respuesta genérica: no revelamos si el correo existe o no (seguridad)
    const user = await prisma.usuarios.findUnique({ where: { email: email.trim() } });

    if (!user) {
      // Mismo mensaje para no revelar si el correo está registrado
      return NextResponse.json({
        success: true,
        telefonoEnmascarado: '+506 **** **00',
      });
    }

    return NextResponse.json({
      success: true,
      telefonoEnmascarado: enmascararTelefono(user.telefono),
    });
  } catch (err) {
    console.error('Error en forgot-password:', err);
    return NextResponse.json({ error: 'Error en el servidor' }, { status: 500 });
  }
}
