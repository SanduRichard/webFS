import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { 
  LayoutDashboard, 
  PlusCircle, 
  LogOut, 
  User,
  MessageSquare
} from 'lucide-react';

const Navbar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/create-activity', label: 'Activitate Nouă', icon: PlusCircle }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center gap-2">
              <MessageSquare className="h-8 w-8 text-primary-600" />
              <span className="text-xl font-bold text-gray-800">Feedback App</span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    isActive(item.path)
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-gray-700">
              <User size={20} />
              <span className="hidden sm:inline">{user?.fullName}</span>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut size={20} />
              <span className="hidden sm:inline">Deconectare</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t border-gray-200">
        <div className="flex justify-around py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg ${
                  isActive(item.path)
                    ? 'text-primary-600'
                    : 'text-gray-600'
                }`}
              >
                <Icon size={24} />
                <span className="text-xs">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
