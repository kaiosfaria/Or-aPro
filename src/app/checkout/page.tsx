'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Crown, 
  CheckCircle, 
  ArrowLeft, 
  CreditCard,
  Lock,
  Sparkles,
  Zap,
  TrendingUp,
  Brain,
  Shield,
  Clock,
  AlertCircle
} from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState<'credit' | 'pix'>('credit');
  const [loading, setLoading] = useState(false);

  const handleSubscribe = () => {
    setLoading(true);
    // Simulação de processamento de pagamento
    setTimeout(() => {
      alert('Pagamento processado com sucesso! Bem-vindo ao Plano Pro! 🎉');
      router.push('/');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-full transition-all"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Assinar Plano Pro</h1>
            <p className="text-xs text-gray-500">Desbloqueie todos os recursos</p>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-4 pb-24">
        {/* Aviso sobre Pagamentos */}
        <div className="bg-blue-50 border border-blue-200 rounded-3xl p-6 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-gray-900 mb-2">Sobre os Pagamentos</h3>
              <p className="text-sm text-gray-700 mb-3">
                Este é um checkout de demonstração. Para processar pagamentos reais, você precisará integrar com um gateway de pagamento como:
              </p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span><strong>Stripe:</strong> Aceita cartões internacionais, PIX via Stripe Brasil</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span><strong>Mercado Pago:</strong> Popular no Brasil, aceita PIX, boleto e cartões</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span><strong>PagSeguro:</strong> Solução brasileira completa</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span><strong>Asaas:</strong> Ótimo para recorrência e gestão de cobranças</span>
                </li>
              </ul>
              <p className="text-xs text-gray-600 mt-3">
                💡 Recomendação: Use Stripe para pagamentos internacionais ou Mercado Pago para foco no Brasil
              </p>
            </div>
          </div>
        </div>

        {/* Card do Plano */}
        <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-3xl p-8 shadow-2xl text-white mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-14 h-14 bg-yellow-400 rounded-2xl flex items-center justify-center">
              <Crown className="w-8 h-8 text-purple-900" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Plano Pro</h2>
              <p className="text-purple-200 text-sm">Controle total das suas finanças</p>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-6">
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-5xl font-bold">R$ 19,90</span>
              <span className="text-purple-200">/mês</span>
            </div>
            <p className="text-purple-100 text-sm">Cancele quando quiser</p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-300 flex-shrink-0" />
              <span className="text-sm">Gastos ilimitados por dia</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-300 flex-shrink-0" />
              <span className="text-sm">Edições ilimitadas</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-300 flex-shrink-0" />
              <span className="text-sm">IA Financeira com análises avançadas</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-300 flex-shrink-0" />
              <span className="text-sm">Integração com Open Finance</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-300 flex-shrink-0" />
              <span className="text-sm">Relatórios personalizados</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-300 flex-shrink-0" />
              <span className="text-sm">Suporte prioritário</span>
            </div>
          </div>
        </div>

        {/* Benefícios Extras */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center mb-3">
              <Brain className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="font-bold text-gray-900 text-sm mb-1">IA Inteligente</h3>
            <p className="text-xs text-gray-600">Análises e sugestões personalizadas</p>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mb-3">
              <Zap className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="font-bold text-gray-900 text-sm mb-1">Sem Limites</h3>
            <p className="text-xs text-gray-600">Registre quantos gastos quiser</p>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mb-3">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-bold text-gray-900 text-sm mb-1">Open Finance</h3>
            <p className="text-xs text-gray-600">Conecte suas contas bancárias</p>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center mb-3">
              <Shield className="w-5 h-5 text-orange-600" />
            </div>
            <h3 className="font-bold text-gray-900 text-sm mb-1">100% Seguro</h3>
            <p className="text-xs text-gray-600">Seus dados protegidos</p>
          </div>
        </div>

        {/* Método de Pagamento */}
        <div className="bg-white rounded-3xl p-6 shadow-sm mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Método de Pagamento (Demo)</h3>
          
          <div className="space-y-3 mb-6">
            <button
              onClick={() => setPaymentMethod('credit')}
              className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center gap-4 ${
                paymentMethod === 'credit'
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                paymentMethod === 'credit' ? 'bg-purple-500' : 'bg-gray-100'
              }`}>
                <CreditCard className={`w-6 h-6 ${
                  paymentMethod === 'credit' ? 'text-white' : 'text-gray-600'
                }`} />
              </div>
              <div className="flex-1 text-left">
                <p className="font-semibold text-gray-900">Cartão de Crédito</p>
                <p className="text-xs text-gray-500">Cobrança mensal automática</p>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                paymentMethod === 'credit'
                  ? 'border-purple-500 bg-purple-500'
                  : 'border-gray-300'
              }`}>
                {paymentMethod === 'credit' && (
                  <div className="w-2 h-2 bg-white rounded-full" />
                )}
              </div>
            </button>

            <button
              onClick={() => setPaymentMethod('pix')}
              className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center gap-4 ${
                paymentMethod === 'pix'
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                paymentMethod === 'pix' ? 'bg-purple-500' : 'bg-gray-100'
              }`}>
                <Sparkles className={`w-6 h-6 ${
                  paymentMethod === 'pix' ? 'text-white' : 'text-gray-600'
                }`} />
              </div>
              <div className="flex-1 text-left">
                <p className="font-semibold text-gray-900">PIX</p>
                <p className="text-xs text-gray-500">Pagamento instantâneo</p>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                paymentMethod === 'pix'
                  ? 'border-purple-500 bg-purple-500'
                  : 'border-gray-300'
              }`}>
                {paymentMethod === 'pix' && (
                  <div className="w-2 h-2 bg-white rounded-full" />
                )}
              </div>
            </button>
          </div>

          {paymentMethod === 'credit' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número do Cartão
                </label>
                <input
                  type="text"
                  placeholder="0000 0000 0000 0000"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Validade
                  </label>
                  <input
                    type="text"
                    placeholder="MM/AA"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CVV
                  </label>
                  <input
                    type="text"
                    placeholder="123"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome no Cartão
                </label>
                <input
                  type="text"
                  placeholder="NOME COMPLETO"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          )}

          {paymentMethod === 'pix' && (
            <div className="bg-purple-50 rounded-2xl p-6 text-center">
              <Sparkles className="w-12 h-12 text-purple-600 mx-auto mb-3" />
              <p className="text-sm text-gray-700 mb-2">
                Após confirmar, você receberá um QR Code PIX para pagamento
              </p>
              <p className="text-xs text-gray-500">
                Pagamento instantâneo e seguro
              </p>
            </div>
          )}
        </div>

        {/* Segurança */}
        <div className="bg-green-50 rounded-2xl p-4 mb-6 flex items-center gap-3">
          <Lock className="w-5 h-5 text-green-600 flex-shrink-0" />
          <p className="text-sm text-green-800">
            Pagamento 100% seguro e criptografado
          </p>
        </div>

        {/* Botão de Assinar */}
        <button
          onClick={handleSubscribe}
          disabled={loading}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Clock className="w-5 h-5 animate-spin" />
              Processando...
            </>
          ) : (
            <>
              <Crown className="w-5 h-5" />
              Testar Checkout - R$ 19,90/mês
            </>
          )}
        </button>

        <p className="text-center text-xs text-gray-500 mt-4">
          Ao assinar, você concorda com nossos Termos de Uso e Política de Privacidade.
          Cancele quando quiser, sem taxas adicionais.
        </p>
      </div>
    </div>
  );
}
