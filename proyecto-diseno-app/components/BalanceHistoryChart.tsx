'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';

interface BalanceItem {
  mes: string;
  balance: number;
}

interface Props {
  data: BalanceItem[];
  metaFija: number;
}

export default function BalanceHistoryChart({ data, metaFija }: Props) {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-2">
        <h2 className="text-xl font-bold text-gray-900">Balance histórico</h2>
        
        {/* Leyenda idéntica a la imagen */}
        <div className="flex items-center gap-4 text-xs font-medium text-gray-600">
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-3 rounded border border-green-700 bg-green-50"></span>
            <span>Balance</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-0.5 border-t border-dashed border-red-400"></span>
            <span>Meta ₡{metaFija.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
          </div>
        </div>
      </div>

      <div className="w-full h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 20, bottom: 5 }}>
            <defs>
              {/* Degradado verde traslúcido para el fondo del área */}
              <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#15803d" stopOpacity={0.15}/>
                <stop offset="95%" stopColor="#15803d" stopOpacity={0.01}/>
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
            
            <XAxis 
              dataKey="mes" 
              tickLine={false}
              axisLine={{ stroke: '#e5e7eb' }}
              tick={{ fill: '#6b7280', fontSize: 12 }}
            />
            
            <YAxis 
              tickFormatter={(value) => `₡${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`}
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#6b7280', fontSize: 12 }}
            />
            
            <Tooltip 
              formatter={(value: any) => [`₡${Number(value || 0).toLocaleString('en-US')}`, 'Balance']}
              labelStyle={{ fontWeight: 'bold' }}
              contentStyle={{ borderRadius: '8px', borderColor: '#e5e7eb' }}
            />

            {/* Línea de referencia para la Meta fija */}
            <ReferenceLine 
              y={metaFija} 
              stroke="#f87171" 
              strokeDasharray="3 3" 
            />

            {/* Curva suave con punto diseño */}
            <Area 
              type="monotone" 
              dataKey="balance" 
              stroke="#15803d" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorBalance)"
              dot={{ r: 3, stroke: '#15803d', strokeWidth: 2, fill: '#15803d' }}
              activeDot={{ r: 5 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}