import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { Search, Film, Tv, Info } from 'lucide-react';

export default function Layout() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = React.useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0f0f0f] text-[#e5e5e5]">
      <header className="sticky top-0 z-50 bg-[#141414]/90 backdrop-blur-md border-b border-[#262626]">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <Link to="/" className="text-xl font-bold text-white flex items-center gap-2">
            <Film className="w-6 h-6 text-blue-500" />
            <span className="hidden sm:inline">Cloudstream Catalog</span>
          </Link>
          
          <form onSubmit={handleSearch} className="flex-1 max-w-md relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              placeholder="Search anime or dramas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-[#262626] rounded-full py-2 pl-10 pr-4 focus:outline-none focus:border-blue-500 transition-colors placeholder-gray-500"
            />
          </form>

          <nav className="flex items-center gap-4 text-sm font-medium">
            <Link to="/browse/animewitcher" className="hidden sm:flex items-center gap-1 hover:text-white transition-colors">
              <Tv className="w-4 h-4" /> Anime
            </Link>
            <Link to="/browse/asia2tv" className="hidden sm:flex items-center gap-1 hover:text-white transition-colors">
              <Film className="w-4 h-4" /> Drama
            </Link>
            <Link to="/about" className="hover:text-white transition-colors">
              <Info className="w-4 h-4 sm:hidden" />
              <span className="hidden sm:inline">About</span>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 w-full pb-12">
        <Outlet />
      </main>

      <footer className="border-t border-[#262626] bg-[#141414] py-8 text-center text-sm text-[#a3a3a3]">
        <div className="max-w-7xl mx-auto px-4">
          <p>© {new Date().getFullYear()} Cloudstream Catalog.</p>
          <p className="mt-2 text-xs">Videos are fetched from third-party sources. We do not host any media.</p>
        </div>
      </footer>
    </div>
  );
}
