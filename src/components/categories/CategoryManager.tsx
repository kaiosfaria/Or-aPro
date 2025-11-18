'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Check, X } from 'lucide-react';
import { getCategories, saveCategories } from '@/lib/storage';
import { Category } from '@/lib/types';

export default function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  
  // Form states
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('');
  const [color, setColor] = useState('#8B5CF6');

  const availableIcons = ['🍔', '🚗', '🏠', '💊', '🎓', '🎮', '✈️', '👕', '📱', '⚡', '🎬', '🏋️', '🐕', '🎨', '📚'];
  const availableColors = [
    '#8B5CF6', // purple
    '#EC4899', // pink
    '#EF4444', // red
    '#F59E0B', // orange
    '#10B981', // green
    '#3B82F6', // blue
    '#6366F1', // indigo
    '#14B8A6', // teal
    '#F97316', // orange-2
    '#84CC16', // lime
  ];

  useEffect(() => {
    setCategories(getCategories());
  }, []);

  const handleAddCategory = () => {
    if (!name || !icon) {
      alert('Preencha todos os campos');
      return;
    }

    const newCategory: Category = {
      id: Date.now().toString(),
      name,
      icon,
      color,
    };

    const updatedCategories = [...categories, newCategory];
    saveCategories(updatedCategories);
    setCategories(updatedCategories);
    
    resetForm();
    setShowAddModal(false);
  };

  const handleEditCategory = () => {
    if (!editingCategory || !name || !icon) {
      alert('Preencha todos os campos');
      return;
    }

    const updatedCategories = categories.map(cat =>
      cat.id === editingCategory.id
        ? { ...cat, name, icon, color }
        : cat
    );

    saveCategories(updatedCategories);
    setCategories(updatedCategories);
    
    resetForm();
    setEditingCategory(null);
  };

  const handleDeleteCategory = (id: string) => {
    if (confirm('Deseja realmente excluir esta categoria?')) {
      const updatedCategories = categories.filter(cat => cat.id !== id);
      saveCategories(updatedCategories);
      setCategories(updatedCategories);
    }
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setName(category.name);
    setIcon(category.icon);
    setColor(category.color);
  };

  const resetForm = () => {
    setName('');
    setIcon('');
    setColor('#8B5CF6');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">Categorias</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-xl font-semibold text-sm hover:shadow-lg transition-all"
        >
          <Plus className="w-4 h-4" />
          Adicionar
        </button>
      </div>

      <div className="bg-white rounded-3xl p-5 shadow-sm">
        <div className="space-y-2">
          {categories.map((category) => (
            <div
              key={category.id}
              className="flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 transition-all"
              style={{ backgroundColor: category.color + '10' }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                  style={{ backgroundColor: category.color + '30' }}
                >
                  {category.icon}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{category.name}</p>
                  <p className="text-xs text-gray-500">{category.color}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => openEditModal(category)}
                  className="p-2 hover:bg-blue-100 rounded-lg transition-all text-blue-600"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteCategory(category.id)}
                  className="p-2 hover:bg-red-100 rounded-lg transition-all text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Adicionar Categoria */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Nova Categoria</h3>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Nome</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Ex: Alimentação"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ícone</label>
                <div className="grid grid-cols-5 gap-2">
                  {availableIcons.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => setIcon(emoji)}
                      className={`p-3 text-2xl rounded-xl border-2 transition-all ${
                        icon === emoji
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cor</label>
                <div className="grid grid-cols-5 gap-2">
                  {availableColors.map((colorOption) => (
                    <button
                      key={colorOption}
                      onClick={() => setColor(colorOption)}
                      className={`w-full h-12 rounded-xl border-2 transition-all ${
                        color === colorOption
                          ? 'border-gray-900 scale-110'
                          : 'border-gray-200 hover:scale-105'
                      }`}
                      style={{ backgroundColor: colorOption }}
                    >
                      {color === colorOption && (
                        <Check className="w-5 h-5 text-white mx-auto" />
                      )}
                    </button>
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
                onClick={handleAddCategory}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
              >
                Adicionar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Editar Categoria */}
      {editingCategory && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Editar Categoria</h3>
              <button
                onClick={() => {
                  setEditingCategory(null);
                  resetForm();
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition-all"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nome</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Ex: Alimentação"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ícone</label>
                <div className="grid grid-cols-5 gap-2">
                  {availableIcons.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => setIcon(emoji)}
                      className={`p-3 text-2xl rounded-xl border-2 transition-all ${
                        icon === emoji
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cor</label>
                <div className="grid grid-cols-5 gap-2">
                  {availableColors.map((colorOption) => (
                    <button
                      key={colorOption}
                      onClick={() => setColor(colorOption)}
                      className={`w-full h-12 rounded-xl border-2 transition-all ${
                        color === colorOption
                          ? 'border-gray-900 scale-110'
                          : 'border-gray-200 hover:scale-105'
                      }`}
                      style={{ backgroundColor: colorOption }}
                    >
                      {color === colorOption && (
                        <Check className="w-5 h-5 text-white mx-auto" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setEditingCategory(null);
                  resetForm();
                }}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleEditCategory}
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
