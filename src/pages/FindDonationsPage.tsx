import { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { FoodCategory, UrgencyLevel, Donation } from '../types';
import {
  Search,
  Filter,
  MapPin,
  Clock,
  Package,
  CheckCircle,
  Sparkles,
  ChevronDown,
  X,
} from 'lucide-react';
import {
  getStatusColor,
  getStatusLabel,
  getUrgencyColor,
  timeRemaining,
  getStorageLabel,
  cn,
} from '../utils/helpers';
import { fetchAIMatches, MatchFetchResult } from '../utils/smartMatch';

const categories: FoodCategory[] = [
  'Cooked Meals', 'Fresh Produce', 'Bakery Items', 'Dairy Products',
  'Canned Goods', 'Beverages', 'Dry Goods', 'Mixed/Other',
];

const urgencyLevels: UrgencyLevel[] = ['critical', 'high', 'medium', 'low'];

export default function FindDonationsPage() {
  const { visibleDonations, acceptDonation, visibleNGOs, currentUser, searchQuery } = useApp();
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [urgencyFilter, setUrgencyFilter] = useState<string>('');
  const [localSearch, setLocalSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [acceptedId, setAcceptedId] = useState<string | null>(null);
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);

  const query = localSearch || searchQuery;

  const filtered = useMemo(() => {
    return visibleDonations
      .filter(d => d.status === 'available')
      .filter(d => {
        if (categoryFilter && d.category !== categoryFilter) return false;
        if (urgencyFilter && d.urgency !== urgencyFilter) return false;
        if (query) {
          const q = query.toLowerCase();
          return (
            d.foodName.toLowerCase().includes(q) ||
            d.category.toLowerCase().includes(q) ||
            d.pickupLocation.toLowerCase().includes(q) ||
            d.donorName.toLowerCase().includes(q)
          );
        }
        return true;
      });
  }, [visibleDonations, categoryFilter, urgencyFilter, query]);

  const handleAccept = (id: string) => {
    const success = acceptDonation(id);
    if (success) {
      setAcceptedId(id);
      setTimeout(() => setAcceptedId(null), 3000);
      if (selectedDonation?.id === id) {
        setSelectedDonation(null);
      }
    }
  };

  const [matchResult, setMatchResult] = useState<MatchFetchResult | null>(null);
  const [isLoadingMatch, setIsLoadingMatch] = useState(false);

  useEffect(() => {
    if (!selectedDonation || currentUser.role === 'donor') {
      setMatchResult(null);
      setIsLoadingMatch(false);
      return;
    }
    let active = true;
    setIsLoadingMatch(true);
    fetchAIMatches(selectedDonation, visibleNGOs, currentUser)
      .then(res => {
        if (active) {
          setMatchResult(res);
          setIsLoadingMatch(false);
        }
      })
      .catch(err => {
        console.error('Error fetching AI match:', err);
        if (active) setIsLoadingMatch(false);
      });

    return () => {
      active = false;
    };
  }, [selectedDonation, visibleNGOs, currentUser]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-800">Find Donations</h1>
        <p className="text-sm text-stone-500 mt-1">
          Browse available food donations and accept ones you can pick up.
        </p>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-xl border border-stone-200 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              value={localSearch}
              onChange={e => setLocalSearch(e.target.value)}
              placeholder="Search by food name, category, location..."
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              'inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg border transition-all',
              showFilters
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
            )}
          >
            <Filter className="w-4 h-4" />
            Filters
            <ChevronDown className={cn('w-4 h-4 transition-transform', showFilters && 'rotate-180')} />
          </button>
        </div>

        {showFilters && (
          <div className="flex flex-wrap gap-3 mt-3 pt-3 border-t border-stone-100">
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="px-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
            >
              <option value="">All Categories</option>
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <select
              value={urgencyFilter}
              onChange={e => setUrgencyFilter(e.target.value)}
              className="px-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
            >
              <option value="">All Urgency</option>
              {urgencyLevels.map(u => (
                <option key={u} value={u}>{u.charAt(0).toUpperCase() + u.slice(1)}</option>
              ))}
            </select>
            {(categoryFilter || urgencyFilter || localSearch) && (
              <button
                onClick={() => { setCategoryFilter(''); setUrgencyFilter(''); setLocalSearch(''); }}
                className="inline-flex items-center gap-1 text-xs text-stone-500 hover:text-stone-700 px-3 py-2"
              >
                <X className="w-3 h-3" /> Clear filters
              </button>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-stone-500">
          {filtered.length} donation{filtered.length !== 1 ? 's' : ''} available
        </p>
      </div>

      {/* Cards Grid */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-stone-200 p-12 text-center">
          <Package className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <h3 className="font-semibold text-stone-600 mb-1">No donations found</h3>
          <p className="text-sm text-stone-400">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(donation => {
            const isAccepted = acceptedId === donation.id;
            return (
              <div
                key={donation.id}
                className={cn(
                  'bg-white rounded-xl border p-5 transition-all hover:shadow-md',
                  isAccepted ? 'border-emerald-300 bg-emerald-50/30' : 'border-stone-200'
                )}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-stone-800">{donation.foodName}</h3>
                    <p className="text-xs text-stone-400 mt-0.5">{donation.category}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getUrgencyColor(donation.urgency)}`}>
                    {donation.urgency.toUpperCase()}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-xs text-stone-500">
                    <Package className="w-3.5 h-3.5 text-stone-400" />
                    {donation.quantity} {donation.unit} • {getStorageLabel(donation.storageCondition as any)}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-stone-500">
                    <MapPin className="w-3.5 h-3.5 text-stone-400" />
                    <span className="truncate">{donation.pickupLocation}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-stone-500">
                    <Clock className="w-3.5 h-3.5 text-stone-400" />
                    {timeRemaining(donation.pickupDeadline)}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-stone-400 mb-4 pb-4 border-b border-stone-100">
                  <span>From: {donation.donorName}</span>
                </div>

                <div className="flex items-center gap-2">
                  {currentUser.role === 'donor' ? (
                    <span className="text-xs text-stone-500 italic py-1.5">
                      Your listed donation
                    </span>
                  ) : isAccepted ? (
                    <div className="flex items-center gap-2 text-emerald-600 text-sm font-medium">
                      <CheckCircle className="w-4 h-4" />
                      Accepted!
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => handleAccept(donation.id)}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold py-2.5 rounded-lg transition-all"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Accept Donation
                      </button>
                      <button
                        onClick={() => setSelectedDonation(selectedDonation?.id === donation.id ? null : donation)}
                        className={cn(
                          'p-2.5 rounded-lg border transition-all',
                          selectedDonation?.id === donation.id
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                            : 'border-stone-200 text-stone-400 hover:text-emerald-600 hover:border-emerald-200'
                        )}
                        title="View Smart Match"
                      >
                        <Sparkles className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Smart Match Panel (Visible to NGO workers and Admin only) */}
      {selectedDonation && currentUser.role !== 'donor' && (
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-xl border border-emerald-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-stone-800">
                  {currentUser.role === 'ngo'
                    ? `Fit for Your NGO — "${selectedDonation.foodName}"`
                    : `Smart Match for "${selectedDonation.foodName}"`}
                </h3>
                <p className="text-[11px] text-stone-500">
                  {isLoadingMatch
                    ? 'Consulting Gemini AI...'
                    : currentUser.role === 'ngo'
                    ? 'Evaluated strictly for your NGO capacity and accepted food types'
                    : matchResult?.isFallback
                    ? 'Basic match — rule-based fallback algorithm'
                    : 'Gemini AI intelligent recommendation'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {currentUser.role === 'ngo' ? (
                <span className="text-[10px] px-2.5 py-0.5 rounded-full font-medium bg-emerald-100 text-emerald-700 border border-emerald-200">
                  Your NGO
                </span>
              ) : (
                matchResult && !isLoadingMatch && (
                  <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-medium ${
                    matchResult.isFallback
                      ? 'bg-amber-100 text-amber-700 border border-amber-200'
                      : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                  }`}>
                    {matchResult.isFallback ? 'Basic match' : 'Gemini AI Match'}
                  </span>
                )
              )}
              <button onClick={() => setSelectedDonation(null)} className="p-1 text-stone-400 hover:text-stone-600">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Loading Skeleton */}
          {isLoadingMatch && (
            <div className={`grid ${currentUser.role === 'ngo' ? 'grid-cols-1 max-w-md' : 'sm:grid-cols-3'} gap-3`}>
              {(currentUser.role === 'ngo' ? [1] : [1, 2, 3]).map(i => (
                <div key={i} className="bg-white/80 rounded-lg p-4 border border-emerald-100 animate-pulse h-28">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-stone-200 rounded-full" />
                    <div className="flex-1 space-y-1">
                      <div className="h-3.5 bg-stone-200 rounded w-2/3" />
                      <div className="h-2.5 bg-stone-100 rounded w-1/2" />
                    </div>
                  </div>
                  <div className="h-3 bg-stone-100 rounded w-full" />
                </div>
              ))}
            </div>
          )}

          {/* Loaded Matches */}
          {!isLoadingMatch && matchResult && matchResult.matches.length > 0 && (
            <>
              <div className={`grid ${currentUser.role === 'ngo' ? 'grid-cols-1 max-w-md' : 'sm:grid-cols-3'} gap-3`}>
                {matchResult.matches.map(m => (
                  <div key={m.ngoId} className="bg-white rounded-lg p-4 border border-emerald-100 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">{m.ngo.avatar}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-stone-800 truncate">
                            {currentUser.role === 'ngo' ? `Your NGO (${m.ngo.name})` : m.ngo.name}
                          </p>
                          <p className="text-[11px] text-stone-400 truncate">
                            {m.ngo.area || m.ngo.location} • {m.ngo.capacity} servings
                          </p>
                        </div>
                        <span className="text-lg font-bold text-emerald-600">{m.score}%</span>
                      </div>
                      <p className="text-xs text-stone-600 leading-relaxed mb-2">{m.reason}</p>
                    </div>
                    <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-400">
                      <span>{m.ngo.pickupAvailable ? '🚚 Pickup Available' : '📍 Drop-off'}</span>
                      <span>Cap: {m.ngo.capacity}</span>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-stone-400 mt-3 italic text-right">
                {currentUser.role === 'ngo'
                  ? 'Fit evaluation computed exclusively for your NGO.'
                  : matchResult.isFallback
                  ? 'Showing Basic match — filtered by food type and capacity, sorted by area.'
                  : 'AI Match scored by Google Gemini based on proximity, capacity fit & urgency.'}
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
