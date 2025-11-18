// Gerenciamento de Local Storage para o app de finanças

import { User, Expense, DailyLimits, Category, AIInsight, AppState } from './types';

const STORAGE_KEYS = {
  USER: 'finapp_user',
  EXPENSES: 'finapp_expenses',
  DAILY_LIMITS: 'finapp_daily_limits',
  CATEGORIES: 'finapp_categories',
  INSIGHTS: 'finapp_insights',
};

// Categorias padrão
const DEFAULT_CATEGORIES: Category[] = [
  { id: '1', name: 'Alimentação', icon: '🍽️', color: '#FF6B6B', subcategories: ['Almoço', 'Jantar', 'Lanche', 'Açaí', 'Pizza'] },
  { id: '2', name: 'Transporte', icon: '🚗', color: '#4ECDC4', subcategories: ['Combustível', 'Uber', 'Ônibus', 'Metrô'] },
  { id: '3', name: 'Casa', icon: '🏠', color: '#45B7D1', subcategories: ['Aluguel', 'Contas', 'Manutenção'] },
  { id: '4', name: 'Lazer', icon: '🎮', color: '#FFA07A', subcategories: ['Cinema', 'Streaming', 'Jogos', 'Viagens'] },
  { id: '5', name: 'Saúde', icon: '💊', color: '#98D8C8', subcategories: ['Farmácia', 'Consultas', 'Academia'] },
  { id: '6', name: 'Educação', icon: '📚', color: '#F7DC6F', subcategories: ['Cursos', 'Livros', 'Material'] },
  { id: '7', name: 'Compras', icon: '🛍️', color: '#BB8FCE', subcategories: ['Roupas', 'Eletrônicos', 'Presentes'] },
  { id: '8', name: 'Outros', icon: '📦', color: '#95A5A6', subcategories: [] },
];

// User
export const saveUser = (user: User): void => {
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
};

export const getUser = (): User | null => {
  const data = localStorage.getItem(STORAGE_KEYS.USER);
  return data ? JSON.parse(data) : null;
};

export const clearUser = (): void => {
  localStorage.removeItem(STORAGE_KEYS.USER);
};

// Expenses
export const saveExpenses = (expenses: Expense[]): void => {
  localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
};

export const getExpenses = (): Expense[] => {
  const data = localStorage.getItem(STORAGE_KEYS.EXPENSES);
  return data ? JSON.parse(data) : [];
};

export const addExpense = (expense: Expense): void => {
  const expenses = getExpenses();
  expenses.push(expense);
  saveExpenses(expenses);
};

export const updateExpense = (id: string, updates: Partial<Expense>): void => {
  const expenses = getExpenses();
  const index = expenses.findIndex(e => e.id === id);
  if (index !== -1) {
    expenses[index] = { ...expenses[index], ...updates, editedAt: new Date().toISOString() };
    saveExpenses(expenses);
  }
};

export const deleteExpense = (id: string): void => {
  const expenses = getExpenses();
  saveExpenses(expenses.filter(e => e.id !== id));
};

// Daily Limits
export const getDailyLimits = (): DailyLimits => {
  const data = localStorage.getItem(STORAGE_KEYS.DAILY_LIMITS);
  const today = new Date().toISOString().split('T')[0];
  
  if (data) {
    const limits: DailyLimits = JSON.parse(data);
    // Reset se for um novo dia
    if (limits.date !== today) {
      return { date: today, expensesCreated: 0, editsUsed: 0 };
    }
    return limits;
  }
  
  return { date: today, expensesCreated: 0, editsUsed: 0 };
};

export const updateDailyLimits = (limits: DailyLimits): void => {
  localStorage.setItem(STORAGE_KEYS.DAILY_LIMITS, JSON.stringify(limits));
};

// Categories
export const getCategories = (): Category[] => {
  const data = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
  return data ? JSON.parse(data) : DEFAULT_CATEGORIES;
};

export const saveCategories = (categories: Category[]): void => {
  localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
};

// AI Insights
export const getInsights = (): AIInsight[] => {
  const data = localStorage.getItem(STORAGE_KEYS.INSIGHTS);
  return data ? JSON.parse(data) : [];
};

export const saveInsights = (insights: AIInsight[]): void => {
  localStorage.setItem(STORAGE_KEYS.INSIGHTS, JSON.stringify(insights));
};

export const addInsight = (insight: AIInsight): void => {
  const insights = getInsights();
  insights.unshift(insight); // Adiciona no início
  saveInsights(insights.slice(0, 10)); // Mantém apenas as 10 mais recentes
};

// Verificar limites do plano gratuito
export const canCreateExpense = (user: User): boolean => {
  if (user.plan === 'premium') return true;
  
  const limits = getDailyLimits();
  return limits.expensesCreated < 2;
};

export const canEditExpense = (user: User): boolean => {
  if (user.plan === 'premium') return true;
  
  const limits = getDailyLimits();
  return limits.editsUsed < 1;
};

// Gerar insights de IA (mock)
export const generateAIInsights = (expenses: Expense[]): AIInsight[] => {
  const insights: AIInsight[] = [];
  const today = new Date();
  const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  // Filtrar gastos dos últimos 30 dias
  const recentExpenses = expenses.filter(e => new Date(e.date) >= thirtyDaysAgo);
  
  // Análise por categoria
  const categoryTotals: { [key: string]: number } = {};
  recentExpenses.forEach(expense => {
    categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
  });
  
  // Encontrar categoria com maior gasto
  const maxCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];
  
  if (maxCategory && maxCategory[1] > 500) {
    insights.push({
      id: Date.now().toString(),
      type: 'warning',
      message: `Você gastou R$ ${maxCategory[1].toFixed(2)} em ${maxCategory[0]} nos últimos 30 dias. Considere reduzir em 20% para economizar R$ ${(maxCategory[1] * 0.2).toFixed(2)}.`,
      category: maxCategory[0],
      potentialSavings: maxCategory[1] * 0.2,
      date: new Date().toISOString(),
    });
  }
  
  // Dica de economia
  if (categoryTotals['Alimentação'] > 300) {
    insights.push({
      id: (Date.now() + 1).toString(),
      type: 'tip',
      message: 'Que tal preparar mais refeições em casa? Você pode economizar até 40% nos gastos com alimentação.',
      category: 'Alimentação',
      potentialSavings: categoryTotals['Alimentação'] * 0.4,
      date: new Date().toISOString(),
    });
  }
  
  return insights;
};
