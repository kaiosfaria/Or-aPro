// Types para o app de finanças pessoais

export interface User {
  email: string;
  name: string;
  plan: 'free' | 'premium';
  createdAt: string;
}

export interface Expense {
  id: string;
  userId: string;
  amount: number;
  category: string;
  subcategory?: string;
  description: string;
  date: string;
  createdAt: string;
  editedAt?: string;
}

export interface DailyLimits {
  date: string;
  expensesCreated: number;
  editsUsed: number;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  subcategories?: string[];
}

export interface AIInsight {
  id: string;
  type: 'warning' | 'tip' | 'success';
  message: string;
  category?: string;
  potentialSavings?: number;
  date: string;
}

export interface AppState {
  user: User | null;
  expenses: Expense[];
  dailyLimits: DailyLimits;
  categories: Category[];
  insights: AIInsight[];
}
