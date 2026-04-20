import { Routes, Route, Link, useLocation, useNavigate, useParams, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  LayoutDashboard,
  PlusCircle,
  Wallet,
  Users,
  LogOut,
  Copy,
  Share2,
  Mail,
  MessageCircle,
  CheckCircle,
  ArrowLeft,
  User,
  X,
  ChevronRight,
  TrendingUp,
  MoreHorizontal,
  AlertCircle,
  Loader2,
  Trash2,
  Plus,
  Eye,
  EyeOff,
  Lock
} from 'lucide-react';
import DashboardSettings from './pages/dashboard/Settings';

// Types
declare global {
  interface Window {
    PaystackPop: {
      setup: (config: {
        key: string;
        email: string;
        amount: number;
        ref: string;
        currency: string;
        channels: string[];
        callback: (response: { reference: string }) => void;
        onClose: () => void;
      }) => {
        openIframe: () => void;
      };
    };
  }
}

interface CustomField {
  id: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'number' | 'select';
  required: boolean;
  options?: string[];
}

interface Collection {
  id: string;
  title: string;
  description: string;
  amount: number;
  type: 'fixed' | 'flexible';
  targetAmount?: number;
  deadline?: string;
  allowAnonymous: boolean;
  showProgress: boolean;
  customFields: CustomField[];
  participants: number;
  collected: number;
  status: 'active' | 'completed' | 'pending';
  createdAt: string;
  shareLink: string;
  slug: string;
  hostId: string;
}

interface User {
  id: string;
  name: string;
  email: string;
}

// Auth Context
const useAuth = () => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('easycollect_user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = (email: string, password: string): boolean => {
    const users = JSON.parse(localStorage.getItem('easycollect_users') || '[]');
    const found = users.find((u: any) => u.email === email && u.password === password);
    if (found) {
      const { password, ...userWithoutPassword } = found;
      setUser(userWithoutPassword);
      localStorage.setItem('easycollect_user', JSON.stringify(userWithoutPassword));
      return true;
    }
    return false;
  };

  const register = (name: string, email: string, password: string): boolean => {
    const users = JSON.parse(localStorage.getItem('easycollect_users') || '[]');
    if (users.find((u: any) => u.email === email)) return false;
    
    const newUser = { id: uuidv4(), name, email, password };
    users.push(newUser);
    localStorage.setItem('easycollect_users', JSON.stringify(users));
    
    const { password: _, ...userWithoutPassword } = newUser;
    setUser(userWithoutPassword);
    localStorage.setItem('easycollect_user', JSON.stringify(userWithoutPassword));
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('easycollect_user');
  };

  return { user, login, register, logout };
};

// Mock Data
const getCollections = (hostId?: string): Collection[] => {
  const all = JSON.parse(localStorage.getItem('easycollect_collections') || '[]');
  return hostId ? all.filter((c: Collection) => c.hostId === hostId) : all;
};

const saveCollection = (collection: Collection) => {
  const all = JSON.parse(localStorage.getItem('easycollect_collections') || '[]');
  all.push(collection);
  localStorage.setItem('easycollect_collections', JSON.stringify(all));
};

