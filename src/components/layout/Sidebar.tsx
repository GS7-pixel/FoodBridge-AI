import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  HandHeart,
  Search,
  ClipboardList,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Leaf,
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/donate', icon: HandHeart, label: 'Donate Food' },
  { to: '/find', icon: Search, label: 'Find Donations' },
  { to: '/my-donations', icon: ClipboardList, label: 'My Donations' },
  { to: '/analytics', icon: BarChart3, label: 'Impact Analytics' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`hidden lg:flex flex-col bg-[#1a3a2a] text-white transition-all duration-300 ${
        collapsed ? 'w-[72px]' : 'w-64'
      }`}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 h-16 border-b border-white/10">
        <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center flex-shrink-0">
          <Leaf className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <span className="font-bold text-lg tracking-tight whitespace-nowrap">
            FoodBridge <span className="text-emerald-400">AI</span>
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
                isActive
                  ? 'bg-emerald-600/30 text-emerald-300'
                  : 'text-white/70 hover:text-white hover:bg-white/8'
              }`
            }
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-center h-12 border-t border-white/10 text-white/50 hover:text-white transition-colors"
      >
        {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
      </button>
    </aside>
  );
}
