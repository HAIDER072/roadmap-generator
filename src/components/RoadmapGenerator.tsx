import React, { useState } from 'react';
import { useRoadmapStore } from '../store/roadmapStore';
import { RoadmapGeneratorService, templates } from '../services/roadmapGenerator';
import { llmApiService } from '../services/llmApiService';
import { GenerateRoadmapRequest } from '../types/roadmap';
import { Sparkles, BookOpen, Clock, Target, Plus, X, Key } from 'lucide-react';
import ApiKeyConfig from './ApiKeyConfig';

interface RoadmapGeneratorProps {
  onClose?: () => void;
}

const RoadmapGenerator: React.FC<RoadmapGeneratorProps> = ({ onClose }) => {
  const { setCurrentRoadmap, setLoading, setError } = useRoadmapStore();
  
  const [formData, setFormData] = useState<GenerateRoadmapRequest>({
    topic: '',
    difficulty: 'beginner',
    duration: 'medium',
    focus: [],
    customRequirements: ''
  });

  const [customTopics, setCustomTopics] = useState<string[]>(['']);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [generationMode, setGenerationMode] = useState<'template' | 'ai' | 'custom'>('template');
  const [showApiKeyConfig, setShowApiKeyConfig] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(() => llmApiService.getConfig() !== null);

  const handleInputChange = (field: keyof GenerateRoadmapRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFocusAreaToggle = (area: string) => {
    setFormData(prev => ({
      ...prev,
      focus: prev.focus?.includes(area) 
        ? prev.focus.filter(f => f !== area)
        : [...(prev.focus || []), area]
    }));
  };

  const handleCustomTopicChange = (index: number, value: string) => {
    const newTopics = [...customTopics];
    newTopics[index] = value;
    setCustomTopics(newTopics);
  };

  const addCustomTopic = () => {
    setCustomTopics([...customTopics, '']);
  };

  const removeCustomTopic = (index: number) => {
    setCustomTopics(customTopics.filter((_, i) => i !== index));
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);

    try {
      let roadmap;
      
      if (generationMode === 'template' && selectedTemplate) {
        const template = templates.find(t => t.id === selectedTemplate);
        if (template) {
          roadmap = template.generateRoadmap(formData);
        }
      } else if (generationMode === 'custom') {
        const validTopics = customTopics.filter(topic => topic.trim() !== '');
        if (validTopics.length === 0) {
          setError('Please add at least one topic for your custom roadmap');
          setLoading(false);
          return;
        }
        roadmap = RoadmapGeneratorService.createCustomRoadmap(
          formData.topic || 'Custom Learning Path',
          `A personalized roadmap covering ${validTopics.join(', ')}`,
          validTopics
        );
      } else if (generationMode === 'ai') {
        // Use LLM API for AI generation
        const apiConfig = llmApiService.getConfig();
        if (!apiConfig) {
          setError('Please configure your API key first to use AI generation.');
          setShowApiKeyConfig(true);
          setLoading(false);
          return;
        }
        
        const promptData = {
          ...formData,
          provider: apiConfig.provider
        };
        
        roadmap = await llmApiService.generateRoadmapFromLLM(promptData);
      } else {
        roadmap = RoadmapGeneratorService.generateRoadmap(formData);
      }

      if (roadmap) {
        setCurrentRoadmap(roadmap);
        onClose?.();
      } else {
        setError('Failed to generate roadmap. Please try again.');
      }
    } catch (error: any) {
      console.error('Roadmap generation error:', error);
      setError(error.message || 'An error occurred while generating the roadmap');
    } finally {
      setLoading(false);
    }
  };

  const focusAreas = [
    'Frontend', 'Backend', 'Full-Stack', 'Mobile', 'DevOps', 
    'Data Science', 'Machine Learning', 'AI', 'Cybersecurity', 'Cloud'
  ];

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Sparkles className="w-6 h-6 text-purple-600 mr-2" />
          <h1 className="text-2xl font-bold text-gray-800">Generate Your Learning Roadmap</h1>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="space-y-6">
        {/* Generation Mode */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Choose Generation Mode</label>
          <div className="grid grid-cols-3 gap-4">
            <button
              onClick={() => setGenerationMode('template')}
              className={`p-4 border rounded-lg text-center transition-colors ${
                generationMode === 'template' 
                  ? 'border-blue-500 bg-blue-50 text-blue-700' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <BookOpen className="w-6 h-6 mx-auto mb-2" />
              <div className="font-medium">Template</div>
              <div className="text-sm text-gray-500">Pre-built roadmaps</div>
            </button>
            <button
              onClick={() => setGenerationMode('ai')}
              className={`p-4 border rounded-lg text-center transition-colors ${
                generationMode === 'ai' 
                  ? 'border-purple-500 bg-purple-50 text-purple-700' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <Sparkles className="w-6 h-6 mx-auto mb-2" />
              <div className="font-medium">AI Generated</div>
              <div className="text-sm text-gray-500">Smart recommendations</div>
            </button>
            <button
              onClick={() => setGenerationMode('custom')}
              className={`p-4 border rounded-lg text-center transition-colors ${
                generationMode === 'custom' 
                  ? 'border-green-500 bg-green-50 text-green-700' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <Target className="w-6 h-6 mx-auto mb-2" />
              <div className="font-medium">Custom</div>
              <div className="text-sm text-gray-500">Build your own</div>
            </button>
          </div>
        </div>

        {/* Template Selection */}
        {generationMode === 'template' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Select a Template</label>
            <div className="grid grid-cols-1 gap-3">
              {templates.map(template => (
                <button
                  key={template.id}
                  onClick={() => setSelectedTemplate(template.id)}
                  className={`p-4 border rounded-lg text-left transition-colors ${
                    selectedTemplate === template.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-800">{template.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                      <div className="flex items-center mt-2 text-xs text-gray-500">
                        <span className="mr-4">📊 {template.difficulty}</span>
                        <span>⏱️ {template.estimatedDuration}</span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Custom Topics */}
        {generationMode === 'custom' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Custom Topics</label>
            <div className="space-y-3">
              {customTopics.map((topic, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => handleCustomTopicChange(index, e.target.value)}
                    placeholder={`Topic ${index + 1}`}
                    className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                  {customTopics.length > 1 && (
                    <button
                      onClick={() => removeCustomTopic(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={addCustomTopic}
                className="flex items-center text-blue-600 hover:text-blue-700 text-sm"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Topic
              </button>
            </div>
          </div>
        )}

        {/* Topic Input (for AI mode) */}
        {generationMode === 'ai' && (
          <div>
            <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-2">
              What do you want to learn?
            </label>
            <input
              id="topic"
              type="text"
              value={formData.topic}
              onChange={(e) => handleInputChange('topic', e.target.value)}
              placeholder="e.g., Web Development, Data Science, Machine Learning"
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
        )}

        {/* Title (for custom mode) */}
        {generationMode === 'custom' && (
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Roadmap Title
            </label>
            <input
              id="title"
              type="text"
              value={formData.topic}
              onChange={(e) => handleInputChange('topic', e.target.value)}
              placeholder="e.g., My Learning Journey, Custom Skill Path"
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
        )}

        {/* Difficulty Level */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Difficulty Level</label>
          <div className="grid grid-cols-3 gap-4">
            {(['beginner', 'intermediate', 'advanced'] as const).map((level) => (
              <button
                key={level}
                onClick={() => handleInputChange('difficulty', level)}
                className={`p-3 border rounded-lg text-center transition-colors ${
                  formData.difficulty === level
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="font-medium capitalize">{level}</div>
                <div className="text-sm text-gray-500">
                  {level === 'beginner' && '🟢 New to the field'}
                  {level === 'intermediate' && '🟡 Some experience'}
                  {level === 'advanced' && '🔴 Experienced learner'}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Duration */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Learning Duration</label>
          <div className="grid grid-cols-3 gap-4">
            {(['short', 'medium', 'long'] as const).map((duration) => (
              <button
                key={duration}
                onClick={() => handleInputChange('duration', duration)}
                className={`p-3 border rounded-lg text-center transition-colors ${
                  formData.duration === duration
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <Clock className="w-5 h-5 mx-auto mb-1" />
                <div className="font-medium capitalize">{duration}</div>
                <div className="text-sm text-gray-500">
                  {duration === 'short' && '1-3 months'}
                  {duration === 'medium' && '3-6 months'}
                  {duration === 'long' && '6+ months'}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Focus Areas (for AI mode) */}
        {generationMode === 'ai' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Focus Areas (Optional)
            </label>
            <div className="flex flex-wrap gap-2">
              {focusAreas.map((area) => (
                <button
                  key={area}
                  onClick={() => handleFocusAreaToggle(area)}
                  className={`px-3 py-2 rounded-full text-sm transition-colors ${
                    formData.focus?.includes(area)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {area}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Custom Requirements */}
        <div>
          <label htmlFor="requirements" className="block text-sm font-medium text-gray-700 mb-2">
            Additional Requirements (Optional)
          </label>
          <textarea
            id="requirements"
            value={formData.customRequirements}
            onChange={(e) => handleInputChange('customRequirements', e.target.value)}
            placeholder="Any specific topics, technologies, or goals you want to include..."
            rows={3}
            className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* AI Configuration */}
        {generationMode === 'ai' && (
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Key className="w-5 h-5 text-gray-500 mr-2" />
                <span className="text-sm font-medium text-gray-700">
                  AI Provider Configuration
                </span>
              </div>
              <button
                onClick={() => setShowApiKeyConfig(true)}
                className={`px-3 py-1 rounded-md text-sm transition-colors ${
                  hasApiKey 
                    ? 'bg-green-100 text-green-800 border border-green-300'
                    : 'bg-yellow-100 text-yellow-800 border border-yellow-300 hover:bg-yellow-200'
                }`}
              >
                {hasApiKey ? '✓ Configured' : '⚠ Setup Required'}
              </button>
            </div>
            {!hasApiKey && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-700">
                  💡 <strong>AI Generation requires an API key.</strong> Click "Setup Required" to configure your preferred AI provider (Gemini, OpenAI, or Claude).
                </p>
              </div>
            )}
          </div>
        )}

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={
            (generationMode === 'template' && !selectedTemplate) ||
            (generationMode === 'ai' && (!formData.topic.trim() || !hasApiKey)) ||
            (generationMode === 'custom' && customTopics.every(t => !t.trim()))
          }
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <Sparkles className="w-5 h-5 inline mr-2" />
          Generate My Roadmap
        </button>
      </div>

      {/* API Key Configuration Modal */}
      {showApiKeyConfig && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <ApiKeyConfig
            onConfigured={() => {
              setHasApiKey(true);
              setShowApiKeyConfig(false);
            }}
            onClose={() => setShowApiKeyConfig(false)}
          />
        </div>
      )}
    </div>
  );
};

export default RoadmapGenerator;
