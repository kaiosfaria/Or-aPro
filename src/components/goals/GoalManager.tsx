'use client';

import { useState, useEffect } from 'react';
import { Plus, Target, Edit2, Trash2, X, Crown, Sparkles } from 'lucide-react';
import { getUser } from '@/lib/storage';
import { User } from '@/lib/types';

interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  monthlySaving: number;
  currentAmount: number;
  createdAt: string;
}

export default function GoalManager() {
  const [user, setUser] = useState<User | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  
  // Form states
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [monthlySaving, setMonthlySaving] = useState('');
  const [currentAmount, setCurrentAmount] = useState('0');

  // IA Suggestions (apenas para Pro)
  const [aiSuggestion, setAiSuggestion] = useState('');

  useEffect(() => {
    const currentUser = getUser();
    setUser(currentUser);

    // Carregar objetivos do localStorage
    const savedGoals = localStorage.getItem('financialGoals');
    if (savedGoals) {
      setGoals(JSON.parse(savedGoals));
    }
  }, []);

  const calculateMonthsToGoal = (goal: Goal) => {
    const remaining = goal.targetAmount - goal.currentAmount;
    if (remaining <= 0) return 0;
    if (goal.monthlySaving <= 0) return Infinity;
    return Math.ceil(remaining / goal.monthlySaving);
  };

  const calculateProgress = (goal: Goal) => {
    return Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
  };

  const generateAISuggestion = (goalData: { name: string; targetAmount: number; monthlySaving: number }) => {
    const months = Math.ceil(goalData.targetAmount / goalData.monthlySaving);
    
    const suggestions = [
      `Para alcançar "${goalData.name}" mais rápido, considere aumentar sua economia mensal em 20%. Isso reduziria o tempo em ${Math.ceil(months * 0.2)} meses.`,
      `Dica: Revise seus gastos em categorias como alimentação e entretenimento. Economizar R$ 50 extras por mês pode acelerar seu objetivo em ${Math.ceil(50 / goalData.monthlySaving * months)} meses.`,
      `Sugestão: Considere investir o valor economizado em uma aplicação que rende 1% ao mês. Isso pode reduzir o tempo necessário em até 15%.`,
      `Análise: Com base no seu padrão de gastos, você pode economizar mais R$ ${(goalData.monthlySaving * 0.3).toFixed(2)} por mês reduzindo despesas não essenciais.`,
    ];

    return suggestions[Math.floor(Math.random() * suggestions.length)];
  };

  const handleAddGoal = () => {
    if (!name || !targetAmount || !monthlySaving) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    const newGoal: Goal = {
      id: Date.now().toString(),
      name,
      targetAmount: parseFloat(targetAmount),
      monthlySaving: parseFloat(monthlySaving),
      currentAmount: parseFloat(currentAmount) || 0,
      createdAt: new Date().toISOString(),
    };

    const updatedGoals = [...goals, newGoal];
    setGoals(updatedGoals);
    localStorage.setItem('financialGoals', JSON.stringify(updatedGoals));

    // Gerar sugestão da IA para usuários Pro
    if (user?.plan === 'pro') {
      const suggestion = generateAISuggestion(newGoal);
      setAiSuggestion(suggestion);
    }

    resetForm();
    setShowAddModal(false);
  };

  const handleEditGoal = () => {
    if (!editingGoal || !name || !targetAmount || !monthlySaving) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    const updatedGoals = goals.map(goal =>
      goal.id === editingGoal.id
        ? { ...goal, name, targetAmount: parseFloat(targetAmount), monthlySaving: parseFloat(monthlySaving), currentAmount: parseFloat(currentAmount) }
        : goal
    );

    setGoals(updatedGoals);
    localStorage.setItem('financialGoals', JSON.stringify(updatedGoals));

    resetForm();
    setEditingGoal(null);
  };

  const handleDeleteGoal = (id: string) => {
    if (confirm('Deseja realmente excluir este objetivo?')) {
      const updatedGoals = goals.filter(goal => goal.id !== id);
      setGoals(updatedGoals);
      localStorage.setItem('financialGoals', JSON.stringify(updatedGoals));
    }
  };

  const openEditModal = (goal: Goal) => {
    setEditingGoal(goal);
    setName(goal.name);
    setTargetAmount(goal.targetAmount.toString());
    setMonthlySaving(goal.monthlySaving.toString());
    setCurrentAmount(goal.currentAmount.toString());
  };

  const resetForm = () => {
    setName('');
    setTargetAmount('');
    setMonthlySaving('');
    setCurrentAmount('0');
    setAiSuggestion('');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">Objetivos Financeiros</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-xl font-semibold text-sm hover:shadow-lg transition-all"
        >
          <Plus className="w-4 h-4" />
          Novo Objetivo
        </button>
      </div>

      {goals.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 shadow-sm text-center">
          <Target className="w-16 h-16 text-purple-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900 mb-2">Nenhum objetivo ainda</h3>
          <p className="text-sm text-gray-600 mb-4">
            Defina metas financeiras e acompanhe seu progresso
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
          >
            Criar Primeiro Objetivo
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {goals.map((goal) => {
            const monthsRemaining = calculateMonthsToGoal(goal);
            const progress = calculateProgress(goal);
            const isCompleted = progress >= 100;

            return (
              <div key={goal.id} className="bg-white rounded-3xl p-5 shadow-sm">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-bold text-gray-900">{goal.name}</h3>
                      {isCompleted && (
                        <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded-full">
                          Concluído! 🎉
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      Meta: R$ {goal.targetAmount.toFixed(2)} • Guardando R$ {goal.monthlySaving.toFixed(2)}/mês
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditModal(goal)}
                      className="p-2 hover:bg-blue-100 rounded-lg transition-all text-blue-600"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteGoal(goal.id)}
                      className="p-2 hover:bg-red-100 rounded-lg transition-all text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Barra de Progresso */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-700">
                      R$ {goal.currentAmount.toFixed(2)}
                    </span>
                    <span className="text-sm font-semibold text-purple-600">
                      {progress.toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Tempo Restante */}
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Tempo estimado</p>
                    <p className="font-bold text-gray-900">
                      {isCompleted
                        ? 'Objetivo alcançado!'
                        : monthsRemaining === Infinity
                        ? 'Defina um valor mensal'
                        : `${monthsRemaining} ${monthsRemaining === 1 ? 'mês' : 'meses'}`}
                    </p>
                  </div>
                  <Target className="w-8 h-8 text-purple-500" />
                </div>

                {/* Sugestão da IA (apenas Pro) */}
                {user?.plan === 'pro' && !isCompleted && (
                  <div className="mt-3 p-3 bg-gradient-to-r from-blue-50 to-purple-50 border border-purple-200 rounded-2xl">
                    <div className="flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-semibold text-gray-900 mb-1">Dica da IA</p>
                        <p className="text-xs text-gray-700">
                          {generateAISuggestion(goal)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Adicionar Objetivo */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Novo Objetivo</h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition-all"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nome do Objetivo</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Ex: Viagem para Europa"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Valor Total</label>
                <input
                  type="number"
                  step="0.01"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quanto deseja guardar por mês?</label>
                <input
                  type="number"
                  step="0.01"
                  value={monthlySaving}
                  onChange={(e) => setMonthlySaving(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Valor já guardado (opcional)</label>
                <input
                  type="number"
                  step="0.01"
                  value={currentAmount}
                  onChange={(e) => setCurrentAmount(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="0.00"
                />
              </div>

              {/* Preview do tempo */}
              {targetAmount && monthlySaving && parseFloat(monthlySaving) > 0 && (
                <div className="p-4 bg-purple-50 border border-purple-200 rounded-2xl">
                  <p className="text-sm font-semibold text-gray-900 mb-1">Tempo estimado</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {Math.ceil((parseFloat(targetAmount) - parseFloat(currentAmount || '0')) / parseFloat(monthlySaving))} meses
                  </p>
                </div>
              )}

              {/* Aviso sobre IA para usuários gratuitos */}
              {user?.plan === 'free' && (
                <div className="p-4 bg-orange-50 border border-orange-200 rounded-2xl">
                  <div className="flex items-start gap-2">
                    <Crown className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-gray-900 mb-1">
                        Desbloqueie a IA Financeira
                      </p>
                      <p className="text-xs text-gray-600">
                        Usuários Pro recebem dicas personalizadas da IA para alcançar objetivos mais rápido
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddGoal}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
              >
                Criar Objetivo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Editar Objetivo */}
      {editingGoal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Editar Objetivo</h3>
              <button
                onClick={() => {
                  setEditingGoal(null);
                  resetForm();
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition-all"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nome do Objetivo</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Ex: Viagem para Europa"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Valor Total</label>
                <input
                  type="number"
                  step="0.01"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quanto deseja guardar por mês?</label>
                <input
                  type="number"
                  step="0.01"
                  value={monthlySaving}
                  onChange={(e) => setMonthlySaving(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Valor já guardado</label>
                <input
                  type="number"
                  step="0.01"
                  value={currentAmount}
                  onChange={(e) => setCurrentAmount(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setEditingGoal(null);
                  resetForm();
                }}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleEditGoal}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
