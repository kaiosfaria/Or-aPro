'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  getUser,
  getExpenses,
  getDailyLimits,
  getCategories,
  getInsights,
  addExpense,
  updateExpense,
  deleteExpense,
  updateDailyLimits,
  canCreateExpense,
  canEditExpense,
  generateAIInsights,
  saveInsights,
  clearUser,
} from '@/lib/storage';
import { User, Expense, Category, AIInsight } from '@/lib/types';
import {
  Plus,
  TrendingUp,
  TrendingDown,
  Sparkles,
  Crown,
  LogOut,
  Edit2,
  Trash2,
  AlertCircle,
  Lightbulb,
  CheckCircle,
  Calendar,
  DollarSign,
  Home,
  Receipt,
  Target,
  MoreHorizontal,
  X,
  ArrowUpCircle,
  ArrowDownCircle,
  ArrowLeftRight,
  CreditCard,
  Wallet,
  PieChart,
  BarChart3,
  Settings,
  Bell,
  HelpCircle,
  FileText,
  Users,
  Lock,
  Zap,
  TrendingUpIcon,
  Brain,
  Eye,
  EyeOff,
  Link as LinkIcon,
  Calculator,
} from 'lucide-react';
import PieChartComponent from '@/components/charts/PieChartComponent';
import PaymentCalendar from '@/components/calendar/PaymentCalendar';
import CardManager from '@/components/cards/CardManager';
import FinancialCalculators from '@/components/calculator/FinancialCalculators';
import CategoryManager from '@/components/categories/CategoryManager';
import PerformanceChart from '@/components/performance/PerformanceChart';
import NotificationSettings from '@/components/notifications/NotificationSettings';
import GoalManager from '@/components/goals/GoalManager';

