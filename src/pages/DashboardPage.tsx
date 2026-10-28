import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Link } from 'react-router-dom';
import {
  Package,
  Users,
  Truck,
  TrendingUp,
  ArrowRight,
  Clock,
  Sparkles,
  MapPin,
  AlertTriangle,
} from 'lucide-react';
import { getStatusColor, getStatusLabel, getUrgencyColor, timeRemaining } from '../utils/helpers';
import { fetchAIMatches, MatchFetchResult } from '../utils/smartMatch';
import { Donation } from '../types';

export default function DashboardPage() {
  const { visibleDonations, visibleNGOs, currentUser } = useApp();

  const available = visibleDonations.filter(d => d.status === 'available');
  const mealsRescued = visibleDonations
    .filter(d => d.status === 'delivered')
    .reduce((sum, d) => sum + d.quantity, 0);
  const pendingPickups = visibleDonations.filter(d => d.status === 'accepted').length;

  const activeNgoPartnersCount = currentUser.role === 'admin'
    ? visibleNGOs.length
    : currentUser.role === 'ngo'
      ? (currentUser.ngoId ? 1 : 0)
      : new Set(visibleDonations.map(d => d.acceptedByNgoId).filter(Boolean)).size;

  const summaryCards = [
    { label: 'Available Donations', value: available.length, icon: Package, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Meals Rescued', value: mealsRescued, icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Active NGO Partners', value: activeNgoPartnersCount, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Pending Pickups', value: pendingPickups, icon: Truck, color: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  const urgentDonations = available
    .filter(d => d.urgency === 'critical' || d.urgency === 'high')
    .slice(0, 3);

  const [topMatchResult, setTopMatchResult] = useState<MatchFetchResult | null>(null);
  const [loadingTopMatch, setLoadingTopMatch] = useState(false);

  const targetDonation = available[0] || null;

  useEffect(() => {
    // Donors never call or receive AI match for NGOs
    if (currentUser.role === 'donor' || !targetDonation) {
      setTopMatchResult(null);
      setLoadingTopMatch(false);
      return;
    }

    let active = true;
    setLoadingTopMatch(true);
    fetchAIMatches(targetDonation, visibleNGOs, currentUser)
      .then(res => {
        if (active) {
          setTopMatchResult(res);
          setLoadingTopMatch(false);
        }
      })
      .catch(err => {
        console.error('Error fetching dashboard AI match:', err);
        if (active) setLoadingTopMatch(false);
      });

    return () => {
      active = false;
    };
  }, [targetDonation, visibleNGOs, currentUser]);

  const topMatch = topMatchResult?.matches?.[0] || null;
  const recentDonations = visibleDonations.slice(0, 6);
  const latestDonorDonation = currentUser.role === 'donor' ? visibleDonations[0] : null;

  const getHour = () => {
    const h = new Date().getHours();
    if (h < 12) return 'morning';
    if (h < 17) return 'afternoon';
    return 'evening';
  };

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-stone-800">
          Good {getHour()}! Let's make an impact today.
        </h1>
        <p className="text-sm text-stone-500 mt-1">
          Welcome back, {currentUser.name}. Here's what's happening on FoodBridge.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map(card => (
          <div
            key={card.label}
            className="bg-white rounded-xl border border-stone-200 p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-lg ${card.bg} flex items-center justify-center`}>
                <card.icon className={`w-5 h-5 ${card.color}`} />
              </div>
            </div>
            <p className="text-2xl font-bold text-stone-800">{card.value}</p>
            <p className="text-xs text-stone-500 mt-0.5">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Donations Table */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-stone-200 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
            <h2 className="font-semibold text-stone-800">Recent Donations</h2>
            <Link to="/find" className="text-xs text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-stone-400 uppercase tracking-wider border-b border-stone-100">
                  <th className="px-5 py-3 font-medium">Food</th>
                  <th className="px-5 py-3 font-medium hidden sm:table-cell">Qty</th>
                  <th className="px-5 py-3 font-medium hidden md:table-cell">Location</th>
                  <th className="px-5 py-3 font-medium">Deadline</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {recentDonations.map(donation => (
                  <DonationRow key={donation.id} donation={donation} />
                ))}
              </tbody>
            </table>
          </div>
          {recentDonations.length === 0 && (
            <div className="px-5 py-12 text-center text-sm text-stone-400">
              No donations yet. Be the first to donate!
            </div>
          )}
        </div>

        {/* Right Panel */}
        <div className="space-y-4">
          {/* Urgent Donations */}
          <div className="bg-white rounded-xl border border-stone-200 p-5">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-4 h-4 text-orange-500" />
              <h3 className="font-semibold text-stone-800 text-sm">Urgent Donations</h3>
            </div>
            {urgentDonations.length === 0 ? (
              <p className="text-xs text-stone-400 py-2">No urgent donations right now.</p>
            ) : (
              <div className="space-y-3">
                {urgentDonations.map(d => (
                  <div key={d.id} className="flex items-start gap-3 p-3 rounded-lg bg-stone-50 border border-stone-100">
                    <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
                      <Clock className="w-4 h-4 text-orange-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-stone-800 truncate">{d.foodName}</p>
                      <p className="text-xs text-stone-500">{d.quantity} {d.unit}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${getUrgencyColor(d.urgency)}`}>
                          {d.urgency.toUpperCase()}
                        </span>
                        <span className="text-[10px] text-stone-400">{timeRemaining(d.pickupDeadline)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* AI Smart Match */}
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-xl border border-emerald-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-stone-800 text-sm">
                    {currentUser.role === 'donor'
                      ? 'Matching Status'
                      : currentUser.role === 'ngo'
                      ? 'Smart Match — Your NGO'
                      : 'Smart Match'}
                  </h3>
                  <p className="text-[10px] text-stone-500">
                    {currentUser.role === 'donor'
                      ? 'Donation dispatch status'
                      : currentUser.role === 'ngo'
                      ? 'Compatibility with your organization'
                      : topMatchResult?.isFallback
                      ? 'Basic match'
                      : 'Gemini AI Match'}
                  </p>
                </div>
              </div>
              {currentUser.role === 'donor' ? (
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                  latestDonorDonation && latestDonorDonation.status !== 'available'
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                }`}>
                  {latestDonorDonation && latestDonorDonation.status !== 'available'
                    ? 'Accepted'
                    : 'Matching in progress'}
                </span>
              ) : currentUser.role === 'ngo' ? (
                <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-emerald-100 text-emerald-700 border border-emerald-200">
                  Your NGO
                </span>
              ) : (
                topMatchResult && !loadingTopMatch && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    topMatchResult.isFallback
                      ? 'bg-amber-100 text-amber-700 border border-amber-200'
                      : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                  }`}>
                    {topMatchResult.isFallback ? 'Basic match' : 'Gemini AI'}
                  </span>
                )
              )}
            </div>

            {/* Donor View: No ranked NGO list; show matching status */}
            {currentUser.role === 'donor' ? (
              latestDonorDonation ? (
                <div className="bg-white rounded-lg p-3.5 border border-emerald-100">
                  <p className="text-sm font-semibold text-stone-800 mb-1">{latestDonorDonation.foodName}</p>
                  <p className="text-xs text-stone-500 mb-2">
                    {latestDonorDonation.quantity} {latestDonorDonation.unit} • {latestDonorDonation.category}
                  </p>
                  {latestDonorDonation.acceptedByName ? (
                    <div className="pt-2 border-t border-stone-100">
                      <p className="text-xs font-medium text-emerald-700">
                        Accepted by {latestDonorDonation.acceptedByName}
                      </p>
                      <p className="text-[11px] text-stone-500 mt-0.5">
                        Pickup scheduled at {latestDonorDonation.pickupLocation}
                      </p>
                    </div>
                  ) : (
                    <div className="pt-2 border-t border-stone-100 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <p className="text-xs text-emerald-700 font-medium">Matching in progress</p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-stone-500 py-2">
                  Post a donation to start Smart Matching.
                </p>
              )
            ) : (
              <>
                {loadingTopMatch && (
                  <div className="bg-white/80 rounded-lg p-4 border border-emerald-100 animate-pulse space-y-2">
                    <div className="h-4 bg-stone-200 rounded w-2/3" />
                    <div className="h-3 bg-stone-100 rounded w-1/2" />
                    <div className="h-3 bg-stone-100 rounded w-full" />
                  </div>
                )}

                {!loadingTopMatch && topMatch ? (
                  <div>
                    <div className="bg-white rounded-lg p-3.5 border border-emerald-100 mb-2">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">{topMatch.ngo.avatar}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-stone-800 truncate">
                            {currentUser.role === 'ngo' ? `Your NGO (${topMatch.ngo.name})` : topMatch.ngo.name}
                          </p>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-stone-400" />
                            <span className="text-[11px] text-stone-500 truncate">
                              {topMatch.ngo.area || topMatch.ngo.location}
                            </span>
                          </div>
                        </div>
                        <span className="text-lg font-bold text-emerald-600">{topMatch.score}%</span>
                      </div>
                      <p className="text-xs text-stone-600 leading-relaxed">{topMatch.reason}</p>
                      <div className="mt-2.5 pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-400">
                        <span>{topMatch.ngo.pickupAvailable ? '🚚 Pickup Available' : '📍 Drop-off'}</span>
                        <span>Cap: {topMatch.ngo.capacity} servings</span>
                      </div>
                    </div>
                    <p className="text-[9px] text-stone-400 mt-2 italic">
                      {currentUser.role === 'ngo'
                        ? 'Fit evaluation computed for your NGO only.'
                        : topMatchResult?.isFallback
                        ? 'Basic match — filtered by food type & capacity, sorted by area.'
                        : 'Ranked by Gemini AI for food compatibility, capacity, locality & urgency.'}
                    </p>
                  </div>
                ) : !loadingTopMatch ? (
                  <p className="text-xs text-stone-500 py-2">
                    Add a donation to see matching recommendations.
                  </p>
                ) : null}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function DonationRow({ donation }: { donation: Donation }) {
  return (
    <tr className="hover:bg-stone-50/50 transition-colors">
      <td className="px-5 py-3">
        <p className="font-medium text-stone-800">{donation.foodName}</p>
        <p className="text-xs text-stone-400">{donation.category}</p>
      </td>
      <td className="px-5 py-3 hidden sm:table-cell text-stone-600">
        {donation.quantity} {donation.unit}
      </td>
      <td className="px-5 py-3 hidden md:table-cell">
        <p className="text-stone-500 truncate max-w-[180px]">{donation.pickupLocation}</p>
      </td>
      <td className="px-5 py-3">
        <span className="text-xs text-stone-500">{timeRemaining(donation.pickupDeadline)}</span>
      </td>
      <td className="px-5 py-3">
        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${getStatusColor(donation.status)}`}>
          {getStatusLabel(donation.status)}
        </span>
        {donation.acceptedByName && (
          <p className="text-[10px] text-stone-500 mt-0.5 truncate max-w-[150px]">
            by {donation.acceptedByName}
          </p>
        )}
      </td>
      <td className="px-5 py-3">
        <Link
          to={donation.status === 'available' ? '/find' : '/my-donations'}
          className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
        >
          View →
        </Link>
      </td>
    </tr>
  );
}
