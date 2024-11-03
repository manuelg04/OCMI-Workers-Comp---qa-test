import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, LogOut, User } from 'lucide-react';
import { useStorage } from '../hooks';
import { apiUrl } from '../lib';

const Layout = () => {
  const storage = useStorage();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      const session = storage.get('session');
      if (session) {
        const { token } = JSON.parse(session);
        await fetch(apiUrl('/auth/logout'), {
          method: 'POST',
          headers: {
            Authorization: token,
            'Content-Type': 'application/json',
          },
        });
      }
    } finally {
      storage.remove('session');
      navigate('/login');
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex space-x-8">
              <Link
                to="/posts"
                className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                  isActive('/posts')
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 mr-2" />
                Posts
              </Link>
              <Link
                to="/profile"
                className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                  isActive('/profile')
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <User className="w-4 h-4 mr-2" />
                Profile
              </Link>
            </div>
            <button
              onClick={handleLogout}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
