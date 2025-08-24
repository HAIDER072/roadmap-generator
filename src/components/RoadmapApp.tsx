import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useRoadmapStore } from '../store/roadmapStore';
import { useAuth } from '../contexts/AuthContext';
import RoadmapRenderer from './RoadmapRenderer';
import ChatSidebar from './ChatSidebar';
import RoadmapGenerator from './RoadmapGenerator';
import Home from './Home';
import { Maximize, Minimize, Plus, MapPin, MessageCircle, Sparkles, BarChart3, User, LogOut, LogIn, UserPlus } from 'lucide-react';

function RoadmapApp() {
  const {
    currentRoadmap,
    isLoading,
    error,
    isChatOpen,
    isFullscreen,
    toggleFullscreen
  } = useRoadmapStore();

  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [showGenerator, setShowGenerator] = useState(!currentRoadmap);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const getProgressStats = () => {
    if (!currentRoadmap) return { completed: 0, total: 0, inProgress: 0 };
    
    const total = currentRoadmap.nodes.length;
    const completed = currentRoadmap.nodes.filter(node => node.data.status === 'done').length;
    const inProgress = currentRoadmap.nodes.filter(node => node.data.status === 'learning').length;
    
    return { completed, total, inProgress };
  };

  const stats = getProgressStats();
  const progressPercentage = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (showUserMenu && !target.closest('.user-menu-container')) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showUserMenu]);

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      {/* Header - only show when we have a roadmap or are loading/error */}
      {(currentRoadmap || isLoading || error || showGenerator) && (
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center">
          <div 
            className="flex items-center mr-6 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => {
              setShowGenerator(!currentRoadmap);
              if (currentRoadmap) {
                // Optionally reset to home state
                window.location.reload();
              }
            }}
            title="Click to go home"
          >
            <MapPin className="w-8 h-8 text-blue-600 mr-2" />
            <h1 className="text-2xl font-bold text-gray-800">Smartlearn.io</h1>
          </div>
          
          {currentRoadmap && (
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center text-gray-600">
                <BarChart3 className="w-4 h-4 mr-1" />
                <span className="font-medium">{currentRoadmap.title}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                  ✅ {stats.completed} completed
                </div>
                <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                  📚 {stats.inProgress} in progress
                </div>
                <div className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">
                  📊 {progressPercentage}% complete
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {isAuthenticated && (
            <button
              onClick={() => setShowGenerator(true)}
              className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all text-sm font-medium"
            >
              <Plus className="w-4 h-4 mr-1" />
              New Roadmap
            </button>
          )}
          
          {currentRoadmap && (
            <>
              {isChatOpen && (
                <div className="flex items-center text-green-600 text-sm font-medium">
                  <MessageCircle className="w-4 h-4 mr-1" />
                  AI Chat Active
                </div>
              )}
              
              <button
                onClick={toggleFullscreen}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
              >
                {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
              </button>
            </>
          )}

          {/* Authentication Section */}
          {isAuthenticated ? (
            <div className="relative user-menu-container">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {user?.firstName ? user.firstName[0].toUpperCase() : user?.username[0].toUpperCase()}
                </div>
                <span className="text-sm font-medium">{user?.firstName || user?.username}</span>
              </button>
              
              {/* User Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">{user?.fullName || user?.username}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                  <Link
                    to="/dashboard"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <User className="w-4 h-4 mr-2" />
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setShowUserMenu(false);
                      navigate('/');
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link
                to="/login"
                className="flex items-center px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors text-sm font-medium"
              >
                <LogIn className="w-4 h-4 mr-1" />
                Sign In
              </Link>
              <Link
                to="/register"
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                <UserPlus className="w-4 h-4 mr-1" />
                Sign Up
              </Link>
            </div>
          )}
        </div>
        </header>
      )}

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Loading State */}
        {isLoading && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Sparkles className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-700 mb-2">Generating Your Roadmap</h2>
              <p className="text-gray-500">Please wait while we create your personalized learning path...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center max-w-md">
              <div className="text-4xl mb-4">⚠️</div>
              <h2 className="text-xl font-semibold text-gray-700 mb-2">Something went wrong</h2>
              <p className="text-gray-500 mb-4">{error}</p>
              <button
                onClick={() => setShowGenerator(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Generator Modal */}
        {showGenerator && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <RoadmapGenerator onClose={() => setShowGenerator(false)} />
            </div>
          </div>
        )}

        {/* Home Page - shown when no roadmap */}
        {!isLoading && !error && !currentRoadmap && (
          <div className="flex-1 overflow-y-auto">
            <Home onGetStarted={() => setShowGenerator(true)} />
          </div>
        )}

        {/* Roadmap Renderer - shown when roadmap exists */}
        {!isLoading && !error && currentRoadmap && (
          <RoadmapRenderer 
            className={`flex-1 ${isChatOpen ? 'mr-96' : ''} transition-all duration-300`} 
          />
        )}

        {/* Chat Sidebar */}
        {currentRoadmap && <ChatSidebar />}
      </div>

      {/* Footer */}
      {currentRoadmap && !isFullscreen && (
        <footer className="bg-white border-t border-gray-200 px-4 py-2 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-4">
            <span>💡 Click nodes to learn • Right-click to mark complete • Shift+click for in-progress</span>
          </div>
          <div className="flex items-center space-x-2">
            <span>Progress: {progressPercentage}%</span>
            <div className="w-20 h-2 bg-gray-200 rounded-full">
              <div 
                className="h-2 bg-green-500 rounded-full transition-all duration-300" 
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}

export default RoadmapApp;
