'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import {
  Home, CreditCard, Car, Apple, ShoppingBag, Plane, BookOpen,
  Tv, Heart, ShoppingCart, CircleDashed, Briefcase,
} from "lucide-react";

export interface CategoryData {
  name: string;
  value: number;
  rawAmount: number;
}

interface CategoryExpensesProps {
  data: CategoryData[];
}

// Paleta accesible para daltonismo: difieren en matiz Y luminosidad
const COLORS = [
  "#0043CE", // azul oscuro
  "#FF832B", // naranja
  "#42BE65", // verde claro
  "#8A3FFC", // violeta
  "#009D9A", // teal
  "#F1C21B", // amarillo
  "#EE5396", // rosa
  "#A56EFF", // lila
];

// Etiquetas cortas para mostrar en el gráfico (máx. 4 chars)
function abreviar(nombre: string): string {
  const palabras = nombre.trim().split(/\s+/);
  if (palabras.length === 1) return nombre.slice(0, 4).toUpperCase();
  return (palabras[0][0] + (palabras[1]?.[0] ?? '')).toUpperCase();
}

function obtenerIcono(nombre: string) {
  const n = nombre.toLowerCase();
  if (n.includes("casa") || n.includes("alquiler") || n.includes("hogar")) return Home;
  if (n.includes("tarjeta") || n.includes("banco") || n.includes("crédito")) return CreditCard;
  if (n.includes("transporte") || n.includes("uber") || n.includes("gasolina") || n.includes("auto")) return Car;
  if (n.includes("alimento") || n.includes("comida") || n.includes("super") || n.includes("mercado")) return Apple;
  if (n.includes("compra") || n.includes("ropa") || n.includes("shopping")) return ShoppingBag;
  if (n.includes("viaje") || n.includes("vuelo") || n.includes("vacacion")) return Plane;
  if (n.includes("educac") || n.includes("curso") || n.includes("libro")) return BookOpen;
  if (n.includes("entretenim") || n.includes("netflix") || n.includes("cine")) return Tv;
  if (n.includes("salud") || n.includes("medic") || n.includes("farmac")) return Heart;
  if (n.includes("trabajo") || n.includes("oficina") || n.includes("negocio")) return Briefcase;
  if (n.includes("otro") || n.includes("general")) return ShoppingCart;
  return CircleDashed;
}

// Etiqueta personalizada dentro de cada segmento del gráfico
function RenderLabel({
  cx, cy, midAngle, innerRadius, outerRadius, percent, name,
}: any) {
  if (percent < 0.05) return null; // no mostrar etiqueta en segmentos muy pequeños

  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.55;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={10}
      fontWeight="bold"
      aria-hidden="true"
    >
      {abreviar(name)}
    </text>
  );
}

function TooltipPersonalizado({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const { name, value, rawAmount } = payload[0].payload;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2 text-sm">
      <p className="font-semibold text-gray-900">{name}</p>
      <p className="text-gray-600">CRC {Number(rawAmount).toFixed(2)}</p>
      <p className="text-gray-400">{value.toString().replace('.', ',')}%</p>
    </div>
  );
}

export default function CategoryExpenses({ data }: CategoryExpensesProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm h-full flex flex-col justify-center items-center text-gray-500">
        <CircleDashed className="w-10 h-10 mb-2 opacity-50" aria-hidden="true" />
        <p className="text-sm">No hay gastos para graficar</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
      <h3 className="font-bold text-gray-900 mb-4">Gastos por categoría</h3>

      {/* Leyenda de formas para accesibilidad daltónica */}
      <div className="flex flex-wrap gap-x-3 gap-y-1 mb-4">
        {data.map((cat, i) => (
          <span key={i} className="flex items-center gap-1 text-xs text-gray-600">
            <span
              className="inline-block w-3 h-3 rounded-sm flex-shrink-0"
              style={{ backgroundColor: COLORS[i % COLORS.length] }}
              aria-hidden="true"
            />
            {abreviar(cat.name)}
          </span>
        ))}
      </div>

      <div className="w-full mb-6 flex justify-center" style={{ minHeight: '220px' }}>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={58}
              outerRadius={88}
              paddingAngle={5}
              dataKey="value"
              stroke="none"
              labelLine={false}
              label={RenderLabel}
              aria-label="Gráfico de dona de gastos por categoría"
            >
              {data.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip content={<TooltipPersonalizado />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <ul className="space-y-0" aria-label="Detalle de gastos por categoría">
        {data.map((category, index) => {
          const Icon = obtenerIcono(category.name);
          const color = COLORS[index % COLORS.length];
          return (
            <li
              key={index}
              className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white flex-shrink-0"
                  style={{ backgroundColor: color }}
                  aria-hidden="true"
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-900 font-medium text-sm">{category.name}</span>
                  <span className="text-xs text-gray-400">CRC {category.rawAmount.toFixed(2)}</span>
                </div>
              </div>
              <span className="font-semibold text-gray-700 text-sm ml-2">
                {category.value.toString().replace('.', ',')}%
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
