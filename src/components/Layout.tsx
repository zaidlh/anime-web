import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/useAuth';

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const navLinks = [
    { name: 'Home', path: '/', icon: 'home' },
    { name: 'Library', path: '/mylist', icon: 'collections_bookmark' },
    { name: 'Search', path: '/search', icon: 'search' },
    { name: 'Profile', path: '/profile', icon: 'person' }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-on-surface font-body-md overflow-x-hidden selection:bg-primary/30 selection:text-white pb-20 md:pb-0">
      {/* TopNavBar */}
      <header className="bg-background/80 docked full-width top-0 sticky backdrop-blur-xl border-b border-surface-variant z-50">
        <div className="flex justify-between items-center w-full px-margin-edge py-sm max-w-screen-2xl mx-auto z-50">
          <div className="flex items-center gap-md">
            <button className="md:hidden flex items-center justify-center p-2 -ml-2 text-on-surface hover:bg-surface-variant rounded-full transition-colors">
              <span className="material-symbols-outlined text-[24px]">menu</span>
            </button>
            <Link to="/" className="font-display-lg text-[22px] md:text-[24px] font-black tracking-tighter text-primary uppercase">
              Cloudstream
            </Link>
            <nav className="hidden md:flex items-center gap-md ml-lg">
              <Link className="text-on-surface-variant font-medium hover:text-on-surface transition-colors font-title-sm text-title-sm" to="/browse/animewitcher">Anime</Link>
              <Link className="text-on-surface-variant font-medium hover:text-on-surface transition-colors font-title-sm text-title-sm" to="/browse/asia2tv">Drama</Link>
              <Link className="text-on-surface-variant font-medium hover:text-on-surface transition-colors font-title-sm text-title-sm" to="/mylist">My List</Link>
              <Link className="text-on-surface-variant font-medium hover:text-on-surface transition-colors font-title-sm text-title-sm" to="/settings">Settings</Link>
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <form onSubmit={handleSearch} className="hidden sm:flex items-center bg-surface-container border border-surface-variant hover:border-outline transition-colors rounded-full px-sm py-xs">
              <span className="material-symbols-outlined text-on-surface-variant text-[20px]">search</span>
              <input
                type="search"
                className="bg-transparent border-none focus:ring-0 text-body-md font-body-md text-on-surface placeholder:text-on-surface-variant w-48 ml-2 focus:outline-none"
                placeholder="Search titles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
            <Link to="/search" className="sm:hidden hover:bg-surface-variant transition-all duration-200 p-2 text-on-surface-variant hover:text-on-surface rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]" title="Search">search</span>
            </Link>
            <Link to="/profile" className="hidden md:flex hover:bg-surface-variant transition-all duration-200 p-2 text-on-surface-variant hover:text-on-surface rounded-full items-center justify-center overflow-hidden">
              {user?.photoURL ? (
                <img src={user.photoURL} alt="Profile" className="w-[28px] h-[28px] rounded-full object-cover" />
              ) : (
                <span className="material-symbols-outlined text-[24px]" title="Profile" data-icon="account_circle">account_circle</span>
              )}
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-screen-2xl mx-auto">
        <Outlet />
      </main>

      {/* Bottom Navigation for Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-lg border-t border-surface-variant z-50 pb-safe">
        <div className="flex items-center justify-around py-2 px-2">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path || (link.path !== '/' && location.pathname.startsWith(link.path));
            return (
              <Link
                key={link.name}
                to={link.path}
                className={`flex flex-col items-center justify-center p-2 min-w-[64px] transition-colors ${
                  isActive ? 'text-primary' : 'text-on-surface-variant'
                }`}
              >
                <span 
                  className="material-symbols-outlined text-[24px] mb-1 transition-transform"
                  style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                >
                  {link.icon}
                </span>
                <span className={`text-[10px] font-title-sm tracking-wide ${isActive ? 'font-bold' : 'font-medium'}`}>
                  {link.name}
                </span>
              </Link>
            )
          })}
        </div>
      </nav>

      <footer className="hidden md:block bg-surface-container-lowest w-full border-t border-surface-variant mt-xl">
        <div className="w-full py-xl px-margin-edge flex flex-col md:flex-row justify-between items-center gap-md max-w-screen-2xl mx-auto">
          <div className="flex flex-col gap-xs items-center md:items-start text-center md:text-left flex-1 min-w-0 pr-8">
            <span className="font-title-sm text-title-sm font-bold text-on-surface whitespace-nowrap">Cloudstream Catalog</span>
            <p className="font-body-md text-sm text-on-surface-variant w-full opacity-60">© {new Date().getFullYear()} Cloudstream Catalog. Legal Disclaimer: This site does not store any files on its server. All contents are provided by non-affiliated third parties.</p>
          </div>
          <nav className="flex flex-wrap justify-center gap-md shrink-0">
            <Link className="font-body-md text-sm text-on-surface-variant hover:text-primary transition-colors whitespace-nowrap" to="/terms">Terms</Link>
            <Link className="font-body-md text-sm text-on-surface-variant hover:text-primary transition-colors whitespace-nowrap" to="/privacy">Privacy</Link>
            <Link className="font-body-md text-sm text-on-surface-variant hover:text-primary transition-colors whitespace-nowrap" to="/dmca">DMCA</Link>
            <Link className="font-body-md text-sm text-on-surface-variant hover:text-primary transition-colors whitespace-nowrap" to="/about">About</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
