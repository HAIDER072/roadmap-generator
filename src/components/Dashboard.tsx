import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { useAuth } from '../contexts/AuthContext';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-3xl font-bold text-gray-900">Roadmap Generator</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                {user?.avatar && (
                  <img
                    className="h-8 w-8 rounded-full"
                    src={user.avatar}
                    alt={user.fullName}
                  />
                )}
                <span className="text-gray-700 font-medium">
                  Welcome, {user?.fullName || user?.username}!
                </span>
              </div>
              <Button onClick={handleLogout} variant="outline">
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Welcome Card */}
            <Card className="col-span-full">
              <CardHeader>
                <CardTitle>Welcome to Your Dashboard</CardTitle>
                <CardDescription>
                  Your personal space for creating and managing learning roadmaps
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-4">
                  <Button>Create New Roadmap</Button>
                  <Button variant="outline">Browse Public Roadmaps</Button>
                </div>
              </CardContent>
            </Card>

            {/* User Profile Card */}
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Username</label>
                  <p className="text-gray-900">{user?.username}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="text-gray-900">{user?.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Member Since</label>
                  <p className="text-gray-900">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Email Status</label>
                  <p className={`${user?.isEmailVerified ? 'text-green-600' : 'text-yellow-600'}`}>
                    {user?.isEmailVerified ? 'Verified' : 'Pending Verification'}
                  </p>
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  Edit Profile
                </Button>
              </CardContent>
            </Card>

            {/* Statistics Card */}
            <Card>
              <CardHeader>
                <CardTitle>Your Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-blue-600">0</p>
                    <p className="text-sm text-gray-500">Total Roadmaps</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600">0</p>
                    <p className="text-sm text-gray-500">Completed</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-yellow-600">0</p>
                    <p className="text-sm text-gray-500">In Progress</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-purple-600">0</p>
                    <p className="text-sm text-gray-500">Public</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions Card */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" size="sm">
                  🚀 Generate AI Roadmap
                </Button>
                <Button variant="outline" className="w-full" size="sm">
                  📚 Browse Templates
                </Button>
                <Button variant="outline" className="w-full" size="sm">
                  👥 Explore Community
                </Button>
                <Button variant="outline" className="w-full" size="sm">
                  ⚙️ Account Settings
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Recent Roadmaps Section */}
          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle>Your Recent Roadmaps</CardTitle>
                <CardDescription>
                  Roadmaps you've created or recently worked on
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <p>No roadmaps yet. Create your first roadmap to get started!</p>
                  <Button className="mt-4">Create Your First Roadmap</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