type TabType = 'principal' | 'transacoes' | 'objetivos' | 'ia' | 'mais';
type TransactionType = 'despesa' | 'receita' | 'transferencia' | 'editar' | 'parcela';
type MoreSection = 'graficos' | 'calendario' | 'contas' | 'cartoes' | 'categorias' | 'desempenho' | 'configuracoes' | 'notificacoes' | 'ajuda' | 'convidar' | 'calculadora' | null;

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('principal');
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [transactionType, setTransactionType] = useState<TransactionType | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [dailyLimits, setDailyLimits] = useState({ expensesCreated: 0, editsUsed: 0 });
  const [showProBanner, setShowProBanner] = useState(true);
  const [showBalance, setShowBalance] = useState(true);
  const [activeMoreSection, setActiveMoreSection] = useState<MoreSection>(null);
  const [showOpenFinanceModal, setShowOpenFinanceModal] = useState(false);

  // Form states
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  // Estados para receita e transferência
  const [fromAccount, setFromAccount] = useState('');
  const [toAccount, setToAccount] = useState('');

  useEffect(() => {
    const currentUser = getUser();
    if (!currentUser) {
      router.push('/login');
      return;
    }

    setUser(currentUser);
    setExpenses(getExpenses());
    setCategories(getCategories());
    setInsights(getInsights());
    setDailyLimits(getDailyLimits());

    // Gerar insights se não existirem
    const existingInsights = getInsights();
    if (existingInsights.length === 0) {
      const newInsights = generateAIInsights(getExpenses());
      saveInsights(newInsights);
      setInsights(newInsights);
    }

    // Verificar se já viu o banner (localStorage)
    const hasSeenBanner = localStorage.getItem('hasSeenProBanner');
    if (hasSeenBanner === 'true') {
      setShowProBanner(false);
    }
  }, [router]);

  const handleLogout = () => {
    clearUser();
    router.push('/login');
  };

  const handleCloseBanner = () => {
    setShowProBanner(false);
    localStorage.setItem('hasSeenProBanner', 'true');
  };

  const handleUpgrade = () => {
    router.push('/checkout');
  };

  const handleAddTransaction = () => {
    if (!user) return;

    // Validação baseada no tipo
    if (transactionType === 'despesa' || transactionType === 'receita') {
      if (!canCreateExpense(user)) {
        alert('Você atingiu o limite de 2 transações por dia no plano gratuito. Faça upgrade para Premium!');
        return;
      }

      if (!amount || !category || !description) {
        alert('Preencha todos os campos');
        return;
      }

      const newExpense: Expense = {
        id: Date.now().toString(),
        userId: user.email,
        amount: parseFloat(amount),
        category,
        description: `${transactionType === 'receita' ? '[RECEITA] ' : ''}${description}`,
        date,
        createdAt: new Date().toISOString(),
      };

      addExpense(newExpense);
      
      // Atualizar limites diários
      const limits = getDailyLimits();
      limits.expensesCreated += 1;
      updateDailyLimits(limits);

      // Atualizar estado
      setExpenses(getExpenses());
      setDailyLimits(limits);

      // Gerar novos insights
      const newInsights = generateAIInsights(getExpenses());
      saveInsights(newInsights);
      setInsights(newInsights);

      // Resetar form
      resetForm();
      closeTransactionModal();
    } else if (transactionType === 'transferencia') {
      if (!amount || !fromAccount || !toAccount) {
        alert('Preencha todos os campos');
        return;
      }

      alert(`Transferência de R$ ${amount} de ${fromAccount} para ${toAccount} registrada!`);
      resetForm();
      closeTransactionModal();
    } else if (transactionType === 'parcela') {
      if (!amount || !description) {
        alert('Preencha todos os campos');
        return;
      }

      alert(`Parcela de cartão de R$ ${amount} registrada: ${description}`);
      resetForm();
      closeTransactionModal();
    }
  };

  const handleEditExpense = () => {
    if (!user || !editingExpense) return;

    if (!canEditExpense(user)) {
      alert('Você atingiu o limite de 1 edição por dia no plano gratuito. Faça upgrade para Premium!');
      return;
    }

    updateExpense(editingExpense.id, {
      amount: parseFloat(amount),
      category,
      description,
      date,
    });

    // Atualizar limites diários
    const limits = getDailyLimits();
    limits.editsUsed += 1;
    updateDailyLimits(limits);

    setExpenses(getExpenses());
    setDailyLimits(limits);
    setShowEditModal(false);
    setEditingExpense(null);
    
    resetForm();
  };

  const handleDeleteExpense = (id: string) => {
    if (confirm('Deseja realmente excluir este gasto?')) {
      deleteExpense(id);
      setExpenses(getExpenses());
    }
  };

  const openEditModal = (expense: Expense) => {
    setEditingExpense(expense);
    setAmount(expense.amount.toString());
    setCategory(expense.category);
    setDescription(expense.description);
    setDate(expense.date);
    setShowEditModal(true);
  };

  const resetForm = () => {
    setAmount('');
    setCategory('');
    setDescription('');
    setDate(new Date().toISOString().split('T')[0]);
    setFromAccount('');
    setToAccount('');
  };

  const openTransactionModal = (type: TransactionType) => {
    setTransactionType(type);
    setShowTransactionModal(true);
  };

  const closeTransactionModal = () => {
    setShowTransactionModal(false);
    setTransactionType(null);
    resetForm();
  };

  // Calcular totais
  const today = new Date().toISOString().split('T')[0];
  const todayExpenses = expenses.filter(e => e.date === today);
  const totalToday = todayExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalMonth = expenses
    .filter(e => e.date.startsWith(today.substring(0, 7)))
    .reduce((sum, e) => sum + e.amount, 0);

  // Calcular por categoria para gráfico
  const categoryTotals = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {} as { [key: string]: number });

  // Preparar dados para gráfico de pizza
  const pieChartData = Object.entries(categoryTotals).map(([name, value]) => {
    const cat = categories.find(c => c.name === name);
    return {
      name,
      value,
      color: cat?.color || '#999999',
    };
  });

  // Preparar pagamentos futuros para calendário
  const futurePayments = expenses
    .filter(e => new Date(e.date) >= new Date())
    .map(e => {
      const cat = categories.find(c => c.name === e.category);
      return {
        id: e.id,
        title: e.description,
        amount: e.amount,
        date: e.date,
        category: e.category,
        color: cat?.color || '#999999',
      };
    });

  if (!user) return null;

  const renderMoreSection = () => {
    switch (activeMoreSection) {
      case 'graficos':
        return (
          <div className="space-y-4 pb-24">
            <button
              onClick={() => setActiveMoreSection(null)}
              className="text-purple-600 font-semibold flex items-center gap-2"
            >
              <X className="w-5 h-5" />
              Voltar
            </button>
            <div className="bg-white rounded-3xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Gastos por Categoria</h2>
              {pieChartData.length > 0 ? (
                <PieChartComponent data={pieChartData} />
              ) : (
                <div className="text-center py-8">
                  <PieChart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">Nenhum gasto registrado ainda</p>
                </div>
              )}
            </div>
          </div>
        );

      case 'calendario':
        return (
          <div className="space-y-4 pb-24">
            <button
              onClick={() => setActiveMoreSection(null)}
              className="text-purple-600 font-semibold flex items-center gap-2"
            >
              <X className="w-5 h-5" />
              Voltar
            </button>
            <PaymentCalendar payments={futurePayments} />
          </div>
        );

      case 'cartoes':
        return (
          <div className="space-y-4 pb-24">
            <button
              onClick={() => setActiveMoreSection(null)}
              className="text-purple-600 font-semibold flex items-center gap-2"
            >
              <X className="w-5 h-5" />
              Voltar
            </button>
            <CardManager />
          </div>
        );

      case 'calculadora':
        return (
          <div className="space-y-4 pb-24">
            <button
              onClick={() => setActiveMoreSection(null)}
              className="text-purple-600 font-semibold flex items-center gap-2"
            >
              <X className="w-5 h-5" />
              Voltar
            </button>
            <FinancialCalculators />
          </div>
        );

      case 'categorias':
        return (
          <div className="space-y-4 pb-24">
            <button
              onClick={() => setActiveMoreSection(null)}
              className="text-purple-600 font-semibold flex items-center gap-2"
            >
              <X className="w-5 h-5" />
              Voltar
            </button>
            <CategoryManager />
          </div>
        );

      case 'desempenho':
        return (
          <div className="space-y-4 pb-24">
            <button
              onClick={() => setActiveMoreSection(null)}
              className="text-purple-600 font-semibold flex items-center gap-2"
            >
              <X className="w-5 h-5" />
              Voltar
            </button>
            <PerformanceChart />
          </div>
        );

      case 'notificacoes':
        return (
          <div className="space-y-4 pb-24">
            <button
              onClick={() => setActiveMoreSection(null)}
              className="text-purple-600 font-semibold flex items-center gap-2"
            >
              <X className="w-5 h-5" />
              Voltar
            </button>
            <NotificationSettings />
          </div>
        );

      case 'contas':
        return (
          <div className="space-y-4 pb-24">
            <button
              onClick={() => setActiveMoreSection(null)}
              className="text-purple-600 font-semibold flex items-center gap-2"
            >
              <X className="w-5 h-5" />
              Voltar
            </button>
            <div className="bg-white rounded-3xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Minhas Contas</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center">
                      <Wallet className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">Carteira</p>
                      <p className="text-xs text-gray-500">Dinheiro</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">R$ 0,00</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowOpenFinanceModal(true)}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-4 rounded-2xl hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <LinkIcon className="w-5 h-5" />
                Conectar com Open Finance
              </button>

              {user.plan === 'free' && (
                <div className="mt-4 bg-orange-50 border border-orange-200 rounded-2xl p-4">
                  <div className="flex items-start gap-3">
                    <Crown className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-gray-900 mb-1">
                        Recurso Premium
                      </p>
                      <p className="text-xs text-gray-600 mb-3">
                        Conecte suas contas bancárias automaticamente com Open Finance
                      </p>
                      <button
                        onClick={handleUpgrade}
                        className="text-xs font-semibold text-purple-600 hover:text-purple-700"
                      >
                        Fazer upgrade →
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 'configuracoes':
        return (
          <div className="space-y-4 pb-24">
            <button
              onClick={() => setActiveMoreSection(null)}
              className="text-purple-600 font-semibold flex items-center gap-2"
            >
              <X className="w-5 h-5" />
              Voltar
            </button>
            <div className="bg-white rounded-3xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Configurações</h2>
              <div className="space-y-3">
                <div className="p-4 bg-gray-50 rounded-2xl">
                  <p className="text-sm font-semibold text-gray-900 mb-1">Perfil</p>
                  <p className="text-xs text-gray-600">{user.email}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-2xl">
                  <p className="text-sm font-semibold text-gray-900 mb-1">Plano Atual</p>
                  <p className="text-xs text-gray-600">{user.plan === 'free' ? 'Gratuito' : 'Pro'}</p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const renderContent = () => {
    if (activeMoreSection) {
      return renderMoreSection();
    }

    switch (activeTab) {
      case 'principal':
        return (
          <div className="space-y-4 pb-24">
            {/* Banner Plano Pro */}
            {showProBanner && user.plan === 'free' && (
              <div className="bg-gradient-to-r from-purple-600 via-purple-700 to-pink-600 rounded-3xl p-6 shadow-xl relative overflow-hidden">
                <button
                  onClick={handleCloseBanner}
                  className="absolute top-3 right-3 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
                
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-yellow-400 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Crown className="w-7 h-7 text-purple-900" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-bold text-lg mb-2">Desbloqueie o Plano Pro!</h3>
                    <ul className="space-y-1.5 mb-4">
                      <li className="flex items-center gap-2 text-white/90 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-300 flex-shrink-0" />
                        <span>Gastos ilimitados por dia</span>
                      </li>
                      <li className="flex items-center gap-2 text-white/90 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-300 flex-shrink-0" />
                        <span>Edições ilimitadas</span>
                      </li>
                      <li className="flex items-center gap-2 text-white/90 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-300 flex-shrink-0" />
                        <span>IA Financeira com análises avançadas</span>
                      </li>
                      <li className="flex items-center gap-2 text-white/90 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-300 flex-shrink-0" />
                        <span>Integração com Open Finance</span>
                      </li>
                      <li className="flex items-center gap-2 text-white/90 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-300 flex-shrink-0" />
                        <span>Relatórios personalizados</span>
                      </li>
                    </ul>
                    <button
                      onClick={handleUpgrade}
                      className="w-full bg-yellow-400 hover:bg-yellow-300 text-purple-900 font-bold py-3 rounded-xl transition-all shadow-lg"
                    >
                      Assinar por R$ 19,90/mês
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Card de Saldo */}
            <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-3xl p-6 shadow-xl text-white">
              <div className="flex items-center justify-between mb-4">
                <span className="text-purple-200 text-sm font-medium">Saldo Total</span>
                <button
                  onClick={() => setShowBalance(!showBalance)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-all"
                >
                  {showBalance ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                </button>
              </div>
              <h2 className="text-4xl font-bold mb-6">
                {showBalance ? `R$ ${totalMonth.toFixed(2)}` : '••••••'}
              </h2>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <ArrowUpCircle className="w-5 h-5 text-green-300" />
                    </div>
                    <span className="text-xs text-purple-200">Receitas</span>
                  </div>
                  <p className="text-lg font-bold">R$ 0,00</p>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center">
                      <ArrowDownCircle className="w-5 h-5 text-red-300" />
                    </div>
                    <span className="text-xs text-purple-200">Despesas</span>
                  </div>
                  <p className="text-lg font-bold">R$ {totalMonth.toFixed(2)}</p>
                </div>
              </div>
            </div>

            {/* Contas */}
            <div className="bg-white rounded-3xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-gray-900">Contas</h3>
                <button 
                  onClick={() => setActiveMoreSection('contas')}
                  className="text-purple-600 text-sm font-semibold"
                >
                  Ver todas
                </button>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center">
                      <Wallet className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">Carteira</p>
                      <p className="text-xs text-gray-500">Dinheiro</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">R$ 0,00</p>
                    <button 
                      onClick={() => setActiveMoreSection('contas')}
                      className="text-purple-600 text-xs font-medium"
                    >
                      + Adicionar
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Últimas Transações */}
            <div className="bg-white rounded-3xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-gray-900">Últimas Transações</h3>
                <button 
                  onClick={() => setActiveTab('transacoes')}
                  className="text-purple-600 text-sm font-semibold"
                >
                  Ver todas
                </button>
              </div>
              
              {expenses.length === 0 ? (
                <div className="text-center py-8">
                  <Receipt className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">Nenhuma transação ainda</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {expenses
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .slice(0, 5)
                    .map((expense) => {
                      const categoryData = categories.find(c => c.name === expense.category);
                      return (
                        <div
                          key={expense.id}
                          className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-all"
                        >
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                              style={{ backgroundColor: categoryData?.color + '20' }}
                            >
                              {categoryData?.icon || '📦'}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 text-sm">{expense.description}</p>
                              <p className="text-xs text-gray-500">{new Date(expense.date).toLocaleDateString('pt-BR')}</p>
                            </div>
                          </div>
                          <p className="text-sm font-bold text-red-600">- R$ {expense.amount.toFixed(2)}</p>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          </div>
        );

      case 'transacoes':
        return (
          <div className="space-y-3 pb-24">
            <div className="bg-white rounded-3xl p-5 shadow-sm">
              <h2 className="text-base font-bold text-gray-900 mb-4">Todas as Transações</h2>
              <div className="space-y-2">
                {expenses.length === 0 ? (
                  <div className="text-center py-8">
                    <Receipt className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">Nenhuma transação ainda</p>
                  </div>
                ) : (
                  expenses
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((expense) => {
                      const categoryData = categories.find(c => c.name === expense.category);
                      return (
                        <div
                          key={expense.id}
                          className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div 
                              className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0" 
                              style={{ backgroundColor: categoryData?.color + '20' }}
                            >
                              {categoryData?.icon || '📦'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-gray-900 text-sm truncate">{expense.description}</p>
                              <p className="text-xs text-gray-500">{expense.category} • {new Date(expense.date).toLocaleDateString('pt-BR')}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-bold text-red-600">- R$ {expense.amount.toFixed(2)}</p>
                            <div className="flex gap-1">
                              <button
                                onClick={() => openEditModal(expense)}
                                className="p-1.5 hover:bg-blue-100 rounded-lg transition-all text-blue-600"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteExpense(expense.id)}
                                className="p-1.5 hover:bg-red-100 rounded-lg transition-all text-red-600"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                )}
              </div>
            </div>
          </div>
        );

      case 'objetivos':
        return (
          <div className="space-y-3 pb-24">
            <GoalManager />
          </div>
        );

      case 'ia':
        return (
          <div className="space-y-3 pb-24">
            {user.plan === 'free' ? (
              <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-3xl p-8 shadow-xl text-white text-center">
                <div className="w-16 h-16 bg-yellow-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-8 h-8 text-purple-900" />
                </div>
                <h3 className="text-2xl font-bold mb-3">IA Financeira</h3>
                <p className="text-purple-100 mb-6">
                  Recurso exclusivo do Plano Pro
                </p>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 mb-6 text-left">
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3">
                      <Brain className="w-5 h-5 text-yellow-300 flex-shrink-0" />
                      <span className="text-sm">Análises inteligentes dos seus gastos</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Sparkles className="w-5 h-5 text-yellow-300 flex-shrink-0" />
                      <span className="text-sm">Sugestões personalizadas de economia</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <TrendingUpIcon className="w-5 h-5 text-yellow-300 flex-shrink-0" />
                      <span className="text-sm">Previsões de gastos futuros</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Zap className="w-5 h-5 text-yellow-300 flex-shrink-0" />
                      <span className="text-sm">Alertas inteligentes em tempo real</span>
                    </li>
                  </ul>
                </div>
                <button
                  onClick={handleUpgrade}
                  className="w-full bg-yellow-400 hover:bg-yellow-300 text-purple-900 font-bold py-4 rounded-xl transition-all shadow-lg"
                >
                  Desbloquear por R$ 19,90/mês
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-5 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <Brain className="w-6 h-6 text-purple-600" />
                  <h2 className="text-base font-bold text-gray-900">IA Financeira</h2>
                </div>
                <div className="space-y-3">
                  {insights.map((insight) => (
                    <div
                      key={insight.id}
                      className={`p-4 rounded-2xl border-l-4 ${
                        insight.type === 'warning'
                          ? 'bg-orange-50 border-orange-500'
                          : insight.type === 'tip'
                          ? 'bg-blue-50 border-blue-500'
                          : 'bg-green-50 border-green-500'
                      }`}
                    >
                      <p className="text-sm text-gray-700">{insight.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 'mais':
        return (
          <div className="space-y-4 pb-24">
            {/* Seção Gerenciar */}
            <div className="bg-white rounded-3xl p-5 shadow-sm">
              <h3 className="text-sm font-bold text-gray-500 mb-3 uppercase tracking-wide">Gerenciar</h3>
              <div className="space-y-1">
                <button 
                  onClick={() => setActiveMoreSection('contas')}
                  className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition-all"
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Wallet className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-900">Contas</span>
                </button>
                
                <button 
                  onClick={() => setActiveMoreSection('cartoes')}
                  className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition-all"
                >
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-purple-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-900">Cartões de crédito</span>
                </button>
                
                <button 
                  onClick={() => setActiveMoreSection('categorias')}
                  className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition-all"
                >
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                    <FileText className="w-5 h-5 text-green-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-900">Categorias</span>
                </button>
              </div>
            </div>

            {/* Seção Acompanhar */}
            <div className="bg-white rounded-3xl p-5 shadow-sm">
              <h3 className="text-sm font-bold text-gray-500 mb-3 uppercase tracking-wide">Acompanhar</h3>
              <div className="space-y-1">
                <button 
                  onClick={() => setActiveMoreSection('graficos')}
                  className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition-all"
                >
                  <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                    <PieChart className="w-5 h-5 text-orange-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-900">Gráficos</span>
                </button>
                
                <button 
                  onClick={() => setActiveMoreSection('desempenho')}
                  className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition-all"
                >
                  <div className="w-10 h-10 bg-pink-100 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-pink-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-900">Meu desempenho</span>
                </button>
                
                <button 
                  onClick={() => setActiveMoreSection('calendario')}
                  className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition-all"
                >
                  <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-teal-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-900">Calendário</span>
                </button>

                <button 
                  onClick={() => setActiveMoreSection('calculadora')}
                  className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition-all"
                >
                  <div className="w-10 h-10 bg-cyan-100 rounded-xl flex items-center justify-center">
                    <Calculator className="w-5 h-5 text-cyan-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-900">Calculadoras</span>
                </button>
              </div>
            </div>

            {/* Seção Sobre */}
            <div className="bg-white rounded-3xl p-5 shadow-sm">
              <h3 className="text-sm font-bold text-gray-500 mb-3 uppercase tracking-wide">Sobre</h3>
              <div className="space-y-1">
                <button 
                  onClick={() => setActiveMoreSection('configuracoes')}
                  className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition-all"
                >
                  <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                    <Settings className="w-5 h-5 text-gray-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-900">Configurações</span>
                </button>
                
                <button 
                  onClick={() => setActiveMoreSection('notificacoes')}
                  className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition-all"
                >
                  <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
                    <Bell className="w-5 h-5 text-yellow-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-900">Notificações</span>
                </button>
                
                <button 
                  onClick={() => alert('Em breve: Central de ajuda')}
                  className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition-all"
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <HelpCircle className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-900">Ajuda</span>
                </button>
                
                <button 
                  onClick={() => alert('Em breve: Programa de indicação')}
                  className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition-all"
                >
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Users className="w-5 h-5 text-purple-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-900">Convidar amigos</span>
                </button>
              </div>
            </div>

            {/* Upgrade Card */}
            {user.plan === 'free' && (
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl p-6 shadow-xl">
                <div className="flex items-center gap-3 mb-3">
                  <Crown className="w-8 h-8 text-yellow-300" />
                  <h3 className="text-white font-bold text-lg">Plano Pro</h3>
                </div>
                <p className="text-purple-100 text-sm mb-4">
                  Desbloqueie todos os recursos e tenha controle total das suas finanças
                </p>
                <button
                  onClick={handleUpgrade}
                  className="w-full bg-yellow-400 hover:bg-yellow-300 text-purple-900 font-bold py-3 rounded-xl transition-all"
                >
                  Assinar por R$ 19,90/mês
                </button>
              </div>
            )}

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="w-full bg-white rounded-3xl p-5 shadow-sm flex items-center justify-center gap-3 text-red-600 hover:bg-red-50 transition-all"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-semibold">Sair da conta</span>
            </button>
          </div>
        );
    }
  };

  const renderTransactionForm = () => {
    switch (transactionType) {
      case 'despesa':
      case 'receita':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Valor</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Categoria</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder={transactionType === 'receita' ? 'Ex: Salário' : 'Ex: Almoço no restaurante'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Data</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        );

      case 'transferencia':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Valor</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">De</label>
              <select
                value={fromAccount}
                onChange={(e) => setFromAccount(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Selecione a conta...</option>
                <option value="carteira">Carteira</option>
                <option value="banco">Conta Bancária</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Para</label>
              <select
                value={toAccount}
                onChange={(e) => setToAccount(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Selecione a conta...</option>
                <option value="carteira">Carteira</option>
                <option value="banco">Conta Bancária</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Data</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        );

      case 'parcela':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Valor da Parcela</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Ex: Parcela 1/12 - Notebook"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Data de Vencimento</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {activeTab === 'principal' && 'Início'}
              {activeTab === 'transacoes' && 'Transações'}
              {activeTab === 'objetivos' && 'Objetivos'}
              {activeTab === 'ia' && 'IA Financeira'}
              {activeTab === 'mais' && 'Mais Opções'}
            </h1>
            <p className="text-xs text-gray-500">
              {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>
          {user.plan === 'free' && (
            <button 
              onClick={handleUpgrade}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-xl font-semibold text-sm hover:shadow-lg transition-all"
            >
              <Crown className="w-4 h-4" />
              Pro
            </button>
          )}
        </div>
      </header>

      {/* Conteúdo Principal */}
      <div className="max-w-6xl mx-auto p-4">
        {renderContent()}
      </div>

      {/* Navegação Inferior */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
        <div className="max-w-6xl mx-auto px-2 py-2">
          <div className="flex items-center justify-around relative">
            {/* Principal */}
            <button
              onClick={() => {
                setActiveTab('principal');
                setActiveMoreSection(null);
              }}
              className={`flex flex-col items-center gap-1 py-2 px-3 rounded-xl transition-all ${
                activeTab === 'principal' ? 'text-purple-600' : 'text-gray-500'
              }`}
            >
              <Home className={`w-6 h-6 ${activeTab === 'principal' ? 'fill-purple-600' : ''}`} />
              <span className="text-xs font-medium">Início</span>
            </button>

            {/* Transações */}
            <button
              onClick={() => {
                setActiveTab('transacoes');
                setActiveMoreSection(null);
              }}
              className={`flex flex-col items-center gap-1 py-2 px-3 rounded-xl transition-all ${
                activeTab === 'transacoes' ? 'text-purple-600' : 'text-gray-500'
              }`}
            >
              <Receipt className={`w-6 h-6 ${activeTab === 'transacoes' ? 'fill-purple-600' : ''}`} />
              <span className="text-xs font-medium">Transações</span>
            </button>

            {/* Botão Central de Adicionar */}
            <button
              onClick={() => {
                setShowTransactionModal(true);
                setTransactionType(null);
              }}
              className="absolute -top-8 left-1/2 -translate-x-1/2 w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all hover:scale-110"
            >
              <Plus className="w-8 h-8 text-white" />
            </button>

            {/* Objetivos */}
            <button
              onClick={() => {
                setActiveTab('objetivos');
                setActiveMoreSection(null);
              }}
              className={`flex flex-col items-center gap-1 py-2 px-3 rounded-xl transition-all ${
                activeTab === 'objetivos' ? 'text-purple-600' : 'text-gray-500'
              }`}
            >
              <Target className={`w-6 h-6 ${activeTab === 'objetivos' ? 'fill-purple-600' : ''}`} />
              <span className="text-xs font-medium">Objetivos</span>
            </button>

            {/* Mais */}
            <button
              onClick={() => {
                setActiveTab('mais');
                setActiveMoreSection(null);
              }}
              className={`flex flex-col items-center gap-1 py-2 px-3 rounded-xl transition-all ${
                activeTab === 'mais' ? 'text-purple-600' : 'text-gray-500'
              }`}
            >
              <MoreHorizontal className={`w-6 h-6 ${activeTab === 'mais' ? 'fill-purple-600' : ''}`} />
              <span className="text-xs font-medium">Mais</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Modal de Seleção de Tipo de Transação */}
      {showTransactionModal && !transactionType && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end justify-center z-50">
          <div className="bg-white rounded-t-3xl p-6 w-full max-w-md animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Nova Transação</h3>
              <button
                onClick={closeTransactionModal}
                className="p-2 hover:bg-gray-100 rounded-full transition-all"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => openTransactionModal('despesa')}
                className="p-4 rounded-2xl bg-red-50 border-2 border-red-200 hover:border-red-400 transition-all flex flex-col items-center gap-2"
              >
                <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
                  <ArrowDownCircle className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm font-semibold text-gray-900">Despesa</span>
              </button>

              <button
                onClick={() => openTransactionModal('receita')}
                className="p-4 rounded-2xl bg-green-50 border-2 border-green-200 hover:border-green-400 transition-all flex flex-col items-center gap-2"
              >
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                  <ArrowUpCircle className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm font-semibold text-gray-900">Receita</span>
              </button>

              <button
                onClick={() => openTransactionModal('transferencia')}
                className="p-4 rounded-2xl bg-blue-50 border-2 border-blue-200 hover:border-blue-400 transition-all flex flex-col items-center gap-2"
              >
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                  <ArrowLeftRight className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm font-semibold text-gray-900">Transferência</span>
              </button>

              <button
                onClick={() => openTransactionModal('parcela')}
                className="p-4 rounded-2xl bg-purple-50 border-2 border-purple-200 hover:border-purple-400 transition-all flex flex-col items-center gap-2"
              >
                <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm font-semibold text-gray-900">Parcela Cartão</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Adicionar Transação */}
      {showTransactionModal && transactionType && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">
                {transactionType === 'despesa' && 'Adicionar Despesa'}
                {transactionType === 'receita' && 'Adicionar Receita'}
                {transactionType === 'transferencia' && 'Nova Transferência'}
                {transactionType === 'parcela' && 'Parcela do Cartão'}
              </h3>
              <button
                onClick={closeTransactionModal}
                className="p-2 hover:bg-gray-100 rounded-full transition-all"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            {renderTransactionForm()}

            <div className="flex gap-3 mt-6">
              <button
                onClick={closeTransactionModal}
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

      {/* Modal Editar Gasto */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Editar Gasto</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Valor</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Categoria</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Ex: Almoço no restaurante"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Data</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingExpense(null);
                  resetForm();
                }}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleEditExpense}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Open Finance */}
      {showOpenFinanceModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Conectar Open Finance</h3>
              <button
                onClick={() => setShowOpenFinanceModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-all"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <LinkIcon className="w-8 h-8 text-white" />
              </div>
              <p className="text-center text-gray-600 text-sm mb-4">
                Conecte suas contas bancárias de forma segura através do Open Finance
              </p>
              
              {user.plan === 'free' ? (
                <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 mb-4">
                  <div className="flex items-start gap-3">
                    <Crown className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-gray-900 mb-1">
                        Recurso Premium
                      </p>
                      <p className="text-xs text-gray-600">
                        Faça upgrade para o Plano Pro e conecte suas contas automaticamente
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <button className="w-full p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-2xl hover:border-purple-400 transition-all">
                    <p className="font-semibold text-gray-900 text-sm">Banco do Brasil</p>
                  </button>
                  <button className="w-full p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-2xl hover:border-purple-400 transition-all">
                    <p className="font-semibold text-gray-900 text-sm">Itaú</p>
                  </button>
                  <button className="w-full p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-2xl hover:border-purple-400 transition-all">
                    <p className="font-semibold text-gray-900 text-sm">Nubank</p>
                  </button>
                  <button className="w-full p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-2xl hover:border-purple-400 transition-all">
                    <p className="font-semibold text-gray-900 text-sm">Outros bancos</p>
                  </button>
                </div>
              )}
            </div>

            {user.plan === 'free' ? (
              <button
                onClick={() => {
                  setShowOpenFinanceModal(false);
                  handleUpgrade();
                }}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-4 rounded-2xl hover:shadow-lg transition-all"
              >
                Fazer Upgrade
              </button>
            ) : (
              <button
                onClick={() => setShowOpenFinanceModal(false)}
                className="w-full border border-gray-300 text-gray-700 font-semibold py-4 rounded-2xl hover:bg-gray-50 transition-all"
              >
                Fechar
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
