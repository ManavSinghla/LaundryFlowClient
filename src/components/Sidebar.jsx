import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  FiHome, 
  FiPlusCircle, 
  FiList, 
  FiUsers, 
  FiLogOut,
  FiMoon,
  FiSun,
  FiTag
} from 'react-icons/fi';

const Sidebar = () => {
  const { logout, user } = useAuth();
  const location = useLocation();
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('theme') === 'dark') {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    if (darkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
    setDarkMode(!darkMode);
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: FiHome },
    { name: 'New Order', path: '/orders/new', icon: FiPlusCircle },
    { name: 'Orders List', path: '/orders', icon: FiList },
    { name: 'Customers', path: '/customers', icon: FiUsers },
    { name: 'Services', path: '/services', icon: FiTag },
  ];

  return (
    <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-screen flex flex-col">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-2xl font-bold text-primary-600 dark:text-primary-500">
          LaundryFlow
        </h1>
        <p className="text-sm text-gray-500 mt-1 dark:text-gray-400">
          {user?.shopName || 'Shop Management'}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-3">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center px-3 py-2.5 rounded-lg font-medium transition-colors ${
                  isActive 
                  ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400' 
                  : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700/50'
                }`}
              >
                <Icon className={`mr-3 flex-shrink-0 h-5 w-5 ${isActive ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
        <button
          onClick={toggleTheme}
          className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 rounded-lg outline-none hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
        >
          {darkMode ? <FiSun className="mr-3 h-5 w-5 text-yellow-500" /> : <FiMoon className="mr-3 h-5 w-5 text-indigo-500" />}
          {darkMode ? 'Light Mode' : 'Dark Mode'}
        </button>
        <button
          onClick={logout}
          className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 rounded-lg outline-none hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30 transition-colors"
        >
          <FiLogOut className="mr-3 h-5 w-5 text-gray-400 group-hover:text-red-500" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
