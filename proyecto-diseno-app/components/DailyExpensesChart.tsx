'use client';

import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';

interface DailyExpenseItem {
  label: string;
  monto: number;
}

interface Props {
  data: DailyExpenseItem[];
  promedio: number;
}

export default function DailyExpensesChart({ data, promedio }: Props) {
  const COLOR_BAJO_PROMEDIO = '#15803d';
  const COLOR_SOBRE_PROMEDIO = '#ef4444';

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-2">
        <div className="flex items-baseline gap-2">
          <h2 className="text-xl font-bold text-gray-900">Gasto diario</h2>
          <span className="text-xs text-gray-400 font-normal">(últimos 7 días)</span>
        </div>
        
        <div className="flex items-center gap-4 text-xs font-medium text-gray-600">
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-0.5 border-t border-dashed border-gray-400"></span>
            <span>Promedio ₡{promedio.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
          </div>
        </div>
      </div>

      <div className="w-full h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
            
            <XAxis 
              dataKey="label" 
              tickLine={false}
              axisLine={{ stroke: '#e5e7eb' }}
              tick={{ fill: '#6b7280', fontSize: 12 }}
            />
            
            <YAxis 
              tickFormatter={(value) => `₡${value}`}
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#6b7280', fontSize: 12 }}
            />
            
            <Tooltip 
              formatter={(value: any) => [`₡${Number(value || 0).toLocaleString('en-US')}`, 'Gasto']}
              labelStyle={{ fontWeight: 'bold' }}
              contentStyle={{ borderRadius: '8px', borderColor: '#e5e7eb' }}
            />

            <ReferenceLine 
              y={promedio} 
              stroke="#9ca3af" 
              strokeDasharray="4 4" 
            />

            <Bar dataKey="monto" radius={[4, 4, 0, 0]} maxBarSize={40}>
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.monto > promedio ? COLOR_SOBRE_PROMEDIO : COLOR_BAJO_PROMEDIO} 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}