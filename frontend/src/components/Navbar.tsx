import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/authContext';
import { useLanguage } from '../hooks/useLanguage';

export function Navbar() {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useContext(AuthContext);
  const { t } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);

  const displayName = user?.name || user?.email || 'User';

  return (
    <header className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 h-16 flex items-center justify-between">
      <Link to="/" className="text-white font-semibold text-xl">Deep Research</Link>

      <nav className="flex items-center space-x-6">
        <Link to="/" className="text-white hover:text-blue-100 transition-colors">
          {t.home}
        </Link>

        {isAuthenticated ? (
          <div
            className="relative inline-flex flex-col items-start pb-3 -mb-3"
            onMouseEnter={() => setMenuOpen(true)}
            onMouseLeave={() => setMenuOpen(false)}
          >
            <button
              type="button"
              className="text-white hover:text-blue-100 transition-colors"
              onFocus={() => setMenuOpen(true)}
              onBlur={() => {
                window.setTimeout(() => setMenuOpen(false), 120);
              }}
            >
              {displayName}
            </button>

            {menuOpen ? (
              <div className="absolute right-0 top-full pt-2 min-w-max z-50">
                <div className="rounded-lg bg-white shadow-lg border border-gray-200 py-2">
                <Link
                  to="/user-center"
                  className="block whitespace-nowrap px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 text-right"
                >
                  {t.userCenter}
                </Link>
                <Link
                  to="/preferences"
                  className="block whitespace-nowrap px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 text-right"
                >
                  {t.preferences}
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    logout();
                    navigate('/');
                  }}
                  className="block w-full whitespace-nowrap text-right px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  {t.logout}
                </button>
                </div>
              </div>
            ) : null}
          </div>
        ) : (
          <Link to="/login" className="text-white hover:text-blue-100 transition-colors">
            {t.login}
          </Link>
        )}
      </nav>
    </header>
  );
}