// Auth Pages
const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(email, password)) {
      navigate('/dashboard');
    } else {
      setError('Invalid email or password');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <img src="/images/nigerian-campus.jpg" alt="Campus" className="w-full h-full object-cover" />
      </div>
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl w-full max-w-md p-8 relative z-10 border border-green-100">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-emerald-700 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-200">
            <Wallet className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
          <p className="text-gray-600">Sign in to Nigeria's trusted collection platform</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="host@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-xl font-semibold hover:shadow-xl hover:shadow-green-200 transition-all hover:-translate-y-0.5"
          >
            Sign In
          </button>
        </form>

        <p className="text-center mt-6 text-gray-600">
          Don't have an account?{' '}
          <Link to="/register" className="text-green-600 font-semibold hover:underline">
            Create Account
          </Link>
        </p>
      </div>
    </div>
  );
};

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [agreed, setAgreed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (!agreed) {
      setError('Please accept the terms of agreement');
      return;
    }
    if (register(name, email, password)) {
      navigate('/dashboard');
    } else {
      setError('Email already registered');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Nigerian Green Gradient Background */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-green-600 via-emerald-700 to-green-800 relative overflow-hidden">
        {/* Animated shapes */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-green-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-green-400/10 rounded-full blur-2xl"></div>
        </div>
        
        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <Link to="/" className="text-sm mb-8 hover:underline flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Home Page
          </Link>
          
          <h1 className="text-5xl font-bold mb-4 animate-fade-in">
            Get Started
          </h1>
          <p className="text-green-100 text-lg mb-8">
            Already have an account?
          </p>
          <Link 
            to="/login"
            className="inline-flex items-center justify-center px-8 py-3 border-2 border-white/30 rounded-xl text-white font-semibold hover:bg-white/10 transition-all w-fit"
          >
            Log in
          </Link>
          
          {/* Trust badges - Nigerian theme */}
          <div className="mt-16 space-y-4">
            <div className="flex items-center gap-3 text-sm text-green-100">
              <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                <CheckCircle className="w-4 h-4" />
              </div>
              <span>Free Forever for Nigerian Students</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-green-100">
              <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                <CheckCircle className="w-4 h-4" />
              </div>
              <span>Secure Bank Transfer Payments</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-green-100">
              <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                <CheckCircle className="w-4 h-4" />
              </div>
              <span>Trusted by 10,000+ Students</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-green-100">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Create account</h2>
                <p className="text-sm text-gray-500 mt-1">Join Nigeria's trusted collection platform</p>
              </div>
              <Link to="#" className="text-sm text-gray-500 hover:text-green-600">Need help?</Link>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4 flex items-center gap-2 text-sm">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            {/* Social Login */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="text-sm font-medium text-gray-700">Google</span>
              </button>
              <button className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
                <span className="text-sm font-medium text-gray-700">Apple</span>
              </button>
            </div>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">or continue with email</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                  placeholder="host@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                  placeholder="John Doe"
                  required
                />
              </div>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="w-5 h-5 text-green-600 rounded mt-0.5"
                />
                <span className="text-sm text-gray-600">
                  I accept the terms of the agreement
                </span>
              </label>

              <button
                type="submit"
                className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-all shadow-lg shadow-green-200"
              >
                Sign up
              </button>
            </form>

            <p className="text-center mt-6 text-sm text-gray-600 lg:hidden">
              Already have an account?{' '}
              <Link to="/login" className="text-green-600 font-semibold hover:underline">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  return user ? <>{children}</> : <Navigate to="/login" replace />;
};

// Layout Component
const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/dashboard/create-collection', label: 'Create Collection', icon: PlusCircle },
    { path: '/dashboard/collections', label: 'My Collections', icon: Wallet },
    { path: '/dashboard/contributors', label: 'Contributors', icon: Users },
    { path: '/dashboard/settings', label: 'Settings', icon: Lock },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-emerald-700 rounded-lg flex items-center justify-center">
            <Wallet className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl text-green-700">EasyCollect</span>
        </Link>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <MoreHorizontal className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-14 bg-white z-40">
          <nav className="p-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  location.pathname === item.path
                    ? 'bg-green-50 text-green-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-all"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </nav>
        </div>
      )}

      <div className="flex">
        {/* Sidebar - Desktop */}
        <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-200 h-screen sticky top-0">
          <div className="p-6">
            <Link to="/dashboard" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-emerald-700 rounded-xl flex items-center justify-center">
                <Wallet className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-green-700">EasyCollect</span>
            </Link>
          </div>

          <nav className="flex-1 px-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  location.pathname === item.path
                    ? 'bg-green-50 text-green-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center gap-3 px-4 py-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-emerald-700 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{user?.name}</p>
                <p className="text-sm text-gray-500">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-all"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
};

