import { ArrowUpRight, ArrowDownRight } from "lucide-react";

interface SummaryCardProps {
  title: string;
  amount: string;
  percentage: string;
  isPositive: boolean;
}

export default function SummaryCard({ title, amount, percentage, isPositive }: SummaryCardProps) {
  return (
    // Agregar tabIndex={0} ?
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between">
      
     
      <h3 className="text-sm font-medium text-gray-500 mb-2">{title}</h3>
      
      <div className="flex items-center justify-between">
        <span className="text-3xl font-bold text-gray-900">{amount}</span>
        
        <div className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold ${
          isPositive ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
        }`}>
          
          {/* Ocultar el ícono del lector de pantalla */}
          {isPositive ? (
            <ArrowUpRight className="w-3 h-3" aria-hidden="true" />
          ) : (
            <ArrowDownRight className="w-3 h-3" aria-hidden="true" />
          )}
          
          {/*Texto exclusivo para el lector de pantalla usando 'sr-only' */}
          <span className="sr-only">
            {isPositive ? "Hubo un aumento del " : "Hubo una disminución del "}
          </span>
          
         
          <span>{percentage}</span>
        </div>
      </div>
    </div>
  );
}