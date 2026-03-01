import { ShoppingBag, User, LogOut, Store, Settings } from 'lucide-react';
import { useAuth } from '../AuthContext';

export default function Navbar({ navigate, currentPage }) {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('store');
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-zinc-200 px-6 py-4 flex items-center justify-between">
      {/* Brand */}
      <button
        onClick={() => navigate('store')}
        className="text-xs tracking-[0.5em] uppercase font-semibold text-zinc-900 hover:text-zinc-600 transition-colors"
      >
        DITA Eyewear
      </button>

      {/* Nav links */}
      <div className="flex items-center gap-6">
        <button
          onClick={() => navigate('store')}
          className={`flex items-center gap-1.5 text-xs tracking-widest uppercase transition-colors ${
            currentPage === 'store' ? 'text-zinc-900' : 'text-zinc-400 hover:text-zinc-700'
          }`}
        >
          <Store size={13} />
          Collection
        </button>

        {user ? (
          <>
            {user.is_admin && (
              <button
                onClick={() => navigate('admin')}
                className={`flex items-center gap-1.5 text-xs tracking-widest uppercase transition-colors ${
                  currentPage === 'admin' ? 'text-zinc-900' : 'text-zinc-400 hover:text-zinc-700'
                }`}
              >
                <Settings size={13} />
                Admin
              </button>
            )}
            <button
              onClick={() => navigate('profile')}
              className={`flex items-center gap-1.5 text-xs tracking-widest uppercase transition-colors ${
                currentPage === 'profile' ? 'text-zinc-900' : 'text-zinc-400 hover:text-zinc-700'
              }`}
            >
              <User size={13} />
              {user.name.split(' ')[0]}
            </button>
            <button
              onClick={handleLogout}
              title="Sign out"
              className="text-zinc-400 hover:text-zinc-700 transition-colors"
            >
              <LogOut size={15} />
            </button>
          </>
        ) : (
          <button
            onClick={() => navigate('auth')}
            className={`flex items-center gap-1.5 text-xs tracking-widest uppercase transition-colors ${
              currentPage === 'auth' ? 'text-zinc-900' : 'text-zinc-400 hover:text-zinc-700'
            }`}
          >
            <ShoppingBag size={13} />
            Sign In
          </button>
        )}
      </div>
    </nav>
  );
}
