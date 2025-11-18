'use client';

import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { getExpenses } from '@/lib/storage';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function PerformanceChart() {
  const [chartData, setChartData] = useState<any[]>([]);
  const [totalChange, setTotalChange] = useState(0);

  useEffect(() => {
    const expenses = getExpenses();
    const currentYear = new Date().getFullYear();
    
    // Criar dados para os últimos 12 meses
    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const monthlyData = monthNames.map((month, index) => {
      const monthExpenses = expenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate.getMonth() === index && expenseDate.getFullYear() === currentYear;
      });

      const total = monthExpenses.reduce((sum, expense) => {
        // Se for receita (começa com [RECEITA]), soma positivo, senão negativo
        if (expense.description.startsWith('[RECEITA]')) {
          return sum + expense.amount;
        }
        return sum - expense.amount;
      }, 0);

      return {
        month,
        valor: total,
        gastos: monthExpenses.filter(e => !e.description.startsWith('[RECEITA]')).reduce((sum, e) => sum + e.amount, 0),
        receitas: monthExpenses.filter(e => e.description.startsWith('[RECEITA]')).reduce((sum, e) => sum + e.amount, 0),
      };
    });

    setChartData(monthlyData);

    // Calcular variação total do ano
    const firstMonth = monthlyData[0]?.valor || 0;
    const lastMonth = monthlyData[monthlyData.length - 1]?.valor || 0;
    const change = lastMonth - firstMonth;
    setTotalChange(change);
  }, []);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-900 mb-2">{payload[0].payload.month}</p>
          <p className="text-sm text-green-600">Receitas: R$ {payload[0].payload.receitas.toFixed(2)}</p>
          <p className="text-sm text-red-600">Gastos: R$ {payload[0].payload.gastos.toFixed(2)}</p>
          <p className="text-sm font-bold text-gray-900 mt-2">
            Saldo: R$ {payload[0].value.toFixed(2)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-3xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Evolução Anual</h2>
            <p className="text-sm text-gray-500">Desempenho mês a mês em {new Date().getFullYear()}</p>
          </div>
          <div className="text-right">
            <div className={`flex items-center gap-2 ${totalChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {totalChange >= 0 ? (
                <TrendingUp className="w-5 h-5" />
              ) : (
                <TrendingDown className="w-5 h-5" />
              )}
              <span className="font-bold text-lg">
                {totalChange >= 0 ? '+' : ''}R$ {Math.abs(totalChange).toFixed(2)}
              </span>
            </div>
            <p className="text-xs text-gray-500">Variação anual</p>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorValor" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="month" 
              stroke="#9CA3AF"
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="#9CA3AF"
              style={{ fontSize: '12px' }}
              tickFormatter={(value) => `R$ ${value}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="valor" 
              stroke="#8B5CF6" 
              strokeWidth={3}
              fill="url(#colorValor)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-4 text-white">
          <p className="text-sm opacity-90 mb-1">Total Receitas</p>
          <p className="text-2xl font-bold">
            R$ {chartData.reduce((sum, month) => sum + month.receitas, 0).toFixed(2)}
          </p>
        </div>
        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-4 text-white">
          <p className="text-sm opacity-90 mb-1">Total Gastos</p>
          <p className="text-2xl font-bold">
            R$ {chartData.reduce((sum, month) => sum + month.gastos, 0).toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
}
