'use client';

import { useState } from 'react';
import { CreditCard, Plus, X, Calendar, DollarSign, Edit2, Trash2 } from 'lucide-react';

interface CreditCardData {
  id: string;
  name: string;
  limit: number;
  closingDay: number;
  dueDay: number;
  currentBill: number;
  color: string;
}

export default function CardManager() {
  const [cards, setCards] = useState<CreditCardData[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBillModal, setShowBillModal] = useState(false);
  const [selectedCard, setSelectedCard] = useState<CreditCardData | null>(null);
  
  // Form states
  const [cardName, setCardName] = useState('');
  const [cardLimit, setCardLimit] = useState('');
  const [closingDay, setClosingDay] = useState('');
  const [dueDay, setDueDay] = useState('');
  const [cardColor, setCardColor] = useState('#8B5CF6');

  // Bill form states
  const [billAmount, setBillAmount] = useState('');
  const [billDescription, setBillDescription] = useState('');

  const resetForm = () => {
    setCardName('');
    setCardLimit('');
    setClosingDay('');
    setDueDay('');
    setCardColor('#8B5CF6');
  };

  const handleAddCard = () => {
    if (!cardName || !cardLimit || !closingDay || !dueDay) {
      alert('Preencha todos os campos');
      return;
    }

    const newCard: CreditCardData = {
      id: Date.now().toString(),
      name: cardName,
      limit: parseFloat(cardLimit),
      closingDay: parseInt(closingDay),
      dueDay: parseInt(dueDay),
      currentBill: 0,
      color: cardColor,
    };

    setCards([...cards, newCard]);
    resetForm();
    setShowAddModal(false);
  };

  const handleAddBill = () => {
    if (!selectedCard || !billAmount || !billDescription) {
      alert('Preencha todos os campos');
      return;
    }

    const updatedCards = cards.map(card => {
      if (card.id === selectedCard.id) {
        return {
          ...card,
          currentBill: card.currentBill + parseFloat(billAmount),
        };
      }
      return card;
    });

    setCards(updatedCards);
    setBillAmount('');
    setBillDescription('');
    setShowBillModal(false);
    setSelectedCard(null);
  };

  const handleDeleteCard = (id: string) => {
    if (confirm('Deseja realmente excluir este cartão?')) {
      setCards(cards.filter(card => card.id !== id));
    }
  };

  const openBillModal = (card: CreditCardData) => {
    setSelectedCard(card);
    setShowBillModal(true);
  };

  const colors = [
    { name: 'Roxo', value: '#8B5CF6' },
    { name: 'Azul', value: '#3B82F6' },
    { name: 'Verde', value: '#10B981' },
    { name: 'Rosa', value: '#EC4899' },
    { name: 'Laranja', value: '#F59E0B' },
    { name: 'Vermelho', value: '#EF4444' },
  ];

  return (
    <div className="space-y-4 pb-24">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">Meus Cartões</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-xl font-semibold text-sm hover:shadow-lg transition-all"
        >
          <Plus className="w-4 h-4" />
          Adicionar
        </button>
      </div>

      {cards.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 shadow-sm text-center">
          <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm mb-4">Nenhum cartão cadastrado</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-xl font-semibold text-sm hover:shadow-lg transition-all"
          >
            Adicionar Primeiro Cartão
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {cards.map(card => {
            const usedPercentage = (card.currentBill / card.limit) * 100;
            const availableLimit = card.limit - card.currentBill;

            return (
              <div
                key={card.id}
                className="bg-white rounded-3xl p-5 shadow-sm"
                style={{ borderLeft: `4px solid ${card.color}` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: card.color + '20' }}
                    >
                      <CreditCard className="w-6 h-6" style={{ color: card.color }} />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{card.name}</h3>
                      <p className="text-xs text-gray-500">
                        Limite: R$ {card.limit.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => openBillModal(card)}
                      className="p-2 hover:bg-purple-100 rounded-lg transition-all text-purple-600"
                      title="Adicionar fatura"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCard(card.id)}
                      className="p-2 hover:bg-red-100 rounded-lg transition-all text-red-600"
                      title="Excluir cartão"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Fatura Atual</span>
                      <span className="text-sm font-bold text-gray-900">
                        R$ {card.currentBill.toFixed(2)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{
                          width: `${Math.min(usedPercentage, 100)}%`,
                          backgroundColor: usedPercentage > 80 ? '#EF4444' : card.color,
                        }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Disponível: R$ {availableLimit.toFixed(2)} ({(100 - usedPercentage).toFixed(1)}%)
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">Fechamento</p>
                        <p className="text-sm font-semibold text-gray-900">Dia {card.closingDay}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">Vencimento</p>
                        <p className="text-sm font-semibold text-gray-900">Dia {card.dueDay}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Adicionar Cartão */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Novo Cartão</h3>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome do Cartão
                </label>
                <input
                  type="text"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Ex: Nubank, Itaú..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Limite do Cartão
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={cardLimit}
                  onChange={(e) => setCardLimit(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="0.00"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dia Fechamento
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={closingDay}
                    onChange={(e) => setClosingDay(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="1-31"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dia Vencimento
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={dueDay}
                    onChange={(e) => setDueDay(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="1-31"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cor do Cartão
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {colors.map(color => (
                    <button
                      key={color.value}
                      onClick={() => setCardColor(color.value)}
                      className={`w-full aspect-square rounded-xl transition-all ${
                        cardColor === color.value
                          ? 'ring-2 ring-offset-2 ring-purple-500 scale-110'
                          : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
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
                onClick={handleAddCard}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
              >
                Adicionar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Adicionar Fatura */}
      {showBillModal && selectedCard && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Adicionar à Fatura</h3>
              <button
                onClick={() => {
                  setShowBillModal(false);
                  setSelectedCard(null);
                  setBillAmount('');
                  setBillDescription('');
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition-all"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="mb-4 p-4 bg-gray-50 rounded-2xl">
              <p className="text-sm text-gray-600 mb-1">Cartão</p>
              <p className="font-bold text-gray-900">{selectedCard.name}</p>
              <p className="text-xs text-gray-500 mt-1">
                Fatura atual: R$ {selectedCard.currentBill.toFixed(2)}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valor
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={billAmount}
                  onChange={(e) => setBillAmount(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição
                </label>
                <input
                  type="text"
                  value={billDescription}
                  onChange={(e) => setBillDescription(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Ex: Compra no supermercado"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowBillModal(false);
                  setSelectedCard(null);
                  setBillAmount('');
                  setBillDescription('');
                }}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddBill}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
              >
                Adicionar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
