'use client';

import { useState, useEffect } from 'react';
import { Bell, BellOff, Check, X } from 'lucide-react';

export default function NotificationSettings() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [settings, setSettings] = useState({
    dailyReminder: true,
    billReminder: true,
    goalProgress: true,
    weeklyReport: false,
    budgetAlert: true,
  });

  useEffect(() => {
    // Verificar permissão atual
    if ('Notification' in window) {
      setPermission(Notification.permission);
      setNotificationsEnabled(Notification.permission === 'granted');
    }

    // Carregar configurações do localStorage
    const savedSettings = localStorage.getItem('notificationSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      alert('Seu navegador não suporta notificações');
      return;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result === 'granted') {
        setNotificationsEnabled(true);
        // Enviar notificação de teste
        new Notification('OrçaPro', {
          body: 'Notificações ativadas com sucesso! 🎉',
          icon: '/icon.svg',
        });
      } else {
        alert('Permissão negada. Você pode ativar nas configurações do navegador.');
      }
    } catch (error) {
      console.error('Erro ao solicitar permissão:', error);
      alert('Erro ao solicitar permissão para notificações');
    }
  };

  const handleToggleSetting = (key: keyof typeof settings) => {
    const newSettings = {
      ...settings,
      [key]: !settings[key],
    };
    setSettings(newSettings);
    localStorage.setItem('notificationSettings', JSON.stringify(newSettings));
  };

  const sendTestNotification = () => {
    if (permission === 'granted') {
      new Notification('OrçaPro - Teste', {
        body: 'Esta é uma notificação de teste! 📱',
        icon: '/icon.svg',
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-3xl p-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Notificações</h2>

        {/* Status das Notificações */}
        <div className="mb-6">
          {permission === 'default' && (
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-4">
              <div className="flex items-start gap-3">
                <Bell className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900 mb-2">
                    Ative as notificações
                  </p>
                  <p className="text-xs text-gray-600 mb-3">
                    Receba lembretes sobre contas, metas e relatórios financeiros
                  </p>
                  <button
                    onClick={requestPermission}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                  >
                    Permitir Notificações
                  </button>
                </div>
              </div>
            </div>
          )}

          {permission === 'denied' && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-4">
              <div className="flex items-start gap-3">
                <BellOff className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-gray-900 mb-1">
                    Notificações bloqueadas
                  </p>
                  <p className="text-xs text-gray-600">
                    Para ativar, acesse as configurações do seu navegador e permita notificações para este site.
                  </p>
                </div>
              </div>
            </div>
          )}

          {permission === 'granted' && (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-4">
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900 mb-1">
                    Notificações ativadas
                  </p>
                  <p className="text-xs text-gray-600 mb-3">
                    Você receberá alertas importantes sobre suas finanças
                  </p>
                  <button
                    onClick={sendTestNotification}
                    className="text-xs font-semibold text-green-600 hover:text-green-700"
                  >
                    Enviar notificação de teste →
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Configurações de Notificações */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-gray-700 mb-3">Tipos de Notificações</h3>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
            <div>
              <p className="font-semibold text-gray-900 text-sm">Lembrete Diário</p>
              <p className="text-xs text-gray-500">Registre seus gastos do dia</p>
            </div>
            <button
              onClick={() => handleToggleSetting('dailyReminder')}
              className={`w-12 h-6 rounded-full transition-all ${
                settings.dailyReminder ? 'bg-purple-600' : 'bg-gray-300'
              }`}
              disabled={permission !== 'granted'}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full transition-all ${
                  settings.dailyReminder ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
            <div>
              <p className="font-semibold text-gray-900 text-sm">Contas a Vencer</p>
              <p className="text-xs text-gray-500">Alertas 3 dias antes do vencimento</p>
            </div>
            <button
              onClick={() => handleToggleSetting('billReminder')}
              className={`w-12 h-6 rounded-full transition-all ${
                settings.billReminder ? 'bg-purple-600' : 'bg-gray-300'
              }`}
              disabled={permission !== 'granted'}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full transition-all ${
                  settings.billReminder ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
            <div>
              <p className="font-semibold text-gray-900 text-sm">Progresso de Objetivos</p>
              <p className="text-xs text-gray-500">Atualizações sobre suas metas</p>
            </div>
            <button
              onClick={() => handleToggleSetting('goalProgress')}
              className={`w-12 h-6 rounded-full transition-all ${
                settings.goalProgress ? 'bg-purple-600' : 'bg-gray-300'
              }`}
              disabled={permission !== 'granted'}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full transition-all ${
                  settings.goalProgress ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
            <div>
              <p className="font-semibold text-gray-900 text-sm">Relatório Semanal</p>
              <p className="text-xs text-gray-500">Resumo dos seus gastos toda segunda</p>
            </div>
            <button
              onClick={() => handleToggleSetting('weeklyReport')}
              className={`w-12 h-6 rounded-full transition-all ${
                settings.weeklyReport ? 'bg-purple-600' : 'bg-gray-300'
              }`}
              disabled={permission !== 'granted'}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full transition-all ${
                  settings.weeklyReport ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
            <div>
              <p className="font-semibold text-gray-900 text-sm">Alerta de Orçamento</p>
              <p className="text-xs text-gray-500">Quando ultrapassar 80% do limite</p>
            </div>
            <button
              onClick={() => handleToggleSetting('budgetAlert')}
              className={`w-12 h-6 rounded-full transition-all ${
                settings.budgetAlert ? 'bg-purple-600' : 'bg-gray-300'
              }`}
              disabled={permission !== 'granted'}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full transition-all ${
                  settings.budgetAlert ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
