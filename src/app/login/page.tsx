'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { saveUser } from '@/lib/storage';
import { User } from '@/lib/types';
import { TrendingUp, PiggyBank, Target, Shield, ChevronLeft, ChevronRight, Mail } from 'lucide-react';

const features = [
  {
    title: 'O jeito mais fácil de controlar suas finanças',
    description: 'Cadastre-se, crie planejamentos e acompanhe seus gastos de forma simples e intuitiva',
    icon: TrendingUp,
    mockup: {
      title: 'Resumo Financeiro',
      items: [
        { label: 'Gastos Hoje', value: 'R$ 45,00', color: 'text-red-400' },
        { label: 'Gastos Mês', value: 'R$ 1.234,00', color: 'text-orange-400' },
        { label: 'Limite Mensal', value: 'R$ 3.000,00', color: 'text-green-400' },
      ]
    }
  },
  {
    title: 'Economize com inteligência artificial',
    description: 'Nossa IA analisa seus gastos e sugere maneiras personalizadas de economizar dinheiro',
    icon: PiggyBank,
    mockup: {
      title: 'Sugestões de Economia',
      items: [
        { label: 'Reduza gastos com alimentação', value: '-15%', color: 'text-green-400' },
        { label: 'Otimize transporte', value: '-R$ 120', color: 'text-blue-400' },
        { label: 'Economize R$ 450/mês', value: '💰', color: 'text-yellow-400' },
      ]
    }
  },
  {
    title: 'Defina metas e alcance objetivos',
    description: 'Crie metas financeiras e acompanhe seu progresso em tempo real',
    icon: Target,
    mockup: {
      title: 'Suas Metas',
      items: [
        { label: 'Viagem de Férias', value: '65%', color: 'text-purple-400' },
        { label: 'Reserva de Emergência', value: '40%', color: 'text-cyan-400' },
        { label: 'Novo Notebook', value: '85%', color: 'text-pink-400' },
      ]
    }
  },
  {
    title: 'Seus dados seguros e privados',
    description: 'Armazenamento local no seu dispositivo. Upgrade para sincronização em nuvem',
    icon: Shield,
    mockup: {
      title: 'Segurança',
      items: [
        { label: 'Dados Locais', value: '✓', color: 'text-green-400' },
        { label: 'Criptografia', value: '✓', color: 'text-green-400' },
        { label: 'Privacidade Total', value: '✓', color: 'text-green-400' },
      ]
    }
  }
];

