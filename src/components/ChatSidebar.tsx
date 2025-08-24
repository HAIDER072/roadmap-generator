import React, { useState, useRef, useEffect } from 'react';
import { useRoadmapStore } from '../store/roadmapStore';
import { X, Send, Bot, User, ExternalLink, BookOpen, Clock } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const ChatSidebar: React.FC = () => {
  const {
    isChatOpen,
    activeChatSession,
    selectedNode,
    closeChat,
    sendMessage,
    updateNodeStatus
  } = useRoadmapStore();

  const [messageInput, setMessageInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeChatSession?.messages]);

  useEffect(() => {
    if (isChatOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isChatOpen]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeChatSession) return;

    const message = messageInput.trim();
    setMessageInput('');
    setIsTyping(true);

    sendMessage(message);

    // Simulate typing delay
    setTimeout(() => {
      setIsTyping(false);
    }, 1500);
  };

  const handleStatusChange = (status: 'pending' | 'learning' | 'done' | 'skipped') => {
    if (selectedNode) {
      updateNodeStatus(selectedNode.id, status);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'done': return 'text-green-600 bg-green-50';
      case 'learning': return 'text-blue-600 bg-blue-50';
      case 'skipped': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return '🟢';
      case 'intermediate': return '🟡';
      case 'advanced': return '🔴';
      default: return '⚪';
    }
  };

  if (!isChatOpen || !activeChatSession || !selectedNode) {
    return null;
  }

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-white border-l border-gray-200 shadow-lg flex flex-col z-40">
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <Bot className="w-5 h-5 text-blue-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-800">Learning Assistant</h2>
          </div>
          <button
            onClick={closeChat}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Node Info */}
        <div className="bg-gray-50 rounded-lg p-3 mb-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-gray-800 text-sm">{selectedNode.data.label}</h3>
            <span className={`px-2 py-1 rounded text-xs ${getStatusColor(selectedNode.data.status)}`}>
              {selectedNode.data.status}
            </span>
          </div>
          
          <div className="flex items-center text-xs text-gray-600 mb-2">
            <span className="mr-3">
              {getDifficultyIcon(selectedNode.data.difficulty)} {selectedNode.data.difficulty}
            </span>
            {selectedNode.data.estimatedTime && (
              <span className="flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                {selectedNode.data.estimatedTime}
              </span>
            )}
          </div>
          
          <p className="text-xs text-gray-600 leading-relaxed">
            {selectedNode.data.description}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2 mb-3">
          <button
            onClick={() => handleStatusChange('learning')}
            className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
          >
            📚 Start Learning
          </button>
          <button
            onClick={() => handleStatusChange('done')}
            className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors"
          >
            ✅ Mark Complete
          </button>
          <button
            onClick={() => handleStatusChange('pending')}
            className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
          >
            🔄 Reset
          </button>
        </div>

        {/* Resources */}
        {selectedNode.data.resources.length > 0 && (
          <div className="border-t border-gray-200 pt-3">
            <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
              <BookOpen className="w-4 h-4 mr-1" />
              Resources ({selectedNode.data.resources.length})
            </h4>
            <div className="space-y-2 max-h-24 overflow-y-auto">
              {selectedNode.data.resources.map((resource) => (
                <a
                  key={resource.id}
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-2 bg-white border border-gray-200 rounded text-xs hover:border-blue-300 hover:bg-blue-50 transition-colors"
                >
                  <div>
                    <div className="font-medium text-gray-800">{resource.title}</div>
                    <div className="text-gray-500">{resource.type} • {resource.difficulty}</div>
                  </div>
                  <ExternalLink className="w-3 h-3 text-gray-400" />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeChatSession.messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[85%] ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
              <div className={`flex items-start space-x-2 ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                  message.type === 'user' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {message.type === 'user' ? (
                    <User className="w-3 h-3" />
                  ) : (
                    <Bot className="w-3 h-3" />
                  )}
                </div>
                <div
                  className={`px-3 py-2 rounded-lg ${
                    message.type === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {message.type === 'assistant' ? (
                    <div className="text-sm prose prose-sm max-w-none prose-headings:mt-2 prose-headings:mb-1 prose-p:my-1 prose-ul:my-1 prose-li:my-0">
                      <ReactMarkdown 
                        components={{
                          a: ({ node, ...props }) => (
                            <a 
                              {...props} 
                              className="text-blue-600 hover:text-blue-800 underline" 
                              target="_blank" 
                              rel="noopener noreferrer"
                            >
                              {props.children}
                            </a>
                          ),
                          p: ({ node, ...props }) => <p {...props} className="mb-2 last:mb-0" />,
                          ul: ({ node, ...props }) => <ul {...props} className="list-disc list-inside mb-2 last:mb-0" />,
                          li: ({ node, ...props }) => <li {...props} className="mb-1" />
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-sm">{message.content}</p>
                  )}
                </div>
              </div>
              <div className={`text-xs text-gray-500 mt-1 ${message.type === 'user' ? 'text-right' : 'text-left'}`}>
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="flex items-start space-x-2">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center">
                <Bot className="w-3 h-3" />
              </div>
              <div className="bg-gray-100 text-gray-800 px-3 py-2 rounded-lg">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 p-4">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <input
            ref={inputRef}
            type="text"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            placeholder="Ask me anything about this topic..."
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={!messageInput.trim() || isTyping}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        
        <div className="mt-2 text-xs text-gray-500 text-center">
          Ask about concepts, resources, best practices, or next steps
        </div>
      </div>
    </div>
  );
};

export default ChatSidebar;
