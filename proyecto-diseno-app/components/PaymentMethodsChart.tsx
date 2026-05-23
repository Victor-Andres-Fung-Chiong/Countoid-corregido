'use client';

import { Cell, PieChart, Pie, ResponsiveContainer } from 'recharts';

interface CategoryItem {
  index: number;
  nombre: string;
  monto: number;
  color: string;
}

interface MethodItem {
  name: string;
  value: number; // Porcentaje
  color: string;
}

interface Props {
  categories: CategoryItem[];
  methods: MethodItem[];
}

export default function PaymentMethods({ categories, methods }: Props) {
  const maxMonto = categories.length > 0 ? Math.max(...categories.map(c => c.monto)) : 1;

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm w-full">
      <div className="flex items-baseline gap-2">
          <h2 className="text-xl font-bold text-gray-900">Métodos de pago</h2>
          <span className="text-xs text-gray-400 font-normal">(por categoría)</span>
      </div>

      <div className="space-y-4 mb-8">
        {categories.map((cat) => {
          const anchoPorcentaje = Math.min((cat.monto / maxMonto) * 100, 100);

          return (
            <div key={cat.index} className="flex items-center justify-between gap-4 py-2 border-b border-gray-50 last:border-0">
              <div className="flex items-center gap-3 w-1/3 min-w-[120px]">
                <span className="w-6 h-6 rounded-full bg-gray-50 flex items-center justify-center text-xs font-bold text-gray-500 border border-gray-100">
                  {cat.index}
                </span>
                <span className="font-semibold text-gray-700 text-sm truncate">{cat.nombre}</span>
              </div>

              <div className="flex-grow bg-gray-50 h-2 rounded-full overflow-hidden max-w-md">
                <div 
                  className="h-full rounded-full transition-all duration-1000"
                  style={{ 
                    width: `${anchoPorcentaje}%`, 
                    backgroundColor: cat.color 
                  }}
                />
              </div>

              {/* Monto Final */}
              <div className="text-right font-bold text-gray-900 text-sm w-20">
                ₡{cat.monto.toLocaleString('en-US')}
              </div>
            </div>
          );
        })}
      </div>

      <hr className="border-gray-100 my-6" />

      <div>
        <h3 className="text-sm font-bold text-gray-700 mb-4">Métodos de pago</h3>
        
        <div className="flex flex-wrap gap-4 items-center mb-6">
          {methods.map((method, idx) => (
            <div key={idx} className="flex items-center gap-2 text-sm font-semibold text-gray-600">
              <span className="w-3 h-3 rounded" style={{ backgroundColor: method.color }} />
              <span>{method.name} {method.value}%</span>
            </div>
          ))}
        </div>

        <div className="w-full h-44 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={methods}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={75}
                paddingAngle={2}
                dataKey="value"
              >
                {methods.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}