// Pages
const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-emerald-700 rounded-xl flex items-center justify-center">
                <Wallet className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-green-700">EasyCollect</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-gray-600 hover:text-gray-900 font-medium">
                Sign In
              </Link>
              <Link
                to="/register"
                className="bg-gradient-to-r from-green-600 to-emerald-700 text-white px-5 py-2.5 rounded-xl font-semibold hover:shadow-lg transition-all"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-white to-emerald-50">
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-teal-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
          </div>
          {/* Grid pattern overlay */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.03%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold mb-6 animate-fadeInUp">
                <span className="flex h-2 w-2 rounded-full bg-green-600 animate-pulse"></span>
                Trusted by 10,000+ Students
              </div>
              
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight animate-fadeInUp">
                Collect Money for{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-emerald-500 to-amber-400">
                  Class Projects & Events
                </span>
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 animate-fadeInUp delay-100">
                The easiest way for Nigerian students to collect money for handouts, course dues, parties, and projects. No stress, zero fees.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8 animate-fadeInUp delay-200">
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-700 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-2xl hover:shadow-green-500/25 transition-all hover:-translate-y-1 group"
                >
                  Get Started
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/contribute/demo"
                  className="inline-flex items-center justify-center gap-2 bg-white text-gray-700 border-2 border-gray-200 px-8 py-4 rounded-xl font-semibold hover:border-purple-500 hover:text-green-600 transition-all hover:-translate-y-1 hover:shadow-lg"
                >
                  Learn More
                </Link>
              </div>
              
              {/* Trust badges */}
              <div className="flex flex-wrap items-center gap-6 justify-center lg:justify-start animate-fadeInUp delay-300">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  Zero Fees
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  Instant Setup
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  Bank Transfer
                </div>
              </div>
            </div>
            
            {/* Right Content - Dashboard Preview */}
            <div className="hidden lg:block relative animate-fadeInUp delay-200">
              <div className="relative">
                {/* Floating cards */}
                <div className="absolute -top-4 -left-4 bg-white rounded-2xl shadow-xl p-4 z-20 animate-float">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Payment Received</p>
                      <p className="font-bold text-gray-900">₦5,000</p>
                    </div>
                  </div>
                </div>
                
                <div className="absolute -bottom-4 -right-4 bg-white rounded-2xl shadow-xl p-4 z-20 animate-float animation-delay-2000">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">New Contributor</p>
                      <p className="font-bold text-gray-900">John Doe</p>
                    </div>
                  </div>
                </div>
                
                {/* Main dashboard card */}
                <div className="bg-white rounded-3xl shadow-2xl p-6 border border-gray-100 transform rotate-2 hover:rotate-0 transition-transform duration-500">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-700 rounded-xl flex items-center justify-center">
                        <Wallet className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">Class Fund</p>
                        <p className="text-sm text-gray-500">Handout Collection</p>
                      </div>
                    </div>
                    <span className="bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">Active</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-sm text-gray-500 mb-1">Collected</p>
                      <p className="text-2xl font-bold text-gray-900">₦45,000</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-sm text-gray-500 mb-1">Contributors</p>
                      <p className="text-2xl font-bold text-gray-900">18</p>
                    </div>
                  </div>
                  
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full w-3/4 bg-gradient-to-r from-purple-600 to-emerald-500 rounded-full"></div>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">75% of goal reached</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-gray-600">Create and share payment links in minutes</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Create Account', desc: 'Sign up as a student host in seconds' },
              { step: '02', title: 'Set Up Collection', desc: 'Add amount and required info fields' },
              { step: '03', title: 'Share & Collect', desc: 'Send link to classmates via WhatsApp' }
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center hover-lift">
                <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-emerald-700 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold text-white">{item.step}</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How to Contribute Section with Illustration */}
      <section className="py-20 bg-gray-900 text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Image */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-orange-500/20 rounded-3xl blur-3xl"></div>
              <img 
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&auto=format&fit=crop&q=80" 
                alt="Student using phone" 
                className="relative rounded-3xl shadow-2xl w-full object-cover h-[500px]"
              />
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-gradient-to-br from-green-400 to-amber-400 rounded-full opacity-60 blur-2xl"></div>
              <div className="absolute -top-6 -left-6 w-24 h-24 bg-gradient-to-br from-purple-400 to-green-400 rounded-full opacity-60 blur-2xl"></div>
            </div>
            
            {/* Content */}
            <div className="lg:pl-8">
              <h2 className="text-4xl lg:text-5xl font-bold mb-6 bg-gradient-to-r from-green-400 to-amber-400 bg-clip-text text-transparent">
                How to Contribute
              </h2>
              <p className="text-gray-300 text-lg mb-8">
                Contributing takes less than two minutes. Follow these simple steps and you&apos;re done!
              </p>
              
              <div className="space-y-6">
                {[
                  { step: '1', title: 'Click the Link', desc: 'Open the collection link shared by your class rep' },
                  { step: '2', title: 'Fill Your Details', desc: 'Enter your name and any required information' },
                  { step: '3', title: 'Pay Instantly', desc: 'Transfer to the virtual account number shown' }
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="font-bold text-white">{item.step}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-xl mb-1">{item.title}</h3>
                      <p className="text-gray-400">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-10 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                <p className="text-pink-300 text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  New collections are added regularly. Check back often or subscribe to notifications so you never miss a deadline.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

const DashboardPage = () => {
  const { user } = useAuth();
  const collections = getCollections(user?.id);

  const stats = {
    totalCollections: collections.length,
    totalCollected: collections.reduce((sum, c) => sum + c.collected, 0),
    totalContributors: collections.reduce((sum, c) => sum + c.participants, 0),
    activeCollections: collections.filter(c => c.status === 'active').length
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Animated Header */}
      <div className="bg-gradient-to-r from-purple-600 via-green-700 to-teal-800 text-white p-4 sticky top-0 z-10 shadow-lg">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center animate-pulse">
              <span className="font-bold text-lg">C</span>
            </div>
            <span className="font-bold text-xl">EasyCollect</span>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2 hover:bg-white/10 rounded-xl transition-colors relative">
              <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>
            <Link
              to="/dashboard/create-collection"
              className="flex items-center gap-2 bg-white text-green-600 px-4 py-2 rounded-xl font-semibold text-sm hover:shadow-lg transition-all hover:-translate-y-0.5"
            >
              <Plus className="w-5 h-5" />
              Create Fund
            </Link>
          </div>
        </div>
      </div>

      <div className="p-4 lg:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Welcome with Avatar */}
          <div className="mb-8 flex items-start justify-between">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2 animate-fade-in">
                Welcome Back! 🎓
              </h1>
              <p className="text-gray-600">
                Manage your class funds and track contributions
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-3 bg-white px-4 py-2 rounded-2xl shadow-sm">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">{user?.name || 'User'}</p>
                <p className="text-xs text-gray-500">Student Host</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <Link to="/dashboard/create-collection" className="bg-gradient-to-br from-green-500 to-green-600 text-white p-4 rounded-2xl hover:shadow-lg transition-all hover:-translate-y-1 group">
              <Plus className="w-6 h-6 mb-2 group-hover:scale-110 transition-transform" />
              <p className="font-semibold text-sm">Create Fund</p>
            </Link>
            <Link to="/dashboard/settings" className="bg-white p-4 rounded-2xl border border-gray-100 hover:shadow-lg transition-all hover:-translate-y-1 group">
              <Wallet className="w-6 h-6 mb-2 text-blue-500 group-hover:scale-110 transition-transform" />
              <p className="font-semibold text-sm text-gray-900">Bank Settings</p>
            </Link>
            <button className="bg-white p-4 rounded-2xl border border-gray-100 hover:shadow-lg transition-all hover:-translate-y-1 group">
              <Share2 className="w-6 h-6 mb-2 text-green-500 group-hover:scale-110 transition-transform" />
              <p className="font-semibold text-sm text-gray-900">Share Link</p>
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            {/* Total Funds Created */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer group">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Wallet className="w-6 h-6 text-white" />
                </div>
                <span className="bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
                  All Time
                </span>
              </div>
              <p className="text-3xl font-bold text-gray-900 group-hover:text-green-600 transition-colors">{stats.totalCollections}</p>
              <p className="text-gray-500 text-sm mt-1">Total Funds Created</p>
            </div>

            {/* Total Amount Raised */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer group">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="text-white text-xl font-bold">₦</span>
                </div>
                <span className="bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
                  Verified
                </span>
              </div>
              <p className="text-3xl font-bold text-gray-900 group-hover:text-green-600 transition-colors">₦{stats.totalCollected.toLocaleString()}</p>
              <p className="text-gray-500 text-sm mt-1">Total Amount Raised</p>
            </div>

            {/* Total Contributors */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer group">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full">
                  Students
                </span>
              </div>
              <p className="text-3xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{stats.totalContributors}</p>
              <p className="text-gray-500 text-sm mt-1">Total Contributors</p>
            </div>

            {/* Active Funds */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer group">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <span className="bg-orange-100 text-orange-700 text-xs font-semibold px-3 py-1 rounded-full">
                  Active
                </span>
              </div>
              <p className="text-3xl font-bold text-gray-900 group-hover:text-orange-600 transition-colors">{stats.activeCollections}</p>
              <p className="text-gray-500 text-sm mt-1">Active Funds</p>
            </div>
          </div>

          {/* Recent Collections */}
          {collections.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Recent Collections</h2>
              {collections.slice(0, 3).map((collection) => (
                <div key={collection.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                  <h3 className="font-semibold text-gray-900 mb-2">{collection.title}</h3>
                  <div className="flex items-center gap-2">
                    <span className="bg-blue-100 text-blue-700 text-xs font-medium px-3 py-1 rounded-full">
                      {collection.type}
                    </span>
                    {collection.status === 'active' && (
                      <span className="bg-green-100 text-green-700 text-xs font-medium px-3 py-1 rounded-full">
                        Active
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const CreateCollectionPage = () => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [collectionType, setCollectionType] = useState<'fixed' | 'flexible'>('fixed');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [deadline, setDeadline] = useState('');
  const [allowAnonymous, setAllowAnonymous] = useState(true);
  const [showProgress, setShowProgress] = useState(true);
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [showShareModal, setShowShareModal] = useState(false);
  const [createdSlug, setCreatedSlug] = useState('');

  const addCustomField = () => {
    setCustomFields([...customFields, { id: uuidv4(), label: '', type: 'text', required: true }]);
  };

  const updateField = (id: string, updates: Partial<CustomField>) => {
    setCustomFields(customFields.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const removeField = (id: string) => {
    setCustomFields(customFields.filter(f => f.id !== id));
  };

  const handleCreate = () => {
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const newCollection: Collection = {
      id: uuidv4(),
      title,
      description,
      amount: parseFloat(amount) || 0,
      type: collectionType,
      targetAmount: targetAmount ? parseFloat(targetAmount) : undefined,
      deadline,
      allowAnonymous,
      showProgress,
      customFields,
      participants: 0,
      collected: 0,
      status: 'active',
      createdAt: new Date().toISOString(),
      shareLink: `${window.location.origin}/contribute/${slug}`,
      slug,
      hostId: user!.id
    };
    saveCollection(newCollection);
    setCreatedSlug(slug);
    setShowShareModal(true);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/contribute/${createdSlug}`);
  };

  const shareViaWhatsApp = () => {
    const text = `Please contribute to: ${title}\n${window.location.origin}/contribute/${createdSlug}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const shareViaEmail = () => {
    const subject = `Contribution Request: ${title}`;
    const body = `Please contribute here: ${window.location.origin}/contribute/${createdSlug}`;
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-8">Create Collection</h1>

        {/* Progress */}
        <div className="flex items-center gap-4 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                step >= s ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                {s}
              </div>
              {s < 3 && <div className={`w-16 h-1 ${step > s ? 'bg-emerald-500' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        {/* Step 1: Type */}
        {step === 1 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Choose Collection Type</h2>
            <div className="space-y-4">
              <button
                onClick={() => setCollectionType('fixed')}
                className={`w-full p-6 rounded-xl border-2 text-left transition-all ${
                  collectionType === 'fixed' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    collectionType === 'fixed' ? 'bg-emerald-500' : 'bg-gray-100'
                  }`}>
                    <Lock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Fixed Amount</h3>
                    <p className="text-gray-600 text-sm">Everyone pays the same amount</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setCollectionType('flexible')}
                className={`w-full p-6 rounded-xl border-2 text-left transition-all ${
                  collectionType === 'flexible' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    collectionType === 'flexible' ? 'bg-emerald-500' : 'bg-gray-100'
                  }`}>
                    <Wallet className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Flexible Amount</h3>
                    <p className="text-gray-600 text-sm">Contributors choose how much to pay</p>
                  </div>
                </div>
              </button>
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full mt-6 py-3 bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-xl font-semibold"
            >
              Continue
            </button>
          </div>
        )}

        {/* Step 2: Details */}
        {step === 2 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Collection Details</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                placeholder="e.g., Class Handout Fee"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                placeholder="What is this collection for?"
                rows={3}
              />
            </div>

            {collectionType === 'fixed' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₦)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  placeholder="5000"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Amount (Optional)</label>
                <input
                  type="number"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  placeholder="100000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deadline (Optional)</label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={allowAnonymous}
                  onChange={(e) => setAllowAnonymous(e.target.checked)}
                  className="w-5 h-5 text-emerald-500 rounded"
                />
                <span className="text-gray-700">Allow anonymous contributions</span>
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={showProgress}
                  onChange={(e) => setShowProgress(e.target.checked)}
                  className="w-5 h-5 text-emerald-500 rounded"
                />
                <span className="text-gray-700">Show progress to contributors</span>
              </label>
            </div>

            {/* Custom Fields Section */}
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Custom Fields</h3>
                <button
                  onClick={addCustomField}
                  className="flex items-center gap-2 text-emerald-600 font-medium text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Add Field
                </button>
              </div>
              <p className="text-sm text-gray-600 mb-4">Ask contributors for additional information</p>

              <div className="space-y-4">
                {customFields.map((field) => (
                  <div key={field.id} className="bg-gray-50 rounded-xl p-4">
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <input
                        type="text"
                        value={field.label}
                        onChange={(e) => updateField(field.id, { label: e.target.value })}
                        placeholder="Field label (e.g., Student ID)"
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                      <select
                        value={field.type}
                        onChange={(e) => updateField(field.id, { type: e.target.value as CustomField['type'] })}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      >
                        <option value="text">Text</option>
                        <option value="email">Email</option>
                        <option value="tel">Phone</option>
                        <option value="number">Number</option>
                      </select>
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={field.required}
                          onChange={(e) => updateField(field.id, { required: e.target.checked })}
                          className="rounded"
                        />
                        Required field
                      </label>
                      <button
                        onClick={() => removeField(field.id)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!title}
                className="flex-1 py-3 bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-xl font-semibold disabled:opacity-50"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Review */}
        {step === 3 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Review & Create</h2>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Type</span>
                <span className="font-medium capitalize">{collectionType}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Title</span>
                <span className="font-medium">{title}</span>
              </div>
              {collectionType === 'fixed' && (
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Amount</span>
                  <span className="font-medium">₦{parseFloat(amount).toLocaleString()}</span>
                </div>
              )}
              {customFields.length > 0 && (
                <div className="py-2 border-b border-gray-100">
                  <span className="text-gray-600 block mb-2">Custom Fields</span>
                  <div className="flex flex-wrap gap-2">
                    {customFields.map(f => (
                      <span key={f.id} className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm">
                        {f.label} {f.required && '*'}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-emerald-50 rounded-xl p-4 mb-6">
              <p className="text-emerald-700 text-sm flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                No charges applied - You keep 100% of contributions
              </p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setStep(2)}
                className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold"
              >
                Back
              </button>
              <button
                onClick={handleCreate}
                className="flex-1 py-3 bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-xl font-semibold"
              >
                Create Collection
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-emerald-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Collection Created!</h3>
              <p className="text-gray-600">Share this link with contributors</p>
            </div>

            <div className="bg-gray-100 rounded-xl p-4 mb-4 flex items-center gap-2">
              <input
                type="text"
                value={`${window.location.origin}/contribute/${createdSlug}`}
                readOnly
                className="flex-1 bg-transparent text-sm truncate"
              />
              <button onClick={copyLink} className="p-2 hover:bg-gray-200 rounded-lg">
                <Copy className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-6">
              <button onClick={shareViaWhatsApp} className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-50">
                <MessageCircle className="w-8 h-8 text-green-500" />
                <span className="text-xs">WhatsApp</span>
              </button>
              <button onClick={shareViaEmail} className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-50">
                <Mail className="w-8 h-8 text-red-500" />
                <span className="text-xs">Email</span>
              </button>
              <button className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-50">
                <Share2 className="w-8 h-8 text-blue-500" />
                <span className="text-xs">More</span>
              </button>
            </div>

            <Link
              to="/dashboard"
              className="block w-full py-3 bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-xl font-semibold text-center"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

const CollectionsPage = () => {
  const { user } = useAuth();
  const collections = getCollections(user?.id);

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">My Collections</h1>
          <Link
            to="/dashboard/create-collection"
            className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-700 text-white px-4 py-2 rounded-xl font-semibold"
          >
            <PlusCircle className="w-5 h-5" />
            New
          </Link>
        </div>

        {collections.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl">
            <Wallet className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No collections yet</h3>
            <p className="text-gray-600 mb-4">Create your first payment collection</p>
            <Link
              to="/dashboard/create-collection"
              className="inline-flex items-center gap-2 text-emerald-600 font-semibold"
            >
              Create Collection <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {collections.map((collection) => (
              <div key={collection.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover-lift">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">{collection.title}</h3>
                    <p className="text-gray-600 text-sm mb-3">{collection.description}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-gray-500">
                        {collection.participants} contributors
                      </span>
                      <span className="text-emerald-600 font-medium">
                        ₦{collection.collected.toLocaleString()} collected
                      </span>
                    </div>
                    {collection.customFields.length > 0 && (
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-gray-500">Custom fields:</span>
                        {collection.customFields.map(f => (
                          <span key={f.id} className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                            {f.label}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => navigator.clipboard.writeText(collection.shareLink)}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                      title="Copy link"
                    >
                      <Copy className="w-5 h-5 text-gray-400" />
                    </button>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      collection.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {collection.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Public Contribution Page
const ContributePage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [collection, setCollection] = useState<Collection | null>(null);
  const [amount, setAmount] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    isAnonymous: false,
    custom: {} as Record<string, string>
  });

  useEffect(() => {
    const all = JSON.parse(localStorage.getItem('easycollect_collections') || '[]');
    const found = all.find((c: Collection) => c.slug === slug);
    if (found) {
      setCollection(found);
      if (found.type === 'fixed') {
        setAmount(found.amount.toString());
      }
    }
  }, [slug]);

  const handleCustomFieldChange = (fieldId: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      custom: { ...prev.custom, [fieldId]: value }
    }));
  };

  const handleProceedToPayment = () => {
    const paymentData = {
      amount: parseFloat(amount),
      ...formData,
      collectionId: collection?.id
    };
    localStorage.setItem('easycollect_pending_payment', JSON.stringify(paymentData));
    navigate('/checkout');
  };

  if (!collection) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900">Collection not found</h2>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-fixed bg-no-repeat"
      style={{ 
        backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.7)), url('https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=1200&q=80')` 
      }}
    >
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-md text-white p-4 border-b border-white/10">
        <div className="max-w-md mx-auto flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
            <Wallet className="w-5 h-5" />
          </div>
          <span className="font-bold text-lg">EasyCollect</span>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4">
        {/* Collection Info */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl mb-4">
          <h1 className="text-xl font-bold text-gray-900 mb-2">{collection.title}</h1>
          <p className="text-gray-600 mb-4">{collection.description}</p>
          {collection.type === 'fixed' ? (
            <div className="text-center py-4 bg-emerald-50 rounded-xl">
              <span className="text-gray-600">Amount to pay</span>
              <p className="text-3xl font-bold text-emerald-600">₦{collection.amount.toLocaleString()}</p>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Enter Amount (₦)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-2xl font-bold"
                placeholder="0.00"
              />
            </div>
          )}
        </div>

        {/* Contribution Form */}
        {collection.type === 'fixed' && (
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Details</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  placeholder="08012345678"
                />
              </div>

              {/* Custom Fields */}
              {collection.customFields.map((field) => (
                <div key={field.id}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {field.label} {field.required && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type={field.type}
                    value={formData.custom[field.id] || ''}
                    onChange={(e) => handleCustomFieldChange(field.id, e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    placeholder={`Enter ${field.label.toLowerCase()}`}
                    required={field.required}
                  />
                </div>
              ))}

              {collection.allowAnonymous && (
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={formData.isAnonymous}
                    onChange={(e) => setFormData({ ...formData, isAnonymous: e.target.checked })}
                    className="w-5 h-5 text-emerald-500 rounded"
                  />
                  <span className="text-gray-700">Contribute anonymously</span>
                </label>
              )}
            </div>

            <button
              onClick={handleProceedToPayment}
              disabled={!formData.name || !formData.email || !formData.phone}
              className="w-full mt-6 py-3 bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-xl font-semibold disabled:opacity-50"
            >
              Proceed to Payment
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Checkout Page
const CheckoutPage = () => {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'transfer'>('wallet');

  const contribution = JSON.parse(localStorage.getItem('easycollect_current_contribution') || '{}');
  const amount = contribution.amount || 3000;

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    script.onload = () => setScriptLoaded(true);
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handlePay = () => {
    if (paymentMethod === 'transfer') {
      navigate('/payment/bank-transfer');
      return;
    }

    if (!window.PaystackPop) {
      alert('Payment system loading... Please try again.');
      return;
    }

    setIsProcessing(true);
    const reference = 'EC_' + Date.now();
    
    localStorage.setItem('easycollect_payment_reference', reference);
    localStorage.setItem('easycollect_payment_amount', amount.toString());

    const handler = window.PaystackPop.setup({
      key: 'pk_test_9721481771baa92fa5c2c78e1c94f2b61ecdd38b',
      email: contribution.email || 'contributor@example.com',
      amount: amount * 100,
      ref: reference,
      currency: 'NGN',
      channels: ['card', 'bank', 'ussd', 'qr', 'mobile_money'],
      callback: (response: { reference: string }) => {
        setIsProcessing(false);
        localStorage.setItem('easycollect_payment_verified', 'true');
        localStorage.setItem('easycollect_payment_ref', response.reference);
        navigate('/payment/success');
      },
      onClose: () => {
        setIsProcessing(false);
      },
    });

    handler.openIframe();
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Green Header */}
      <div className="bg-green-600 text-white p-4">
        <div className="max-w-md mx-auto flex items-center justify-center">
          <span className="font-semibold text-lg">Deposit</span>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Checkout</h2>
        
        {/* Amount Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-4">
          <div className="text-center">
            <div className="inline-block bg-green-600 text-white px-4 py-1 rounded-full text-sm font-medium mb-3">
              EasyCollect
            </div>
            <p className="text-gray-500 text-sm mb-1">Payment Collection</p>
            <p className="text-4xl font-bold text-green-600">₦{amount.toLocaleString()}.00</p>
          </div>
        </div>

        {/* Payment Method */}
        <div className="mb-4">
          <p className="font-medium text-gray-900 mb-3">Payment Method</p>
          
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {/* Wallet Option */}
            <button
              onClick={() => setPaymentMethod('wallet')}
              className={`w-full p-4 flex items-center justify-between border-b border-gray-100 ${
                paymentMethod === 'wallet' ? 'bg-green-50' : ''
              }`}
            >
              <span className="font-medium text-gray-900">EasyCollect Wallet</span>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                paymentMethod === 'wallet' ? 'border-purple-600' : 'border-gray-300'
              }`}>
                {paymentMethod === 'wallet' && <div className="w-3 h-3 bg-green-600 rounded-full" />}
              </div>
            </button>

            {/* Bank Transfer Option */}
            <button
              onClick={() => setPaymentMethod('transfer')}
              className={`w-full p-4 flex items-center justify-between ${
                paymentMethod === 'transfer' ? 'bg-green-50' : ''
              }`}
            >
              <span className="font-medium text-gray-900">Bank Transfer</span>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                paymentMethod === 'transfer' ? 'border-purple-600' : 'border-gray-300'
              }`}>
                {paymentMethod === 'transfer' && <div className="w-3 h-3 bg-green-600 rounded-full" />}
              </div>
            </button>
          </div>
        </div>

        {/* Pay Button */}
        <button
          onClick={handlePay}
          disabled={isProcessing || !scriptLoaded}
          className="w-full py-4 bg-green-600 text-white rounded-xl font-semibold text-lg disabled:opacity-50"
        >
          {isProcessing ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : 'Pay Now'}
        </button>
      </div>
    </div>
  );
};

// Bank Transfer Page - Shows host bank details
const BankTransferPage = () => {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState({ hours: 1, minutes: 1, seconds: 10 });
  const [copied, setCopied] = useState(false);

  // Get host's bank details from localStorage
  const currentUser = JSON.parse(localStorage.getItem('easycollect_current_user') || '{}');
  const bankDetails = currentUser.bankDetails || {
    bankName: 'Palmpay',
    accountNumber: '8718888028',
    accountName: 'EasyCollect User'
  };

  const contribution = JSON.parse(localStorage.getItem('easycollect_current_contribution') || '{}');
  const amount = contribution.amount || 3000;

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const copyAccountNumber = () => {
    navigator.clipboard.writeText(bankDetails.accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTime = (val: number) => val.toString().padStart(2, '0');

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Green Header */}
      <div className="bg-green-600 text-white p-4">
        <div className="max-w-md mx-auto flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <span className="font-semibold text-lg">Pay with Bank Transfer</span>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4">
        {/* Amount */}
        <div className="text-center mb-6">
          <p className="text-gray-500 text-sm mb-1">Payment Collection</p>
          <p className="text-4xl font-bold text-gray-900">₦{amount.toLocaleString()}.00</p>
        </div>

        {/* Bank Details Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-4">
          <p className="text-gray-900 font-medium mb-4">Transfer to the following account</p>
          
          {/* Bank Name */}
          <div className="mb-4">
            <p className="text-gray-500 text-sm mb-1">Bank Name</p>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs">P</span>
              </div>
              <span className="font-semibold text-gray-900">{bankDetails.bankName}</span>
            </div>
          </div>

          {/* Account Number */}
          <div className="mb-4">
            <p className="text-gray-500 text-sm mb-1">Account Number (Only for this transaction)</p>
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold text-green-600 tracking-wider">
                {bankDetails.accountNumber.match(/.{1,3}/g)?.join(' ')}
              </span>
              <button
                onClick={copyAccountNumber}
                className="px-4 py-2 border border-gray-300 rounded-full text-sm font-medium text-gray-700"
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          {/* Account Name */}
          <div>
            <p className="text-gray-500 text-sm mb-1">Account Name</p>
            <span className="font-semibold text-gray-900">{bankDetails.accountName}</span>
          </div>
        </div>

        {/* Countdown */}
        <div className="text-center mb-4">
          <span className="text-gray-500">Order Expires in </span>
          <span className="text-green-600 font-bold">
            {formatTime(timeLeft.hours)}:{formatTime(timeLeft.minutes)}:{formatTime(timeLeft.seconds)}
          </span>
        </div>

        {/* Copy Button */}
        <button
          onClick={copyAccountNumber}
          className="w-full py-4 bg-green-600 text-white rounded-xl font-semibold text-lg mb-4"
        >
          Copy Account Number
        </button>

        {/* Help Link */}
        <button className="w-full flex items-center justify-center gap-2 text-gray-500 text-sm">
          <AlertCircle className="w-4 h-4" />
          How to use Bank Transfer
        </button>
      </div>
    </div>
  );
};

// Payment Success Page
const PaymentSuccessPage = () => {
  const navigate = useNavigate();

  const paymentRef = localStorage.getItem('easycollect_payment_ref') || 'EC_' + Date.now();
  const amount = localStorage.getItem('easycollect_payment_amount') || '3000';
  const date = new Date().toLocaleString('en-NG', { 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-green-600 text-white p-4">
        <div className="max-w-md mx-auto flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <span className="font-semibold text-lg">Deposit</span>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4">
        {/* Success Header */}
        <div className="text-center py-6">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-600 font-medium">Successful</p>
          <p className="text-4xl font-bold text-gray-900 mt-2">₦ {parseInt(amount).toLocaleString()}.00</p>
        </div>

        {/* Transaction Details */}
        <div className="space-y-4 mb-6">
          <div className="flex justify-between py-3 border-b border-gray-100">
            <span className="text-gray-500">Merchant</span>
            <span className="font-medium text-gray-900">EasyCollect</span>
          </div>
          <div className="flex justify-between py-3 border-b border-gray-100">
            <span className="text-gray-500">Collection</span>
            <span className="font-medium text-gray-900">Class Payment</span>
          </div>
          <div className="flex justify-between py-3 border-b border-gray-100">
            <span className="text-gray-500">Order Amount</span>
            <span className="font-medium text-gray-900">₦ {parseInt(amount).toLocaleString()}.00</span>
          </div>
          <div className="flex justify-between py-3 border-b border-gray-100">
            <span className="text-gray-500">Payment Method</span>
            <span className="font-medium text-gray-900">Bank Transfer</span>
          </div>
          <div className="flex justify-between py-3 border-b border-gray-100">
            <span className="text-gray-500">Merchant Order No.</span>
            <span className="font-medium text-gray-900 text-right">{paymentRef}</span>
          </div>
          <div className="flex justify-between py-3 border-b border-gray-100">
            <span className="text-gray-500">Transaction Order No.</span>
            <span className="font-medium text-gray-900 text-right">2426{Date.now().toString().slice(-16)}</span>
          </div>
          <div className="flex justify-between py-3 border-b border-gray-100">
            <span className="text-gray-500">Completion Time</span>
            <span className="font-medium text-gray-900">{date}</span>
          </div>
        </div>

        {/* Complete Button */}
        <button
          onClick={() => navigate('/')}
          className="w-full py-4 bg-green-600 text-white rounded-xl font-semibold text-lg"
        >
          Complete
        </button>
      </div>
    </div>
  );
};

// Main App
function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      
      {/* Public Contribution Routes - No auth required */}
      <Route path="/contribute/:slug" element={<ContributePage />} />
      <Route path="/checkout" element={<CheckoutPage />} />
      <Route path="/payment/bank-transfer" element={<BankTransferPage />} />
      <Route path="/payment/success" element={<PaymentSuccessPage />} />

      {/* Protected Dashboard Routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <DashboardLayout>
            <DashboardPage />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/dashboard/create-collection" element={
        <ProtectedRoute>
          <DashboardLayout>
            <CreateCollectionPage />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/dashboard/collections" element={
        <ProtectedRoute>
          <DashboardLayout>
            <CollectionsPage />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/dashboard/contributors" element={
        <ProtectedRoute>
          <DashboardLayout>
            <div className="p-8 text-center text-gray-500">Contributors management coming soon</div>
          </DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/dashboard/settings" element={
        <ProtectedRoute>
          <DashboardSettings />
        </ProtectedRoute>
      } />
    </Routes>
  );
}

export default App;
