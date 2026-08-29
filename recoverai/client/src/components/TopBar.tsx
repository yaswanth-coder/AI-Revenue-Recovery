import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Play, Menu, User, LogOut, LogIn, Settings, ShieldCheck } from 'lucide-react';
import { NotificationDropdown } from './NotificationDropdown';
import { SecurityShieldModal } from './SecurityShieldModal';
import { useAuth } from '../context/AuthContext';

interface TopBarProps {
  onToggleSidebar?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onToggleSidebar }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    if (query.toUpperCase().startsWith('TXN_') || query.startsWith('SIM_')) {
      navigate(`/transactions/${query.toUpperCase()}`);
    } else {
      navigate(`/transactions?search=${encodeURIComponent(query)}`);
    }
  };

  return (
    <header className="sticky top-0 z-20 h-16 bg-background-secondary/90 backdrop-blur-md border-b border-background-border px-4 sm:px-6 flex items-center justify-between gap-4">
      {/* Left section: mobile menu toggle + global search */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-background-surface transition-colors"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        {/* Global Search Bar */}
        <form onSubmit={handleSearch} className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search TXN_DEMO_001, customer ID, or failure reason... (Press Enter)"
            className="w-full bg-background-surface border border-background-border rounded-xl pl-9 pr-20 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/50 transition-all font-sans"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-background-card text-slate-400 border border-background-border rounded">
              ↵ Enter
            </kbd>
          </div>
        </form>
      </div>

      {/* Right section: Agent pill + Simulator CTA + Notifications + User Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Security Shield Status Pill */}
        <button
          onClick={() => setShowSecurityModal(true)}
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-700/50 text-xs font-mono font-bold text-emerald-300 transition-colors shadow-glow-sm"
          title="Click to view Bank-Grade Security Posture"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>WAF SECURED</span>
        </button>


        {/* Quick Simulator CTA */}
        <button
          onClick={() => navigate('/simulator')}
          className="btn-primary text-xs py-2 px-3 sm:px-4"
        >
          <Play className="w-3.5 h-3.5 fill-white" />
          <span className="hidden sm:inline">Run Simulation</span>
          <span className="sm:hidden">Simulate</span>
        </button>

        {/* Notifications */}
        <NotificationDropdown />

        {/* User Profile / Login Button */}
        {isAuthenticated && user ? (
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1.5 rounded-xl bg-background-surface hover:bg-background-hover border border-background-border text-slate-200 transition-colors"
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-emerald-600 to-emerald-400 text-black font-bold text-xs flex items-center justify-center">
                {user.name.charAt(0)}
              </div>
              <div className="hidden md:block text-left pr-1">
                <span className="text-xs font-semibold text-white block leading-tight truncate max-w-[110px]">
                  {user.name}
                </span>
                <span className="text-[10px] text-emerald-400 font-mono block leading-tight">
                  {user.role.replace(/_/g, ' ')}
                </span>
              </div>
            </button>

            {showUserMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                <div className="absolute right-0 mt-2 w-64 glass-card p-3 border border-emerald-900/60 shadow-2xl z-50 space-y-2">
                  <div className="p-2 bg-background-surface rounded-lg border border-background-border text-xs">
                    <span className="font-bold text-white block">{user.name}</span>
                    <span className="text-slate-400 text-[11px] font-mono block">{user.email}</span>
                    <span className="text-emerald-400 text-[10px] font-mono block mt-0.5">{user.phone}</span>
                    <span className="text-slate-500 text-[10px] font-mono block mt-1 pt-1 border-t border-background-border">
                      {user.merchantName} · {(user as any).persona === 'MAINTAINER' ? '🔧 Maintainer' : '👤 User'}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      navigate('/profile');
                    }}
                    className="w-full py-2 px-3 text-xs rounded-lg text-slate-300 hover:bg-background-surface hover:text-white flex items-center gap-2 transition-colors"
                  >
                    <Settings className="w-3.5 h-3.5 text-emerald-400" /> My Profile & Settings
                  </button>

                  <button
                    onClick={() => {
                      logout();
                      setShowUserMenu(false);
                      navigate('/login');
                    }}
                    className="w-full py-2 px-3 text-xs rounded-lg text-red-300 hover:bg-red-950/40 hover:text-red-200 flex items-center gap-2 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Sign Out Operator
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <button
            onClick={() => navigate('/login')}
            className="btn-secondary text-xs py-2 px-3 flex items-center gap-1.5"
          >
            <LogIn className="w-3.5 h-3.5 text-emerald-400" />
            <span>Login</span>
          </button>
        )}
      </div>

      {/* Security Center Modal */}
      <SecurityShieldModal
        isOpen={showSecurityModal}
        onClose={() => setShowSecurityModal(false)}
      />
    </header>
  );
};
