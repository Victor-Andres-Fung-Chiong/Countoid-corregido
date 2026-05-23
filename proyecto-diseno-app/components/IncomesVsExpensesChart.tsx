'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
} from 'recharts';

interface DataItem {
  mes: string;
  ingresos: number;
  gastos: number;
}

interface Props {
  data: DataItem[];
}

export default function IncomeVsExpensesChart({ data }: Props) {
  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        Ingresos vs Gastos
      </h2>

      <div className="w-full h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{top: 20,right: 20,left: 30,bottom: 5,}}>
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="mes" />

            <YAxis tickFormatter={(value) => `₡${value}`}/>

            <Tooltip />

            <Legend />

            <Bar
              dataKey="gastos"
              fill="#ef4444"
              radius={[4, 4, 0, 0]}
            />

            <Bar
              dataKey="ingresos"
              fill="#166534"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}