export default function LoginPage() {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showAuth, setShowAuth] = useState(false);
  const [isLogin, setIsLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Preencha todos os campos');
      return;
    }

    if (!isLogin && !name) {
      setError('Preencha seu nome');
      return;
    }

    const user: User = {
      email,
      name: isLogin ? email.split('@')[0] : name,
      plan: 'free',
      createdAt: new Date().toISOString(),
    };

    saveUser(user);
    router.push('/');
  };

  const handleSocialLogin = async (provider: 'google' | 'apple' | 'facebook') => {
    if (provider === 'google') {
      // Integração real com Google OAuth via NextAuth
      try {
        const result = await signIn('google', {
          callbackUrl: '/',
          redirect: false,
        });

        if (result?.ok) {
          // Salvar usuário no localStorage após login bem-sucedido
          const user: User = {
            email: result.user?.email || 'user@google.com',
            name: result.user?.name || 'Usuário Google',
            plan: 'free',
            createdAt: new Date().toISOString(),
          };
          saveUser(user);
          router.push('/');
        } else {
          setError('Erro ao fazer login com Google. Tente novamente.');
        }
      } catch (err) {
        console.error('Erro no login Google:', err);
        setError('Erro ao conectar com Google. Verifique suas credenciais.');
      }
    } else {
      // Para Apple e Facebook, simulação por enquanto
      // Em produção, adicionar providers no NextAuth
      const user: User = {
        email: `user@${provider}.com`,
        name: `Usuário ${provider}`,
        plan: 'free',
        createdAt: new Date().toISOString(),
      };

      saveUser(user);
      router.push('/');
    }
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % features.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + features.length) % features.length);
  };

  const currentFeature = features[currentSlide];
  const Icon = currentFeature.icon;

  if (showAuth) {
    return (
      <div className="min-h-screen bg-[#1a0129] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <button
            onClick={() => setShowAuth(false)}
            className="text-purple-300 mb-6 hover:text-white transition-colors flex items-center gap-2"
          >
            <ChevronLeft className="w-5 h-5" />
            Voltar
          </button>

          <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-8 border border-white/10">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">
              {isLogin ? 'Entrar na Conta' : 'Criar Conta'}
            </h2>

            {/* Botões de Login Social */}
            <div className="space-y-3 mb-6">
              <button
                onClick={() => handleSocialLogin('google')}
                className="w-full bg-white text-gray-800 font-semibold py-3 px-6 rounded-full hover:bg-gray-100 transition-all duration-300 flex items-center justify-center gap-3"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continuar com Google
              </button>

              <button
                onClick={() => handleSocialLogin('apple')}
                className="w-full bg-black text-white font-semibold py-3 px-6 rounded-full hover:bg-gray-900 transition-all duration-300 flex items-center justify-center gap-3"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
                Continuar com Apple
              </button>

              <button
                onClick={() => handleSocialLogin('facebook')}
                className="w-full bg-[#1877F2] text-white font-semibold py-3 px-6 rounded-full hover:bg-[#166FE5] transition-all duration-300 flex items-center justify-center gap-3"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Continuar com Facebook
              </button>
            </div>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/20"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-[#1a0129] text-gray-400">ou continue com e-mail</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nome
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                    placeholder="Seu nome"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  E-mail
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                  placeholder="seu@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Senha
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                  placeholder="••••••••"
                />
              </div>

              {error && (
                <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-3 text-red-200 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-3 px-6 rounded-full hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Mail className="w-5 h-5" />
                {isLogin ? 'Entrar com E-mail' : 'Criar Conta com E-mail'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-purple-300 hover:text-white transition-colors text-sm"
              >
                {isLogin ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Entre'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a0129] flex flex-col">
      {/* Área do Mockup */}
      <div className="flex-1 flex items-center justify-center p-6 pt-12 relative">
        {/* Botões de Navegação */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all z-10"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all z-10"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Mockup do App */}
        <div className="w-full max-w-sm">
          <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 rounded-3xl p-6 backdrop-blur-sm border border-white/10 shadow-2xl">
            {/* Header do Mockup */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
                <Icon className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg">{currentFeature.mockup.title}</h3>
                <p className="text-purple-300 text-sm">FinApp</p>
              </div>
            </div>

            {/* Conteúdo do Mockup */}
            <div className="space-y-4">
              {currentFeature.mockup.items.map((item, index) => (
                <div
                  key={index}
                  className="bg-white/5 rounded-2xl p-4 border border-white/10 hover:bg-white/10 transition-all"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300 text-sm">{item.label}</span>
                    <span className={`font-bold text-lg ${item.color}`}>{item.value}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Decoração */}
            <div className="mt-6 flex gap-2">
              <div className="h-1 flex-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
              <div className="h-1 flex-1 bg-white/20 rounded-full"></div>
              <div className="h-1 flex-1 bg-white/20 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Área de Informações e Ações */}
      <div className="bg-gradient-to-t from-black/40 to-transparent p-6 pb-8">
        <div className="max-w-md mx-auto">
          {/* Indicadores de Página */}
          <div className="flex justify-center gap-2 mb-6">
            {features.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentSlide
                    ? 'w-8 bg-purple-500'
                    : 'w-2 bg-white/30 hover:bg-white/50'
                }`}
              />
            ))}
          </div>

          {/* Texto Informativo */}
          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              {currentFeature.title}
            </h1>
            <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
              {currentFeature.description}
            </p>
          </div>

          {/* Botões de Ação */}
          <div className="space-y-3">
            <button
              onClick={() => {
                setIsLogin(false);
                setShowAuth(true);
              }}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-4 px-6 rounded-full hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300 text-lg"
            >
              Cadastrar
            </button>
            <button
              onClick={() => {
                setIsLogin(true);
                setShowAuth(true);
              }}
              className="w-full text-purple-300 font-medium py-4 px-6 rounded-full hover:bg-white/5 transition-all duration-300"
            >
              Já sou cadastrado
            </button>
          </div>

          {/* Info Adicional */}
          <p className="text-center text-gray-400 text-xs mt-6">
            Plano gratuito: 2 gastos por dia • 1 edição diária
          </p>
        </div>
      </div>
    </div>
  );
}
