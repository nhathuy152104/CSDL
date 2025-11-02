import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Briefcase, Moon, Sun, ChevronDown } from 'lucide-react';

const Navbar = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');         // ✅ thêm email để hiển thị & click
  const [userRole, setUserRole] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false); // ✅ dropdown user
  const [darkMode, setDarkMode] = useState(() =>
    localStorage.getItem('theme') === 'dark'
  );

  const userMenuRef = useRef(null);

  useEffect(() => {
    const syncFromStorage = () => {
      setUserName(localStorage.getItem('userName') || '');
      setUserEmail(localStorage.getItem('userEmail') || ''); // ví dụ bạn set ở lúc login
      setUserRole(localStorage.getItem('userRole') || '');
    };
    syncFromStorage();

    const onAuth = () => syncFromStorage();
    window.addEventListener('auth-changed', onAuth);
    return () => window.removeEventListener('auth-changed', onAuth);
  }, []);

  // Đóng dropdown khi đổi route
  useEffect(() => {
    setUserMenuOpen(false);
    setMenuOpen(false);
  }, [pathname]);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const onClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClickOutside);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const handleLogout = () => {
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');   // nhớ xoá luôn email
    localStorage.removeItem('userRole');
    setUserName('');
    setUserEmail('');
    setUserRole('');
    setMenuOpen(false);
    setUserMenuOpen(false);
    navigate('/login');
  };

  const navItemClass = (path) =>
    `block px-4 py-2 text-sm rounded-md ${
      pathname === path
        ? 'bg-blue-600 text-white'
        : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
    }`;

  const toggleDarkMode = () => setDarkMode(!darkMode);

  // Component: Nút & dropdown người dùng (dùng được cho cả desktop & mobile)
  const UserDropdown = ({ mobile = false }) => {
    if (!userName && !userEmail) return null;

    const display = userEmail || userName;

    return (
      <div className={mobile ? 'w-full' : 'relative'} ref={userMenuRef}>
        <button
          onClick={() => setUserMenuOpen((v) => !v)}
          className={
            mobile
              ? 'w-full text-left text-sm px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 flex items-center justify-between'
              : 'flex items-center gap-2 px-3 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200'
          }
          aria-haspopup="menu"
          aria-expanded={userMenuOpen}
          title={display}
        >
          <span className="truncate max-w-[180px]">✉️ {display}</span>
          <ChevronDown size={16} className="opacity-70" />
        </button>

        {/* Dropdown menu */}
        {userMenuOpen && (
          <div
            role="menu"
            className={
              mobile
                ? 'mt-2 space-y-1'
                : 'absolute right-0 mt-2 w-44 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black/5 p-1 z-50'
            }
          >
            <button
              onClick={() => {
                setUserMenuOpen(false);
                navigate('/profile'); // ✅ trang chỉnh sửa cá nhân
              }}
              className={
                mobile
                  ? navItemClass('/profile')
                  : 'w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200'
              }
              role="menuitem"
            >
              👤 Profile
            </button>
            <button
              onClick={handleLogout}
              className={
                mobile
                  ? 'w-full text-left text-sm px-3 py-2 rounded bg-red-500/90 text-white hover:bg-red-600 transition'
                  : 'w-full text-left px-3 py-2 text-sm rounded bg-red-500/90 text-white hover:bg-red-600 transition'
              }
              role="menuitem"
            >
              🚪 Logout
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-md sticky top-0 z-50 transition-colors">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo */}
        <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
          <Link to="/" onClick={() => setMenuOpen(false)}>JobBoard</Link>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center space-x-4">
          {!userName && !userEmail && (
            <>
              <Link to="/register" className={navItemClass('/register')}>Register</Link>
              <Link to="/login" className={navItemClass('/login')}>Login</Link>
            </>
          )}

          <Link to="/" className={navItemClass('/')}>Jobs</Link>
          <Link to="/post-job" className={navItemClass('/post-job')}>Post Job</Link>
          <Link to="/chat" className={navItemClass('/chat')}>Chat</Link>
          <Link to="/companies" className={navItemClass('/companies')}>Companies</Link>

          {userRole === 'employer' && (
            <Link to="/employer/applications" className={navItemClass('/employer/applications')}>
              <div className="flex items-center gap-1">
                <Briefcase size={16} /> Applications
              </div>
            </Link>
          )}
          {userRole === 'seeker' && (
            <Link to="/seeker/dashboard" className={navItemClass('/seeker/dashboard')}>
              Candidate Dashboard
            </Link>
          )}
          {/* ✅ Dropdown người dùng (desktop) */}
          {(userName || userEmail) && <UserDropdown />}

          {/* 🌙 Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
            aria-label="Toggle theme"
            title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>

        {/* Mobile Hamburger */}
        <div className="md:hidden">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-gray-800 dark:text-gray-200 p-2 rounded"
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {menuOpen && (
        <div className="md:hidden px-4 pb-4 space-y-2">
          {!userName && !userEmail && (
            <>
              <Link to="/register" className={navItemClass('/register')} onClick={() => setMenuOpen(false)}>Register</Link>
              <Link to="/login" className={navItemClass('/login')} onClick={() => setMenuOpen(false)}>Login</Link>
            </>
          )}

          <Link to="/" className={navItemClass('/')} onClick={() => setMenuOpen(false)}>Jobs</Link>
          <Link to="/post-job" className={navItemClass('/post-job')} onClick={() => setMenuOpen(false)}>Post Job</Link>
          <Link to="/chat" className={navItemClass('/chat')} onClick={() => setMenuOpen(false)}>Chat</Link>

          {userRole === 'employer' && (
            <Link to="/employer/applications" className={navItemClass('/employer/applications')} onClick={() => setMenuOpen(false)}>
              <div className="flex items-center gap-1">
                <Briefcase size={16} /> Applications
              </div>
            </Link>
          )}

          {/* ✅ Dropdown người dùng (mobile) */}
          {(userName || userEmail) && <UserDropdown mobile />}

          {/* 🌙 Dark Mode Toggle (Mobile) */}
          <button
            onClick={toggleDarkMode}
            className="w-full text-left text-sm px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
          >
            {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
