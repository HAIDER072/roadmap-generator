import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { useAuth } from '../contexts/AuthContext';
import { Trash2, Plus, MapPin } from 'lucide-react';

interface Roadmap {
  _id: string;
  title: string;
  description: string;
  topic: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  steps: any[];
  progress: {
    completedSteps: number;
    totalSteps: number;
    percentage: number;
  };
  createdAt: string;
  updatedAt: string;
  isPublic: boolean;
}

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchRoadmaps();
  }, []);

  const fetchRoadmaps = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(process.env.REACT_APP_API_URL + '/roadmaps', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setRoadmaps(data.roadmaps || []);
        setError(null);
      } else {
        setError('Failed to fetch roadmaps');
      }
    } catch (err) {
      setError('Network error while fetching roadmaps');
    } finally {
      setLoading(false);
    }
  };

  const deleteRoadmap = async (roadmapId: string) => {
    if (!window.confirm('Are you sure you want to delete this roadmap? This action cannot be undone.')) {
      return;
    }

    try {
      setDeleting(roadmapId);
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/roadmaps/${roadmapId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setRoadmaps(roadmaps.filter(r => r._id !== roadmapId));
      } else {
        window.alert('Failed to delete roadmap');
      }
    } catch (err) {
      window.alert('Network error while deleting roadmap');
    } finally {
      setDeleting(null);
    }
  };

  const handleCreateRoadmap = () => {
    navigate('/roadmap');
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <MapPin className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Roadmap Generator</h1>
            </Link>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {user?.username}!</span>
              <Button onClick={handleCreateRoadmap} size="sm">
                <Plus className="w-4 h-4 mr-1" />
                New Roadmap
              </Button>
              <Button onClick={handleLogout} variant="outline" size="sm">
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Stats */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">My Roadmaps</h2>
                <p className="text-gray-600 mt-1">You have created {roadmaps.length} roadmap{roadmaps.length !== 1 ? 's' : ''}</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-blue-600">{roadmaps.length}</div>
                <div className="text-sm text-gray-500">Total Roadmaps</div>
              </div>
            </div>
          </div>
        </div>

        {/* Roadmaps Grid */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Loading your roadmaps...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500 mb-4">{error}</p>
              <Button onClick={fetchRoadmaps}>Try Again</Button>
            </div>
          ) : roadmaps.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No roadmaps yet</h3>
              <p className="text-gray-500 mb-6">Create your first roadmap to get started on your learning journey!</p>
              <Button onClick={handleCreateRoadmap}>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Roadmap
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {roadmaps.map((roadmap) => (
                <Card key={roadmap._id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg leading-6 mb-1">{roadmap.title}</CardTitle>
                        <p className="text-sm text-gray-600 line-clamp-2">{roadmap.description || roadmap.topic}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteRoadmap(roadmap._id)}
                        disabled={deleting === roadmap._id}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        {deleting === roadmap._id ? (
                          <div className="w-4 h-4 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${getDifficultyColor(roadmap.difficulty)}`}>
                        {roadmap.difficulty}
                      </span>
                      <span>{new Date(roadmap.createdAt).toLocaleDateString()}</span>
                    </div>
                    
                    {roadmap.progress && (
                      <div className="mb-3">
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>Progress</span>
                          <span>{roadmap.progress.percentage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${roadmap.progress.percentage}%` }}
                          />
                        </div>
                      </div>
                    )}
                    
                    <Button 
                      onClick={() => navigate(`/roadmap?id=${roadmap._id}`)}
                      className="w-full"
                      size="sm"
                    >
                      Open Roadmap
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
