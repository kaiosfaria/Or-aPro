'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus, X, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { addExpense, getExpenses, getCategories } from '@/lib/storage';

interface Payment {
  id: string;
  title: string;
  amount: number;
  date: string;
  category: string;
  color: string;
  type?: 'receita' | 'despesa';
}

interface PaymentCalendarProps {
  payments: Payment[];
}

export default function PaymentCalendar({ payments: initialPayments }: PaymentCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [payments, setPayments] = useState(initialPayments);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [transactionType, setTransactionType] = useState<'receita' | 'despesa'>('despesa');
  
  // Form states
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const categories = getCategories();

  // Atualizar saldo automaticamente quando a data chegar
  useEffect(() => {
    const checkDailyPayments = () => {
      const today = new Date().toISOString().split('T')[0];
      const todayPayments = payments.filter(p => p.date === today);
      
      if (todayPayments.length > 0) {
        // Atualizar saldo do usuário
        console.log('Pagamentos de hoje:', todayPayments);
        // Aqui você pode adicionar lógica para atualizar o saldo do usuário
      }
    };

    checkDailyPayments();
    
    // Verificar a cada hora
    const interval = setInterval(checkDailyPayments, 3600000);
    
    return () => clearInterval(interval);
  }, [payments]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const getPaymentsForDay = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return payments.filter(p => p.date === dateStr);
  };

  const handleDayClick = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setSelectedDate(dateStr);
    setShowAddModal(true);
  };

  const handleAddTransaction = () => {
    if (!amount || !category || !description || !selectedDate) {
      alert('Preencha todos os campos');
      return;
    }

    const newTransaction: Payment = {
      id: Date.now().toString(),
      title: description,
      amount: parseFloat(amount),
      date: selectedDate,
      category,
      color: categories.find(c => c.name === category)?.color || '#999999',
      type: transactionType,
    };

    // Adicionar ao storage
    if (transactionType === 'despesa') {
      addExpense({
        id: newTransaction.id,
        userId: 'current-user',
        amount: newTransaction.amount,
        category: newTransaction.category,
        description: newTransaction.title,
        date: newTransaction.date,
        createdAt: new Date().toISOString(),
      });
    }

    // Atualizar estado local
    setPayments([...payments, newTransaction]);

    // Resetar form
    setAmount('');
    setCategory('');
    setDescription('');
    setShowAddModal(false);
    setSelectedDate(null);
  };

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
    <>
      <div className="bg-white rounded-3xl p-6 shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-900">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <div className="flex gap-2">
            <button
              onClick={previousMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-all"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={nextMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-all"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Day names */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {dayNames.map(day => (
            <div key={day} className="text-center text-xs font-semibold text-gray-500 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-2">
          {/* Empty cells for days before month starts */}
          {Array.from({ length: startingDayOfWeek }).map((_, index) => (
            <div key={`empty-${index}`} className="aspect-square" />
          ))}

          {/* Days of the month */}
          {Array.from({ length: daysInMonth }).map((_, index) => {
            const day = index + 1;
            const dayPayments = getPaymentsForDay(day);
            const isToday = 
              day === new Date().getDate() &&
              currentDate.getMonth() === new Date().getMonth() &&
              currentDate.getFullYear() === new Date().getFullYear();

            return (
              <button
                key={day}
                onClick={() => handleDayClick(day)}
                className={`aspect-square p-1 rounded-lg border transition-all hover:shadow-md ${
                  isToday
                    ? 'border-purple-500 bg-purple-50'
                    : dayPayments.length > 0
                    ? 'border-orange-300 bg-orange-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-center">
                  <span className={`text-sm font-semibold ${
                    isToday ? 'text-purple-600' : 'text-gray-900'
                  }`}>
                    {day}
                  </span>
                  {dayPayments.length > 0 && (
                    <div className="mt-1 space-y-0.5">
                      {dayPayments.slice(0, 2).map(payment => (
                        <div
                          key={payment.id}
                          className="w-full h-1 rounded-full"
                          style={{ backgroundColor: payment.color }}
                          title={`${payment.title} - R$ ${payment.amount.toFixed(2)}`}
                        />
                      ))}
                      {dayPayments.length > 2 && (
                        <div className="text-[8px] text-gray-500">+{dayPayments.length - 2}</div>
                      )}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Próximos Pagamentos</h3>
          <div className="space-y-2">
            {payments.slice(0, 5).map(payment => (
              <div key={payment.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: payment.color }}
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{payment.title}</p>
                    <p className="text-xs text-gray-500">{new Date(payment.date).toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>
                <span className={`text-sm font-bold ${payment.type === 'receita' ? 'text-green-600' : 'text-red-600'}`}>
                  {payment.type === 'receita' ? '+' : '-'} R$ {payment.amount.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal Adicionar Transação */}
      {showAddModal && selectedDate && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">
                Adicionar Transação
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setSelectedDate(null);
                  setAmount('');
                  setCategory('');
                  setDescription('');
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition-all"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="mb-4 p-3 bg-gray-50 rounded-xl">
              <p className="text-sm text-gray-600">Data selecionada:</p>
              <p className="font-bold text-gray-900">
                {new Date(selectedDate + 'T00:00:00').toLocaleDateString('pt-BR', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
            </div>

            {/* Tipo de Transação */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <button
                onClick={() => setTransactionType('despesa')}
                className={`p-3 rounded-xl border-2 transition-all ${
                  transactionType === 'despesa'
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <ArrowDownCircle className={`w-6 h-6 mx-auto mb-1 ${
                  transactionType === 'despesa' ? 'text-red-500' : 'text-gray-400'
                }`} />
                <span className="text-sm font-semibold text-gray-900">Despesa</span>
              </button>

              <button
                onClick={() => setTransactionType('receita')}
                className={`p-3 rounded-xl border-2 transition-all ${
                  transactionType === 'receita'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <ArrowUpCircle className={`w-6 h-6 mx-auto mb-1 ${
                  transactionType === 'receita' ? 'text-green-500' : 'text-gray-400'
                }`} />
                <span className="text-sm font-semibold text-gray-900">Receita</span>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valor (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoria
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Selecione...</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.name}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Ex: Conta de luz"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setSelectedDate(null);
                  setAmount('');
                  setCategory('');
                  setDescription('');
                }}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddTransaction}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
              >
                Adicionar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
