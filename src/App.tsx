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
  Banknote,
  TrendingUp,
  MoreHorizontal,
  Download,
  AlertCircle,
  Loader2,
  Trash2,
  Plus,
  Eye,
  EyeOff,
  Lock
} from 'lucide-react';

// Types
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <img src="/images/nigerian-campus.jpg" alt="Campus" className="w-full h-full object-cover" />
      </div>
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl w-full max-w-md p-8 relative z-10">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Wallet className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
          <p className="text-gray-600">Sign in to manage your student collections</p>
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
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
          >
            Sign In
          </button>
        </form>

        <p className="text-center mt-6 text-gray-600">
          Don't have an account?{' '}
          <Link to="/register" className="text-purple-600 font-semibold hover:underline">
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
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (register(name, email, password)) {
      navigate('/dashboard');
    } else {
      setError('Email already registered');
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 mx-auto mb-4">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-12 h-12 text-gray-800">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
          <p className="text-gray-500 text-sm">Start creating payment collection links</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4 flex items-center gap-2 text-sm">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-base text-gray-900 mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-400 rounded text-gray-700 focus:outline-none focus:border-gray-600"
              placeholder="John Doe"
              required
            />
          </div>

          <div>
            <label className="block text-base text-gray-900 mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-400 rounded text-gray-700 focus:outline-none focus:border-gray-600"
              placeholder="host@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-base text-gray-900 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-400 rounded text-gray-700 focus:outline-none focus:border-gray-600 pr-10"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {showPassword ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  )}
                  {!showPassword && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />}
                </svg>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-base text-gray-900 mb-1">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-400 rounded text-gray-700 focus:outline-none focus:border-gray-600"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded font-medium transition-colors border border-gray-300"
          >
            Create Account
          </button>
        </form>

        <p className="text-center mt-6 text-gray-900">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 hover:underline">
            Sign In
          </Link>
        </p>
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
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
            <Wallet className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl text-purple-700">EasyCollect</span>
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
                    ? 'bg-emerald-50 text-emerald-700'
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
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl flex items-center justify-center">
                <Wallet className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-purple-700">EasyCollect</span>
            </Link>
          </div>

          <nav className="flex-1 px-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  location.pathname === item.path
                    ? 'bg-emerald-50 text-emerald-700'
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
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center">
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
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl flex items-center justify-center">
                <Wallet className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-purple-700">EasyCollect</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-gray-600 hover:text-gray-900 font-medium">
                Sign In
              </Link>
              <Link
                to="/register"
                className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:shadow-lg transition-all"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative py-20 lg:py-32 overflow-hidden bg-easycollect-pattern">
        <div className="absolute inset-0 opacity-10">
          <img src="/images/hero-students.jpg" alt="Students" className="w-full h-full object-cover" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6 animate-fadeInUp">
              Collect Money for <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500">Class Handouts & Dues</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 animate-fadeInUp delay-100">
              The easiest way for Nigerian students to collect money for handouts, course dues, parties, and projects. No stress, zero fees.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fadeInUp delay-200">
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-purple-800 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-xl transition-all hover:-translate-y-0.5"
              >
                Get Started Free
                <ChevronRight className="w-5 h-5" />
              </Link>
              <Link
                to="/contribute/demo"
                className="inline-flex items-center justify-center gap-2 bg-white text-gray-700 border-2 border-gray-200 px-8 py-4 rounded-xl font-semibold hover:border-purple-500 hover:text-purple-600 transition-all"
              >
                See How It Works
              </Link>
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
                <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
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
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500/20 to-orange-500/20 rounded-3xl blur-3xl"></div>
              <img 
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&auto=format&fit=crop&q=80" 
                alt="Student using phone" 
                className="relative rounded-3xl shadow-2xl w-full object-cover h-[500px]"
              />
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-gradient-to-br from-pink-400 to-orange-400 rounded-full opacity-60 blur-2xl"></div>
              <div className="absolute -top-6 -left-6 w-24 h-24 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full opacity-60 blur-2xl"></div>
            </div>
            
            {/* Content */}
            <div className="lg:pl-8">
              <h2 className="text-4xl lg:text-5xl font-bold mb-6 bg-gradient-to-r from-pink-400 to-orange-400 bg-clip-text text-transparent">
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
                    <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="font-bold text-white">{item.step}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-xl mb-1">{item.title}</h3>
                      <p className="text-gray-400">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-10 p-4 bg-pink-500/10 border border-pink-500/20 rounded-xl">
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
    <div className="p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Collections', value: stats.totalCollections, icon: Wallet },
            { label: 'Total Collected', value: `₦${stats.totalCollected.toLocaleString()}`, icon: Banknote },
            { label: 'Contributors', value: stats.totalContributors, icon: Users },
            { label: 'Active', value: stats.activeCollections, icon: TrendingUp }
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover-lift">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-gray-600">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-8 text-white mb-8">
          <h2 className="text-2xl font-bold mb-4">Create a New Collection</h2>
          <p className="mb-6 opacity-90">Start collecting payments with custom fields in minutes</p>
          <Link
            to="/dashboard/create-collection"
            className="inline-flex items-center gap-2 bg-white text-emerald-600 px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
          >
            <PlusCircle className="w-5 h-5" />
            Create Collection
          </Link>
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
              className="w-full mt-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold"
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
                className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold disabled:opacity-50"
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
                      <span key={f.id} className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-sm">
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
                className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold"
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
              className="block w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold text-center"
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
            className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-4 py-2 rounded-xl font-semibold"
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
              className="w-full mt-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold disabled:opacity-50"
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
  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'bank'>('bank');
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePay = () => {
    setIsProcessing(true);
    setTimeout(() => {
      navigate('/payment/bank-transfer');
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-4">
        <div className="max-w-md mx-auto flex items-center gap-3">
          <button onClick={() => navigate(-1)}>
            <ArrowLeft className="w-6 h-6" />
          </button>
          <span className="font-bold text-lg">Checkout</span>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4">
        <div className="bg-white rounded-2xl shadow-sm">
          <div className="p-6 text-center border-b border-gray-100">
            <div className="w-20 h-12 bg-purple-600 rounded-lg mx-auto mb-4 flex items-center justify-center">
              <span className="text-white font-bold text-sm">EasyCollect</span>
            </div>
            <p className="text-gray-500 text-sm">Payment Collection</p>
            <p className="text-3xl font-bold text-purple-600 mt-2">₦3,000.00</p>
          </div>

          <div className="p-6">
            <p className="font-medium text-gray-900 mb-4">Payment Method</p>
            
            <div className="space-y-3">
              <button
                onClick={() => setPaymentMethod('wallet')}
                className={`w-full p-4 rounded-xl border-2 flex items-center justify-between ${
                  paymentMethod === 'wallet' ? 'border-purple-500 bg-purple-50' : 'border-gray-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Wallet className="w-5 h-5 text-purple-600" />
                  </div>
                  <span className="font-medium">Wallet Payment</span>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  paymentMethod === 'wallet' ? 'border-purple-500' : 'border-gray-300'
                }`}>
                  {paymentMethod === 'wallet' && <div className="w-3 h-3 bg-purple-500 rounded-full" />}
                </div>
              </button>

              <button
                onClick={() => setPaymentMethod('bank')}
                className={`w-full p-4 rounded-xl border-2 flex items-center justify-between ${
                  paymentMethod === 'bank' ? 'border-purple-500 bg-purple-50' : 'border-gray-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Banknote className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="font-medium">Bank Transfer</span>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Recommended</span>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  paymentMethod === 'bank' ? 'border-purple-500' : 'border-gray-300'
                }`}>
                  {paymentMethod === 'bank' && <div className="w-3 h-3 bg-purple-500 rounded-full" />}
                </div>
              </button>
            </div>

            <button
              onClick={handlePay}
              disabled={isProcessing}
              className="w-full mt-6 py-4 bg-purple-600 text-white rounded-xl font-semibold text-lg"
            >
              {isProcessing ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : 'Pay Now'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Bank Transfer Page
const BankTransferPage = () => {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(3600);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0) return 0;
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const copyAccount = () => {
    navigator.clipboard.writeText('8718888028');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVerify = () => {
    setIsVerifying(true);
    setTimeout(() => {
      navigate('/payment/success');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-4">
        <div className="max-w-md mx-auto flex items-center gap-3">
          <button onClick={() => navigate(-1)}>
            <ArrowLeft className="w-6 h-6" />
          </button>
          <span className="font-bold text-lg">Pay with Bank Transfer</span>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4">
        <div className="text-center mb-6">
          <p className="text-gray-500 text-sm">Payment Collection</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">₦3,000.00</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6">
          <p className="font-medium text-gray-900 mb-4">Transfer to the following account</p>

          <div className="space-y-4">
            <div>
              <p className="text-gray-500 text-sm mb-1">Bank Name</p>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">W</span>
                </div>
                <span className="font-semibold text-lg">Wema Bank</span>
              </div>
            </div>

            <div>
              <p className="text-gray-500 text-sm mb-1">Account Number (Only for this transaction)</p>
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-purple-600 tracking-wider">871 8888 028</span>
                <button
                  onClick={copyAccount}
                  className="px-4 py-2 border-2 border-purple-600 text-purple-600 rounded-lg font-medium text-sm"
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            <div>
              <p className="text-gray-500 text-sm mb-1">Account Name</p>
              <p className="font-semibold text-lg">EasyCollect Payment</p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-xl text-center">
            <p className="text-gray-600 text-sm">Order Expires in</p>
            <p className="text-2xl font-bold text-purple-600">{formatTime(timeLeft)}</p>
          </div>

          <button
            onClick={copyAccount}
            className="w-full mt-4 py-4 bg-purple-600 text-white rounded-xl font-semibold text-lg"
          >
            Copy Account Number
          </button>

          <button
            onClick={handleVerify}
            disabled={isVerifying}
            className="w-full mt-3 py-4 bg-emerald-500 text-white rounded-xl font-semibold text-lg"
          >
            {isVerifying ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : "I've Completed the Transfer"}
          </button>
        </div>
      </div>
    </div>
  );
};

// Payment Success Page
const PaymentSuccessPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-4">
        <div className="max-w-md mx-auto text-center">
          <span className="font-bold text-lg">Payment Receipt</span>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="p-8 text-center border-b border-gray-100">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-emerald-500" />
            </div>
            <p className="text-gray-600">Successful Transaction</p>
            <p className="text-3xl font-bold text-emerald-600 mt-2">₦3,000.00</p>
            <p className="text-gray-500 text-sm mt-1">Apr 10, 2026 10:11 AM</p>
          </div>

          <div className="p-6 space-y-4">
            {[
              { label: 'Merchant', value: 'EasyCollect' },
              { label: 'Collection', value: 'Class Handout' },
              { label: 'Amount', value: '₦3,000.00' },
              { label: 'Payment Method', value: 'Bank Transfer' },
              { label: 'Transaction ID', value: '0332oux96105' },
              { label: 'Reference', value: 'P204253047344028467' },
            ].map((item, i) => (
              <div key={i} className="flex justify-between py-2">
                <span className="text-gray-500">{item.label}</span>
                <span className="font-medium text-gray-900">{item.value}</span>
              </div>
            ))}
          </div>

          <div className="p-4 bg-gray-50 border-t border-gray-100">
            <div className="flex gap-4">
              <button className="flex-1 flex items-center justify-center gap-2 py-3 text-purple-600 font-medium">
                <Share2 className="w-5 h-5" />
                Share
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 py-3 text-purple-600 font-medium">
                <Download className="w-5 h-5" />
                Download
              </button>
            </div>
          </div>
        </div>

        <button
          onClick={() => navigate('/')}
          className="w-full mt-6 py-4 bg-purple-600 text-white rounded-xl font-semibold text-lg"
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
    </Routes>
  );
}

export default App;
