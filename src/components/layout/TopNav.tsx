import { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Bell, Search, User, ChevronDown, Menu, X, Leaf } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { UserRole } from '../../types';
import { formatDateTime } from '../../utils/helpers';

const roleLabels: Record<UserRole, string> = {
  donor: 'Donor',
  ngo: 'NGO Partner',
  admin: 'Admin',
};

const mobileNavItems = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/donate', label: 'Donate Food' },
  { to: '/find', label: 'Find Donations' },
  { to: '/my-donations', label: 'My Donations' },
  { to: '/analytics', label: 'Analytics' },
  { to: '/settings', label: 'Settings' },
];

export default function TopNav() {
  const { currentUser, setCurrentRole, notifications, markNotificationRead, searchQuery, setSearchQuery } = useApp();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfile(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-30 h-16 bg-white border-b border-stone-200 flex items-center justify-between px-4 lg:px-6">
        {/* Mobile menu button */}
        <div className="flex items-center gap-3 lg:hidden">
          <button onClick={() => setShowMobileMenu(!showMobileMenu)} className="p-2 rounded-lg hover:bg-stone-100 transition-colors">
            {showMobileMenu ? <X className="w-5 h-5 text-stone-600" /> : <Menu className="w-5 h-5 text-stone-600" />}
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center">
              <Leaf className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-sm">FoodBridge</span>
          </div>
        </div>

        {/* Search */}
        <div className="hidden md:flex items-center flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search donations, NGOs..."
              className="w-full pl-10 pr-4 py-2 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all"
            />
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Role Selector */}
          <div className="hidden sm:flex items-center gap-1 bg-stone-50 border border-stone-200 rounded-lg p-0.5">
            {(Object.keys(roleLabels) as UserRole[]).map(role => (
              <button
                key={role}
                onClick={() => setCurrentRole(role)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  currentUser.role === role
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-stone-500 hover:text-stone-700'
                }`}
              >
                {roleLabels[role]}
              </button>
            ))}
          </div>

          {/* Notification bell */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg hover:bg-stone-100 transition-colors"
            >
              <Bell className="w-5 h-5 text-stone-500" />
              {unreadCount > 0 && (
                <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
            {showNotifications && (
              <div className="absolute right-0 top-12 w-80 bg-white border border-stone-200 rounded-xl shadow-xl overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-stone-100 font-semibold text-sm text-stone-800">
                  Notifications
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-6 text-center text-sm text-stone-400">No notifications</div>
                  ) : (
                    notifications.slice(0, 6).map(n => (
                      <button
                        key={n.id}
                        onClick={() => markNotificationRead(n.id)}
                        className={`w-full text-left px-4 py-3 border-b border-stone-50 hover:bg-stone-50 transition-colors ${
                          !n.read ? 'bg-emerald-50/40' : ''
                        }`}
                      >
                        <p className="text-sm font-medium text-stone-800">{n.title}</p>
                        <p className="text-xs text-stone-500 mt-0.5">{n.message}</p>
                        <p className="text-[10px] text-stone-400 mt-1">{formatDateTime(n.createdAt)}</p>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Profile */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-stone-100 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                <User className="w-4 h-4 text-emerald-700" />
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-stone-800 leading-tight">{currentUser.name}</p>
                <p className="text-[11px] text-stone-400 leading-tight">{currentUser.organization}</p>
              </div>
              <ChevronDown className="w-4 h-4 text-stone-400 hidden md:block" />
            </button>
            {showProfile && (
              <div className="absolute right-0 top-12 w-56 bg-white border border-stone-200 rounded-xl shadow-xl overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-stone-100">
                  <p className="font-semibold text-sm text-stone-800">{currentUser.name}</p>
                  <p className="text-xs text-stone-500">{currentUser.email}</p>
                </div>
                {/* Mobile role selector */}
                <div className="sm:hidden px-4 py-2 border-b border-stone-100">
                  <p className="text-[11px] text-stone-400 mb-1.5 uppercase tracking-wider font-medium">Demo Role</p>
                  {(Object.keys(roleLabels) as UserRole[]).map(role => (
                    <button
                      key={role}
                      onClick={() => { setCurrentRole(role); setShowProfile(false); }}
                      className={`block w-full text-left px-3 py-1.5 text-sm rounded-md mb-0.5 ${
                        currentUser.role === role
                          ? 'bg-emerald-50 text-emerald-700 font-medium'
                          : 'text-stone-600 hover:bg-stone-50'
                      }`}
                    >
                      {roleLabels[role]}
                    </button>
                  ))}
                </div>
                <div className="py-1">
                  <p className="px-4 py-2 text-xs text-stone-400 italic">Demo mode — no login required</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile nav overlay */}
      {showMobileMenu && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/30" onClick={() => setShowMobileMenu(false)}>
          <nav
            className="w-72 h-full bg-[#1a3a2a] p-4 space-y-1"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 px-3 mb-6 mt-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg text-white">
                FoodBridge <span className="text-emerald-400">AI</span>
              </span>
            </div>
            {mobileNavItems.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setShowMobileMenu(false)}
                className={({ isActive }) =>
                  `block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-emerald-600/30 text-emerald-300'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      )}
    </>
  );
}
