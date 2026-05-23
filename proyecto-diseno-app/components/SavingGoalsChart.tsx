'use client';

import { CheckCircle2 } from 'lucide-react';

interface Goal {
  nombre: string;
  actual: number;
  objetivo: number;
  color: string;
}

interface Props {
  goals: Goal[];
}

export default function SavingsGoals({ goals }: Props) {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm w-full">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Metas de ahorro por categoría</h2>
      
      <div className="space-y-8">
        {goals.map((goal, index) => {
          const porcentajeExacto = (goal.actual / goal.objetivo) * 100;
          const porcentaje = Math.min(Math.round(porcentajeExacto), 100);
          const faltan = Math.max(goal.objetivo - goal.actual, 0);
          const estaCompletada = goal.actual >= goal.objetivo;

          // Asignación de colores con sentido lógico según el porcentaje alcanzado
          let colorDinamico = '#ef4444'; // Rojo por defecto (< 25%)

          if (porcentajeExacto >= 100) {
            colorDinamico = '#16a34a'; // Verde (igual o mayor a 100%)
          } else if (porcentajeExacto >= 75) {
            colorDinamico = '#22c55e'; // Verde claro / Progreso muy alto (menor a 100%)
          } else if (porcentajeExacto >= 50) {
            colorDinamico = '#f97316'; // Anaranjado (menor al 75%)
          } else if (porcentajeExacto >= 25) {
            colorDinamico = '#eab308'; // Amarillo (menor al 50%)
          }

          return (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-end">
                <div>
                  <h3 className="font-bold text-gray-900 text-base">{goal.nombre}</h3>
                  {estaCompletada && (
                    <div className="flex items-center gap-1 text-green-600 text-sm font-medium mt-0.5">
                      <span>Meta alcanzada</span>
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  )}
                </div>
                <div className="text-right text-sm">
                  <span className={`font-bold ${estaCompletada ? 'text-green-600' : 'text-gray-900'}`}>
                    CRC {goal.actual.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <span className="text-gray-400 font-medium">
                    / CRC {goal.objetivo.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-1000"
                  style={{ 
                    width: `${porcentaje}%`,
                    backgroundColor: colorDinamico 
                  }}
                />
              </div>

              {!estaCompletada && (
                <div className="flex gap-2 text-xs">
                  <span className="text-gray-500 font-bold">{porcentaje}% —</span>
                  <span className="text-gray-400">faltan CRC {faltan.toLocaleString('en-US', { maximumFractionDigits: 2 })}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}