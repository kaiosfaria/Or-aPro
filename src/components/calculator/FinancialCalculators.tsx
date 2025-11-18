'use client';

import { useState } from 'react';
import { Calculator, DollarSign, TrendingUp, Home, Car, CreditCard, Percent } from 'lucide-react';

type CalculatorType = 'juros-simples' | 'juros-compostos' | 'financiamento' | 'investimento' | 'desconto' | null;

export default function FinancialCalculators() {
  const [activeCalculator, setActiveCalculator] = useState<CalculatorType>(null);
  const [result, setResult] = useState<string | null>(null);

  // Juros Simples
  const [jsCapital, setJsCapital] = useState('');
  const [jsTaxa, setJsTaxa] = useState('');
  const [jsTempo, setJsTempo] = useState('');

  // Juros Compostos
  const [jcCapital, setJcCapital] = useState('');
  const [jcTaxa, setJcTaxa] = useState('');
  const [jcTempo, setJcTempo] = useState('');

  // Financiamento
  const [finValor, setFinValor] = useState('');
  const [finTaxa, setFinTaxa] = useState('');
  const [finParcelas, setFinParcelas] = useState('');

  // Investimento
  const [invCapital, setInvCapital] = useState('');
  const [invAporte, setInvAporte] = useState('');
  const [invTaxa, setInvTaxa] = useState('');
  const [invTempo, setInvTempo] = useState('');

  // Desconto
  const [descValor, setDescValor] = useState('');
  const [descPercentual, setDescPercentual] = useState('');

  const calcularJurosSimples = () => {
    const c = parseFloat(jsCapital);
    const i = parseFloat(jsTaxa) / 100;
    const t = parseFloat(jsTempo);

    if (isNaN(c) || isNaN(i) || isNaN(t)) {
      alert('Preencha todos os campos corretamente');
      return;
    }

    // Fórmula: M = C * (1 + i * t)
    const montante = c * (1 + i * t);
    const juros = montante - c;

    setResult(`
      Montante Final: R$ ${montante.toFixed(2)}
      Juros: R$ ${juros.toFixed(2)}
      Capital Inicial: R$ ${c.toFixed(2)}
    `);
  };

  const calcularJurosCompostos = () => {
    const c = parseFloat(jcCapital);
    const i = parseFloat(jcTaxa) / 100;
    const t = parseFloat(jcTempo);

    if (isNaN(c) || isNaN(i) || isNaN(t)) {
      alert('Preencha todos os campos corretamente');
      return;
    }

    // Fórmula: M = C * (1 + i)^t
    const montante = c * Math.pow(1 + i, t);
    const juros = montante - c;

    setResult(`
      Montante Final: R$ ${montante.toFixed(2)}
      Juros: R$ ${juros.toFixed(2)}
      Capital Inicial: R$ ${c.toFixed(2)}
      Rentabilidade: ${((juros / c) * 100).toFixed(2)}%
    `);
  };

  const calcularFinanciamento = () => {
    const pv = parseFloat(finValor);
    const i = parseFloat(finTaxa) / 100;
    const n = parseFloat(finParcelas);

    if (isNaN(pv) || isNaN(i) || isNaN(n)) {
      alert('Preencha todos os campos corretamente');
      return;
    }

    // Fórmula Price: PMT = PV * [i * (1 + i)^n] / [(1 + i)^n - 1]
    const pmt = pv * (i * Math.pow(1 + i, n)) / (Math.pow(1 + i, n) - 1);
    const totalPago = pmt * n;
    const jurosTotal = totalPago - pv;

    setResult(`
      Valor da Parcela: R$ ${pmt.toFixed(2)}
      Total a Pagar: R$ ${totalPago.toFixed(2)}
      Total de Juros: R$ ${jurosTotal.toFixed(2)}
      Valor Financiado: R$ ${pv.toFixed(2)}
    `);
  };

  const calcularInvestimento = () => {
    const c = parseFloat(invCapital);
    const aporte = parseFloat(invAporte);
    const i = parseFloat(invTaxa) / 100;
    const t = parseFloat(invTempo);

    if (isNaN(c) || isNaN(aporte) || isNaN(i) || isNaN(t)) {
      alert('Preencha todos os campos corretamente');
      return;
    }

    // Fórmula com aportes mensais: VF = C * (1 + i)^t + PMT * [((1 + i)^t - 1) / i]
    const montanteCapital = c * Math.pow(1 + i, t);
    const montanteAportes = aporte * ((Math.pow(1 + i, t) - 1) / i);
    const montanteFinal = montanteCapital + montanteAportes;
    const totalInvestido = c + (aporte * t);
    const rendimento = montanteFinal - totalInvestido;

    setResult(`
      Montante Final: R$ ${montanteFinal.toFixed(2)}
      Total Investido: R$ ${totalInvestido.toFixed(2)}
      Rendimento: R$ ${rendimento.toFixed(2)}
      Rentabilidade: ${((rendimento / totalInvestido) * 100).toFixed(2)}%
    `);
  };

  const calcularDesconto = () => {
    const valor = parseFloat(descValor);
    const percentual = parseFloat(descPercentual);

    if (isNaN(valor) || isNaN(percentual)) {
      alert('Preencha todos os campos corretamente');
      return;
    }

    const desconto = valor * (percentual / 100);
    const valorFinal = valor - desconto;

    setResult(`
      Valor Original: R$ ${valor.toFixed(2)}
      Desconto: R$ ${desconto.toFixed(2)} (${percentual}%)
      Valor Final: R$ ${valorFinal.toFixed(2)}
    `);
  };

  const calculators = [
    {
      id: 'juros-simples',
      name: 'Juros Simples',
      icon: DollarSign,
      color: 'bg-blue-500',
      description: 'Calcule juros simples',
    },
    {
      id: 'juros-compostos',
      name: 'Juros Compostos',
      icon: TrendingUp,
      color: 'bg-green-500',
      description: 'Calcule juros compostos',
    },
    {
      id: 'financiamento',
      name: 'Financiamento',
      icon: Home,
      color: 'bg-purple-500',
      description: 'Calcule parcelas (Tabela Price)',
    },
    {
      id: 'investimento',
      name: 'Investimento',
      icon: TrendingUp,
      color: 'bg-orange-500',
      description: 'Simule investimentos com aportes',
    },
    {
      id: 'desconto',
      name: 'Desconto',
      icon: Percent,
      color: 'bg-pink-500',
      description: 'Calcule descontos percentuais',
    },
  ];

  const renderCalculator = () => {
    switch (activeCalculator) {
      case 'juros-simples':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Capital Inicial (R$)
              </label>
              <input
                type="number"
                step="0.01"
                value={jsCapital}
                onChange={(e) => setJsCapital(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="1000.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Taxa de Juros (% ao período)
              </label>
              <input
                type="number"
                step="0.01"
                value={jsTaxa}
                onChange={(e) => setJsTaxa(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="5.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tempo (períodos)
              </label>
              <input
                type="number"
                value={jsTempo}
                onChange={(e) => setJsTempo(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="12"
              />
            </div>
            <button
              onClick={calcularJurosSimples}
              className="w-full bg-blue-500 text-white py-3 rounded-xl font-semibold hover:bg-blue-600 transition-all"
            >
              Calcular
            </button>
          </div>
        );

      case 'juros-compostos':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Capital Inicial (R$)
              </label>
              <input
                type="number"
                step="0.01"
                value={jcCapital}
                onChange={(e) => setJcCapital(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="1000.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Taxa de Juros (% ao período)
              </label>
              <input
                type="number"
                step="0.01"
                value={jcTaxa}
                onChange={(e) => setJcTaxa(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="0.5"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tempo (períodos)
              </label>
              <input
                type="number"
                value={jcTempo}
                onChange={(e) => setJcTempo(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="12"
              />
            </div>
            <button
              onClick={calcularJurosCompostos}
              className="w-full bg-green-500 text-white py-3 rounded-xl font-semibold hover:bg-green-600 transition-all"
            >
              Calcular
            </button>
          </div>
        );

      case 'financiamento':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valor Financiado (R$)
              </label>
              <input
                type="number"
                step="0.01"
                value={finValor}
                onChange={(e) => setFinValor(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="200000.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Taxa de Juros Mensal (%)
              </label>
              <input
                type="number"
                step="0.01"
                value={finTaxa}
                onChange={(e) => setFinTaxa(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="0.8"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número de Parcelas
              </label>
              <input
                type="number"
                value={finParcelas}
                onChange={(e) => setFinParcelas(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="360"
              />
            </div>
            <button
              onClick={calcularFinanciamento}
              className="w-full bg-purple-500 text-white py-3 rounded-xl font-semibold hover:bg-purple-600 transition-all"
            >
              Calcular
            </button>
          </div>
        );

      case 'investimento':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Capital Inicial (R$)
              </label>
              <input
                type="number"
                step="0.01"
                value={invCapital}
                onChange={(e) => setInvCapital(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="1000.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Aporte Mensal (R$)
              </label>
              <input
                type="number"
                step="0.01"
                value={invAporte}
                onChange={(e) => setInvAporte(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="500.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Taxa de Juros Mensal (%)
              </label>
              <input
                type="number"
                step="0.01"
                value={invTaxa}
                onChange={(e) => setInvTaxa(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="1.0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tempo (meses)
              </label>
              <input
                type="number"
                value={invTempo}
                onChange={(e) => setInvTempo(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="12"
              />
            </div>
            <button
              onClick={calcularInvestimento}
              className="w-full bg-orange-500 text-white py-3 rounded-xl font-semibold hover:bg-orange-600 transition-all"
            >
              Calcular
            </button>
          </div>
        );

      case 'desconto':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valor Original (R$)
              </label>
              <input
                type="number"
                step="0.01"
                value={descValor}
                onChange={(e) => setDescValor(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
                placeholder="100.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Percentual de Desconto (%)
              </label>
              <input
                type="number"
                step="0.01"
                value={descPercentual}
                onChange={(e) => setDescPercentual(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
                placeholder="15"
              />
            </div>
            <button
              onClick={calcularDesconto}
              className="w-full bg-pink-500 text-white py-3 rounded-xl font-semibold hover:bg-pink-600 transition-all"
            >
              Calcular
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  if (activeCalculator) {
    return (
      <div className="space-y-4 pb-24">
        <button
          onClick={() => {
            setActiveCalculator(null);
            setResult(null);
          }}
          className="text-purple-600 font-semibold"
        >
          ← Voltar
        </button>

        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-6">
            {calculators.find(c => c.id === activeCalculator)?.name}
          </h2>

          {renderCalculator()}

          {result && (
            <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border-2 border-purple-200">
              <h3 className="font-bold text-gray-900 mb-2">Resultado:</h3>
              <pre className="text-sm text-gray-700 whitespace-pre-line font-medium">
                {result}
              </pre>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-24">
      <h2 className="text-lg font-bold text-gray-900">Calculadoras Financeiras</h2>

      <div className="grid grid-cols-1 gap-3">
        {calculators.map(calc => {
          const Icon = calc.icon;
          return (
            <button
              key={calc.id}
              onClick={() => setActiveCalculator(calc.id as CalculatorType)}
              className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all text-left"
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 ${calc.color} rounded-xl flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{calc.name}</h3>
                  <p className="text-xs text-gray-500">{calc.description}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
