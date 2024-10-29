import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Settings, LogOut, Store, KeyRound, Layers, Users, Cpu, BarChart } from 'lucide-react';
import { authService } from '../../services/authService';
import { groqService } from '../../services/groqService';
import { toast } from '../ui/Toast';

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export function Sidebar({ isCollapsed, onToggleCollapse }: SidebarProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [availableModels, setAvailableModels] = useState<any[]>([]);
  const [selectedModel, setSelectedModel] = useState('');
  const [isLoadingModels, setIsLoadingModels] = useState(true);
  const [groqUsage, setGroqUsage] = useState({ tokens: 0, cost: 0 });
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = authService.isAdmin();

  useEffect(() => {
    loadModels();
    loadGroqUsage();
  }, []);

  const loadModels = async () => {
    try {
      setIsLoadingModels(true);
      const models = await groqService.getAvailableModels();
      setAvailableModels(models);
      
      const currentModel = await groqService.getCurrentModel();
      setSelectedModel(currentModel);
    } catch (error) {
      console.error('Error loading models:', error);
      toast.error('Failed to load AI models');
    } finally {
      setIsLoadingModels(false);
    }
  };

  const loadGroqUsage = async () => {
    try {
      const usage = await groqService.getUserCosts();
      const totalTokens = usage.reduce((sum, u) => sum + u.totalTokens, 0);
      const totalCost = (totalTokens / 1000) * 0.0001; // $0.0001 per 1K tokens
      setGroqUsage({ tokens: totalTokens, cost: totalCost });
    } catch (error) {
      console.error('Error loading Groq usage:', error);
    }
  };

  const handleModelChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    try {
      const newModel = e.target.value;
      await groqService.setCurrentModel(newModel);
      setSelectedModel(newModel);
      toast.success('AI model updated');
    } catch (error) {
      console.error('Error updating model:', error);
      toast.error('Failed to update AI model');
    }
  };

  const handleLogout = async () => {
    try {
      authService.logout();
      toast.success('Successfully logged out');
      navigate('/login');
    } catch (error) {
      toast.error('Error logging out');
    }
  };

  const navigation = [
    { name: 'Context', path: '/', icon: Store },
    { name: 'Keywords', path: '/keywords', icon: KeyRound },
    { name: 'Clusters', path: '/clusters', icon: Layers }
  ];

  return (
    <div className={`fixed top-0 left-0 h-full bg-white border-r border-gray-200 transition-all duration-300 z-10 ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      <div className="flex items-center justify-between h-16 px-4">
        <Link to="/" className={`flex items-center ${isCollapsed ? 'justify-center' : ''}`}>
          {!isCollapsed && (
            <span className="text-xl font-moonwalk font-bold text-primary">RankPanda</span>
          )}
        </Link>
        <button
          onClick={onToggleCollapse}
          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          {isCollapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </button>
      </div>

      <nav className="p-4 space-y-2">
        {navigation.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`
              flex items-center px-4 py-2 rounded-lg transition-colors
              ${isCollapsed ? 'justify-center' : ''}
              ${location.pathname === item.path 
                ? 'bg-secondary-lime/10 text-primary' 
                : 'text-gray-600 hover:text-primary hover:bg-gray-50'
              }
            `}
          >
            <item.icon className={`h-5 w-5 ${location.pathname === item.path ? 'text-primary' : ''}`} />
            <span className={`ml-3 transition-opacity duration-300 ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>
              {item.name}
            </span>
          </Link>
        ))}
      </nav>

      {/* AI Model Selection */}
      <div className={`px-4 py-2 border-t border-gray-200 ${isCollapsed ? 'hidden' : ''}`}>
        <div className="flex items-center mb-2">
          <Cpu className="h-4 w-4 text-[#444638] mr-2" />
          <label className="text-sm font-medium text-[#444638]">AI Model</label>
        </div>
        {isLoadingModels ? (
          <div className="text-sm text-gray-500">Loading models...</div>
        ) : (
          <select
            value={selectedModel}
            onChange={handleModelChange}
            className="w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-[#11190c] focus:ring-[#11190c]"
          >
            {availableModels.map((model) => (
              <option key={model.id} value={model.id}>
                {model.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Usage Stats */}
      <div className={`px-4 py-2 border-t border-gray-200 ${isCollapsed ? 'hidden' : ''}`}>
        <div className="flex items-center mb-2">
          <BarChart className="h-4 w-4 text-[#444638] mr-2" />
          <span className="text-sm font-medium text-[#444638]">API Usage</span>
        </div>
        <div className="text-sm text-gray-600">
          <div>Tokens: {groqUsage.tokens.toLocaleString()}</div>
          <div>Cost: €{groqUsage.cost.toFixed(2)}</div>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="absolute bottom-0 left-0 right-0 border-t border-gray-200">
        {isAdmin && (
          <Link
            to="/users"
            className={`
              w-full flex items-center px-4 py-3 text-sm font-medium transition-colors
              ${isCollapsed ? 'justify-center' : ''}
              text-gray-600 hover:text-primary hover:bg-gray-50
            `}
          >
            <Users className="h-5 w-5" />
            {!isCollapsed && <span className="ml-3">Users</span>}
          </Link>
        )}

        <button
          onClick={handleLogout}
          className={`
            w-full flex items-center px-4 py-3 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors
            ${isCollapsed ? 'justify-center' : ''}
          `}
        >
          <LogOut className="h-5 w-5" />
          {!isCollapsed && <span className="ml-3">Logout</span>}
        </button>
      </div>
    </div>
  );
}