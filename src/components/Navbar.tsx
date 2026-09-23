import React, { useState, useEffect } from 'react';
import { ShoppingCart, Menu, Search, X, Package, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface NavbarProps {
  onSearch: (query: string) => void;
  cartCount: number;
  onOpenCart: () => void;
  user: any | null;
  onOpenAdmin: () => void;
  activeHash?: string;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export default function Navbar({ onSearch, cartCount, onOpenCart, user, onOpenAdmin, activeHash, isDarkMode, onToggleDarkMode }: NavbarProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    onSearch(value);
  };

  const closeSearch = () => {
    setIsSearchOpen(false);
    setSearchValue("");
    onSearch("");
  };

  const navLinks = [
    { name: "Home", href: "#home" },
    { name: "Products", href: "#mixes" },
    { name: "About Us", href: "#about" },
    { name: "Contact", href: "#contact" },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 dark:bg-slate-900/80 dark:border-slate-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          {/* Logo */}
          <a href="#home" className="flex items-center gap-2 group shrink-0" onClick={() => setIsMenuOpen(false)}>
            <div className="w-12 h-12 flex items-center justify-center transition-transform group-hover:scale-110">
              <img 
                src="/assets/logo.png" 
                alt="3ripple Logo" 
                className="w-full h-full object-contain rounded-full shadow-sm"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/assets/logo.png";
                }}
              />
            </div>
            <span className="hidden lg:block font-display font-bold text-xl tracking-tight text-slate-800 dark:text-slate-100">
              3ripple <span className="text-[var(--color-brand-blue)]">Hallelujah</span> Ventures
            </span>
          </a>

          {/* Desktop Nav */}
          <div className="hidden lg:flex flex-1 items-center justify-center gap-2 px-6">
            {navLinks.map((link) => {
              const isActive = activeHash === link.href;
              return (
                <a 
                  key={link.name}
                  href={link.href} 
                  className={`px-4 py-2 text-sm font-bold rounded-xl transition-all ${
                    isActive 
                      ? 'bg-[var(--color-brand-blue)] text-white shadow-lg shadow-blue-200' 
                      : 'text-slate-600 dark:text-slate-400 hover:text-[var(--color-brand-blue)] dark:hover:text-[var(--color-brand-blue)] hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {link.name}
                </a>
              );
            })}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            {user?.isAdmin && (
              <button 
                onClick={onOpenAdmin}
                className="hidden lg:flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-slate-800 transition-all shadow-sm"
              >
                Admin
              </button>
            )}
            <button 
              onClick={onToggleDarkMode}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-all flex items-center justify-center rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800"
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button 
              onClick={() => setIsSearchOpen(true)}
              className="p-2 text-slate-400 hover:text-slate-600 hidden sm:flex transition-colors"
            >
              <Search size={20} />
            </button>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onOpenCart}
              className="relative p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <ShoppingCart size={22} />
              {cartCount > 0 && (
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  key={cartCount}
                  className="absolute -top-1 -right-1 bg-[var(--color-brand-blue)] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white"
                >
                  {cartCount}
                </motion.span>
              )}
            </motion.button>
            <button 
              className="lg:hidden p-2 text-slate-400 hover:text-slate-600 transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Search Overlay */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute inset-0 bg-white dark:bg-slate-900 transition-colors z-50 flex items-center px-4"
          >
            <div className="max-w-3xl mx-auto w-full flex items-center gap-4">
              <Search className="text-slate-400" size={24} />
              <input 
                autoFocus
                type="text"
                value={searchValue}
                onChange={handleSearchChange}
                placeholder="Search for grain mixes, ingredients..."
                className="flex-1 text-xl font-medium text-slate-800 dark:text-slate-100 dark:placeholder:text-slate-600 bg-transparent placeholder:text-slate-300 focus:outline-none"
              />
              <button 
                onClick={closeSearch}
                className="p-2 text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xl"
          >
            <div className="px-4 py-6 space-y-4">
              <div className="flex items-center justify-between gap-4 mb-4">
                <button 
                  onClick={onToggleDarkMode}
                  className="flex-1 flex items-center justify-center gap-3 py-3 px-4 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-100 font-bold text-xs uppercase tracking-widest transition-all"
                >
                  {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                  {isDarkMode ? "Light Mode" : "Dark Mode"}
                </button>
              </div>
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600" size={18} />
                <input 
                  type="text"
                  value={searchValue}
                  onChange={handleSearchChange}
                  placeholder="Search mixtures..."
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl text-sm dark:text-slate-100 focus:outline-none"
                />
              </div>

              {user?.isAdmin && (
                <button 
                  onClick={() => {
                    setIsMenuOpen(false);
                    onOpenAdmin();
                  }}
                  className="w-full flex items-center justify-between px-4 py-4 bg-slate-900 text-white rounded-xl text-sm font-bold uppercase tracking-widest hover:bg-slate-800 transition-all shadow-md mb-2"
                >
                  Admin Portal
                  <Package size={18} />
                </button>
              )}

              {navLinks.map((link) => {
                const isActive = activeHash === link.href;
                return (
                  <a 
                    key={link.name}
                    href={link.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`block text-lg font-bold transition-all py-3 px-4 rounded-xl ${
                      isActive 
                        ? 'bg-[var(--color-brand-blue)] text-white shadow-lg' 
                        : 'text-slate-600 dark:text-slate-400 hover:text-[var(--color-brand-blue)] hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {link.name}
                  </a>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
