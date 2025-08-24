import React, { useState, useEffect } from 'react';
import { llmApiService, LLMApiConfig } from '../services/llmApiService';
import { Key, Eye, EyeOff, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';

interface ApiKeyConfigProps {
  onConfigured?: (config: LLMApiConfig) => void;
  onClose?: () => void;
}

const ApiKeyConfig: React.FC<ApiKeyConfigProps> = ({ onConfigured, onClose }) => {
  const [provider, setProvider] = useState<'gemini' | 'openai' | 'anthropic'>('gemini');
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<'success' | 'error' | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    // Load existing config if available
    const existingConfig = llmApiService.getConfig();
    if (existingConfig) {
      setProvider(existingConfig.provider);
      setApiKey(existingConfig.apiKey);
      setValidationResult('success');
    }
  }, []);

  const providerInfo = {
    gemini: {
      name: 'Google Gemini',
      description: 'Fast and capable AI model from Google',
      getKeyUrl: 'https://aistudio.google.com/app/apikey',
      example: 'AI...'
    },
    openai: {
      name: 'OpenAI GPT',
      description: 'Industry-leading AI models from OpenAI',
      getKeyUrl: 'https://platform.openai.com/api-keys',
      example: 'sk-...'
    },
    anthropic: {
      name: 'Anthropic Claude',
      description: 'Advanced AI assistant with strong reasoning',
      getKeyUrl: 'https://console.anthropic.com/account/keys',
      example: 'sk-ant-...'
    }
  };

  const handleProviderChange = (newProvider: 'gemini' | 'openai' | 'anthropic') => {
    setProvider(newProvider);
    setApiKey('');
    setValidationResult(null);
    setError('');
  };

  const validateApiKey = async () => {
    if (!apiKey.trim()) {
      setError('Please enter an API key');
      return;
    }

    setIsValidating(true);
    setError('');
    setValidationResult(null);

    try {
      const config: LLMApiConfig = { provider, apiKey: apiKey.trim() };
      llmApiService.setConfig(config);

      // Test the API with a simple prompt
      const testPrompt = {
        topic: 'JavaScript Basics',
        difficulty: 'beginner' as const,
        duration: 'short' as const,
        focus: [],
        customRequirements: '',
        provider
      };

      await llmApiService.generateRoadmapFromLLM(testPrompt);
      
      setValidationResult('success');
      onConfigured?.(config);
      
      // Auto-close after successful validation
      setTimeout(() => {
        onClose?.();
      }, 2000);
      
    } catch (error: any) {
      console.error('API validation failed:', error);
      setValidationResult('error');
      setError(error.message || 'Failed to validate API key. Please check your key and try again.');
      llmApiService.clearConfig();
    } finally {
      setIsValidating(false);
    }
  };

  const handleSkip = () => {
    onClose?.();
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="flex items-center mb-6">
        <Key className="w-6 h-6 text-blue-600 mr-2" />
        <h2 className="text-xl font-bold text-gray-800">Configure AI Provider</h2>
      </div>

      <div className="space-y-4">
        {/* Provider Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Choose AI Provider
          </label>
          <div className="space-y-2">
            {Object.entries(providerInfo).map(([key, info]) => (
              <button
                key={key}
                onClick={() => handleProviderChange(key as any)}
                className={`w-full p-3 border rounded-lg text-left transition-colors ${
                  provider === key
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="font-medium">{info.name}</div>
                <div className="text-sm text-gray-500">{info.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* API Key Input */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              API Key for {providerInfo[provider].name}
            </label>
            <a
              href={providerInfo[provider].getKeyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 text-sm flex items-center"
            >
              Get API Key <ExternalLink className="w-3 h-3 ml-1" />
            </a>
          </div>
          
          <div className="relative">
            <input
              type={showApiKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={`Enter your API key (${providerInfo[provider].example})`}
              className="w-full border border-gray-300 rounded-md px-3 py-2 pr-10 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={() => setShowApiKey(!showApiKey)}
              className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
            >
              {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          
          {validationResult === 'success' && (
            <div className="flex items-center mt-2 text-green-600 text-sm">
              <CheckCircle className="w-4 h-4 mr-1" />
              API key validated successfully!
            </div>
          )}
          
          {error && (
            <div className="flex items-center mt-2 text-red-600 text-sm">
              <AlertCircle className="w-4 h-4 mr-1" />
              {error}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 pt-4">
          <button
            onClick={validateApiKey}
            disabled={isValidating || !apiKey.trim()}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isValidating ? 'Validating...' : 'Validate & Save'}
          </button>
          
          <button
            onClick={handleSkip}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Skip for Now
          </button>
        </div>

        {/* Info Note */}
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>Note:</strong> Your API key is stored locally in your browser and never sent to our servers. 
            It's used only to communicate directly with the AI provider.
          </p>
        </div>

        {/* Instructions */}
        <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-sm text-gray-700">
            <strong>How it works:</strong>
          </p>
          <ol className="text-sm text-gray-600 mt-2 space-y-1">
            <li>1. Get an API key from {providerInfo[provider].name}</li>
            <li>2. Enter it above and click "Validate & Save"</li>
            <li>3. Generate AI-powered learning roadmaps instantly</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyConfig;
