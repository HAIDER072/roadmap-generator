import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export interface User {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  fullName: string;
  avatar?: string;
  isEmailVerified: boolean;
  role: string;
  preferences: {
    theme: 'light' | 'dark' | 'system';
    notifications: {
      email: boolean;
      roadmapUpdates: boolean;
    };
  };
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

interface AuthContextType {
  user: User | null;
  tokens: AuthTokens | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

const AuthContext = createContext<AuthContextType | null>(null);

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [tokens, setTokens] = useState<AuthTokens | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user && !!tokens;

  // Load tokens and user from localStorage on init
  useEffect(() => {
    const loadAuthData = () => {
      try {
        const storedTokens = localStorage.getItem('auth_tokens');
        const storedUser = localStorage.getItem('auth_user');
        
        if (storedTokens && storedUser) {
          const parsedTokens = JSON.parse(storedTokens);
          const parsedUser = JSON.parse(storedUser);
          
          setTokens(parsedTokens);
          setUser(parsedUser);
        }
      } catch (error) {
        console.error('Error loading auth data:', error);
        clearAuthData();
      } finally {
        setIsLoading(false);
      }
    };

    loadAuthData();
  }, []);

  // Save auth data to localStorage
  const saveAuthData = (user: User, tokens: AuthTokens) => {
    localStorage.setItem('auth_user', JSON.stringify(user));
    localStorage.setItem('auth_tokens', JSON.stringify(tokens));
    setUser(user);
    setTokens(tokens);
  };

  // Clear auth data
  const clearAuthData = () => {
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_tokens');
    setUser(null);
    setTokens(null);
  };

  // API request helper with token
  const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    // Add authorization header if tokens exist
    if (tokens?.accessToken) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${tokens.accessToken}`,
      };
    }

    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Request failed');
    }

    return data;
  };

  // Login function
  const login = async (identifier: string, password: string) => {
    try {
      setIsLoading(true);
      const data = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ identifier, password }),
      });

      saveAuthData(data.user, data.tokens);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (userData: RegisterData) => {
    try {
      setIsLoading(true);
      const data = await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      });

      saveAuthData(data.user, data.tokens);
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      if (tokens?.refreshToken) {
        await apiRequest('/auth/logout', {
          method: 'POST',
          body: JSON.stringify({ refreshToken: tokens.refreshToken }),
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearAuthData();
    }
  };

  // Refresh token function
  const refreshToken = async () => {
    try {
      if (!tokens?.refreshToken) {
        throw new Error('No refresh token available');
      }

      const data = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken: tokens.refreshToken }),
      });

      if (!data.ok) {
        throw new Error('Token refresh failed');
      }

      const result = await data.json();
      
      const newTokens = { ...tokens, ...result.tokens };
      setTokens(newTokens);
      localStorage.setItem('auth_tokens', JSON.stringify(newTokens));
    } catch (error) {
      console.error('Token refresh error:', error);
      clearAuthData();
      throw error;
    }
  };

  // Update user data
  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('auth_user', JSON.stringify(updatedUser));
    }
  };

  const contextValue: AuthContextType = {
    user,
    tokens,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    refreshToken,
    updateUser,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
