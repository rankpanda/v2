import React, { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import { MetaSection } from './MetaSection';
import { SemrushSection } from './SemrushSection';
import { toast } from './ui/Toast';

interface FormData {
  quantitativeGoal: number;
  currentSessions: number;
  currentResult: number;
  businessContext: string;
  brandName: string;
  category: string;
  conversionRate: number;
  salesGoal: number;
  averageOrderValue: number;
  language: string;
}

export function ContextForm() {
  const [formData, setFormData] = useState<FormData>({
    quantitativeGoal: 0,
    currentSessions: 0,
    currentResult: 0,
    businessContext: '',
    brandName: '',
    category: '',
    conversionRate: 0,
    salesGoal: 0,
    averageOrderValue: 0,
    language: 'pt'
  });

  useEffect(() => {
    // Load saved data from localStorage if available
    const savedData = localStorage.getItem('contextFormData');
    if (savedData) {
      setFormData(JSON.parse(savedData));
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name.includes('Goal') || name.includes('Sessions') || name.includes('Result') || 
              name.includes('Rate') || name.includes('Value') ? 
              parseFloat(value) || 0 : value
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Save to localStorage
      localStorage.setItem('contextFormData', JSON.stringify(formData));

      // Update project context if a project is selected
      const projectId = localStorage.getItem('currentProjectId');
      if (projectId) {
        const projects = JSON.parse(localStorage.getItem('projects') || '[]');
        const projectIndex = projects.findIndex((p: any) => p.id === projectId);
        
        if (projectIndex !== -1) {
          projects[projectIndex].context = formData;
          localStorage.setItem('projects', JSON.stringify(projects));
        }
      }

      toast.success('Dados do contexto guardados com sucesso');
    } catch (error) {
      console.error('Error saving context data:', error);
      toast.error('Erro ao guardar dados do contexto');
    }
  };

  return (
    <div className="space-y-8">
      {/* Context Form */}
      <div className="bg-white shadow-sm rounded-lg p-6">
        <h2 className="text-xl font-semibold text-[#11190c] mb-6">Dados do Contexto</h2>

        <form className="space-y-6" onSubmit={handleSave}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="brandName" className="block text-sm font-medium text-[#444638]">
                Nome da Marca
              </label>
              <input
                type="text"
                id="brandName"
                name="brandName"
                value={formData.brandName}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#11190c] focus:ring-[#11190c]"
                required
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-[#444638]">
                Categoria
              </label>
              <input
                type="text"
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#11190c] focus:ring-[#11190c]"
                required
              />
            </div>

            <div>
              <label htmlFor="currentSessions" className="block text-sm font-medium text-[#444638]">
                Sessões Anuais Atuais
              </label>
              <input
                type="number"
                id="currentSessions"
                name="currentSessions"
                value={formData.currentSessions}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#11190c] focus:ring-[#11190c]"
                required
                min="0"
              />
            </div>

            <div>
              <label htmlFor="currentResult" className="block text-sm font-medium text-[#444638]">
                Resultado Atual (€)
              </label>
              <input
                type="number"
                id="currentResult"
                name="currentResult"
                value={formData.currentResult}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#11190c] focus:ring-[#11190c]"
                required
                min="0"
              />
            </div>

            <div>
              <label htmlFor="quantitativeGoal" className="block text-sm font-medium text-[#444638]">
                Objetivo Quantitativo (€)
              </label>
              <input
                type="number"
                id="quantitativeGoal"
                name="quantitativeGoal"
                value={formData.quantitativeGoal}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#11190c] focus:ring-[#11190c]"
                required
                min="0"
              />
            </div>

            <div>
              <label htmlFor="conversionRate" className="block text-sm font-medium text-[#444638]">
                Taxa de Conversão (%)
              </label>
              <input
                type="number"
                id="conversionRate"
                name="conversionRate"
                value={formData.conversionRate}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#11190c] focus:ring-[#11190c]"
                required
                min="0"
                max="100"
                step="0.01"
              />
            </div>

            <div>
              <label htmlFor="averageOrderValue" className="block text-sm font-medium text-[#444638]">
                Valor Médio de Compra (€)
              </label>
              <input
                type="number"
                id="averageOrderValue"
                name="averageOrderValue"
                value={formData.averageOrderValue}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#11190c] focus:ring-[#11190c]"
                required
                min="0"
              />
            </div>

            <div>
              <label htmlFor="language" className="block text-sm font-medium text-[#444638]">
                Idioma
              </label>
              <select
                id="language"
                name="language"
                value={formData.language}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#11190c] focus:ring-[#11190c]"
                required
              >
                <option value="pt">Português</option>
                <option value="en">English</option>
                <option value="es">Español</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="businessContext" className="block text-sm font-medium text-[#444638]">
              Contexto do Negócio
            </label>
            <textarea
              id="businessContext"
              name="businessContext"
              value={formData.businessContext}
              onChange={handleInputChange}
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#11190c] focus:ring-[#11190c]"
              required
            />
          </div>
          
          {/* Save Button */}
          <div className="flex justify-end mt-8">
            <button
              type="submit"
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-[#11190c] rounded-md hover:bg-[#0a0f07] transition-colors"
            >
              <Save className="h-4 w-4 mr-2" />
              Guardar
            </button>
          </div>
        </form>
      </div>

      {/* Meta Analysis Section */}
      <MetaSection formData={formData} />

      {/* SEMrush Data Section */}
      <SemrushSection />
    </div>
  );
}