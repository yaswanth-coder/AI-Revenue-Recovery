import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  TrendingDown,
  RefreshCw,
  Bot,
  ReceiptText,
  BarChart3,
  ScrollText,
  SlidersHorizontal,
  PlayCircle,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Zap,
  User,
} from 'lucide-react';

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, setIsCollapsed }) => {
  const location = useLocation();

  const navItems = [
    { name: 'Overview', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Revenue Risk', path: '/revenue-risk', icon: TrendingDown },
    { name: 'Recovery Operations', path: '/recovery', icon: RefreshCw },
    { name: 'AI Agent', path: '/agent', icon: Bot, highlight: true },
    { name: 'Transactions', path: '/transactions', icon: ReceiptText },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Audit Logs', path: '/audit', icon: ScrollText },
    { name: 'Policies', path: '/policies', icon: SlidersHorizontal },
    { name: 'Simulator', path: '/simulator', icon: PlayCircle, pulse: true },
    { name: 'My Profile', path: '/profile', icon: User },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 h-screen bg-background-secondary border-r border-background-border transition-all duration-300 z-30 flex flex-col justify-between ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div>
        <div className="h-16 flex items-center justify-between px-4 border-b border-background-border">
          <NavLink to="/" className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center text-black font-black text-lg shrink-0 shadow-glow-sm">
              <Zap className="w-5 h-5 fill-black text-black" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="font-bold text-base tracking-tight font-sans text-white flex items-center gap-1">
                  Recover<span className="text-emerald-400">AI</span>
                </span>
                <span className="text-[9px] uppercase tracking-widest font-mono text-emerald-500/80 -mt-1 font-semibold">
                  Autonomous Engine
                </span>
              </div>
            )}
          </NavLink>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-background-hover transition-colors"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation items */}
        <nav className="p-2 space-y-1 mt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path + '/'));

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all group ${
                  isActive
                    ? 'bg-emerald-500/15 text-emerald-300 font-semibold border border-emerald-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-background-surface'
                }`}
                title={isCollapsed ? item.name : undefined}
              >
                {/* Active left indicator bar */}
                {isActive && (
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-emerald-400 rounded-r-full shadow-glow-sm" />
                )}

                <Icon
                  className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-emerald-400' : 'text-slate-400 group-hover:text-emerald-400'
                  }`}
                />

                {!isCollapsed && (
                  <div className="flex items-center justify-between flex-1 truncate">
                    <span className="truncate">{item.name}</span>
                    {item.pulse && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 animate-pulse">
                        LIVE
                      </span>
                    )}
                    {item.highlight && !item.pulse && (
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                    )}
                  </div>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* System Operational & Operator Bottom Badge */}
      <div className="p-3 border-t border-background-border bg-background-card/50 space-y-2">
        {!isCollapsed ? (
          <>
            <div className="p-2.5 rounded-lg bg-background-surface border border-background-border/80 text-[11px] flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 pulse-emerald" />
                  <span className="font-semibold text-slate-200">System Operational</span>
                </div>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-background-border/60">
                <span>Demo Environment</span>
                <span className="font-mono text-emerald-400/80">v1.0.0</span>
              </div>
            </div>
          </>
        ) : (
          <div className="flex justify-center" title="System Operational (Demo)">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 pulse-emerald" />
          </div>
        )}
      </div>
    </aside>
  );
};
