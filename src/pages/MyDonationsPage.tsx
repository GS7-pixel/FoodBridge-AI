import { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { Donation, DonationStatus } from '../types';
import {
  Package,
  CheckCircle,
  Truck,
  MapPin,
  Clock,
  ArrowRight,
  ClipboardList,
} from 'lucide-react';
import {
  getStatusColor,
  getStatusLabel,
  getUrgencyColor,
  timeRemaining,
  formatDateTime,
  getStorageLabel,
} from '../utils/helpers';
import { Link } from 'react-router-dom';

const statusFlow: DonationStatus[] = ['available', 'accepted', 'picked_up', 'delivered'];

const statusStepInfo: Record<DonationStatus, { icon: typeof Package; label: string }> = {
  available: { icon: Package, label: 'Available' },
  accepted: { icon: CheckCircle, label: 'Accepted' },
  picked_up: { icon: Truck, label: 'Picked Up' },
  delivered: { icon: MapPin, label: 'Delivered' },
};

type FilterTab = 'all' | DonationStatus;

export default function MyDonationsPage() {
  const { donations, updateDonationStatus, currentUser } = useApp();
  const [tab, setTab] = useState<FilterTab>('all');

  const myDonations = useMemo(() => {
    return donations.filter(d =>
      d.donorId === currentUser.id || d.acceptedBy === currentUser.id
    );
  }, [donations, currentUser.id]);

  const filtered = tab === 'all' ? myDonations : myDonations.filter(d => d.status === tab);

  const tabs: { key: FilterTab; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: myDonations.length },
    { key: 'available', label: 'Available', count: myDonations.filter(d => d.status === 'available').length },
    { key: 'accepted', label: 'Accepted', count: myDonations.filter(d => d.status === 'accepted').length },
    { key: 'picked_up', label: 'Picked Up', count: myDonations.filter(d => d.status === 'picked_up').length },
    { key: 'delivered', label: 'Delivered', count: myDonations.filter(d => d.status === 'delivered').length },
  ];

  const getNextStatus = (current: DonationStatus): DonationStatus | null => {
    const idx = statusFlow.indexOf(current);
    if (idx < statusFlow.length - 1) return statusFlow[idx + 1];
    return null;
  };

  const canAdvance = (donation: Donation): boolean => {
    if (donation.status === 'delivered') return false;
    // Donors can't advance from 'accepted' — only the NGO can
    if (donation.donorId === currentUser.id && donation.status === 'accepted') return false;
    // NGO can advance from accepted → picked_up → delivered
    if (donation.acceptedBy === currentUser.id) return true;
    // Donor can see but only status = available stays as is (no advance needed)
    return false;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-800">My Donations</h1>
        <p className="text-sm text-stone-500 mt-1">
          Track your posted donations and accepted pickups.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-stone-100 p-1 rounded-lg overflow-x-auto">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap transition-all ${
              tab === t.key
                ? 'bg-white text-stone-800 shadow-sm'
                : 'text-stone-500 hover:text-stone-700'
            }`}
          >
            {t.label}
            <span className={`ml-1.5 text-xs ${tab === t.key ? 'text-emerald-600' : 'text-stone-400'}`}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* Donations List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-stone-200 p-12 text-center">
          <ClipboardList className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <h3 className="font-semibold text-stone-600 mb-1">No donations here</h3>
          <p className="text-sm text-stone-400 mb-4">
            {tab === 'all'
              ? "You haven't posted or accepted any donations yet."
              : `No donations with status "${getStatusLabel(tab as DonationStatus)}".`
            }
          </p>
          <Link
            to="/donate"
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-2.5 rounded-xl transition-all text-sm"
          >
            Donate Food
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(donation => {
            const nextStatus = getNextStatus(donation.status);
            const showAdvance = canAdvance(donation);

            return (
              <div
                key={donation.id}
                className="bg-white rounded-xl border border-stone-200 p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  {/* Left */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-stone-800 text-lg">{donation.foodName}</h3>
                      <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${getStatusColor(donation.status)}`}>
                        {getStatusLabel(donation.status)}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getUrgencyColor(donation.urgency)}`}>
                        {donation.urgency.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-stone-500 mb-3">
                      <span className="flex items-center gap-1">
                        <Package className="w-3.5 h-3.5" /> {donation.quantity} {donation.unit} • {donation.category}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" /> {donation.pickupLocation}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> {timeRemaining(donation.pickupDeadline)}
                      </span>
                    </div>

                    {/* Status Timeline */}
                    <div className="flex items-center gap-1 mt-3">
                      {statusFlow.map((step, i) => {
                        const current = statusFlow.indexOf(donation.status);
                        const isCompleted = i <= current;
                        const isCurrent = i === current;
                        const info = statusStepInfo[step];
                        const Icon = info.icon;
                        return (
                          <div key={step} className="flex items-center">
                            <div className="flex flex-col items-center">
                              <div
                                className={`w-7 h-7 rounded-full flex items-center justify-center ${
                                  isCompleted
                                    ? 'bg-emerald-100 text-emerald-600'
                                    : 'bg-stone-100 text-stone-400'
                                } ${isCurrent ? 'ring-2 ring-emerald-300' : ''}`}
                              >
                                <Icon className="w-3.5 h-3.5" />
                              </div>
                              <span className={`text-[9px] mt-1 ${isCompleted ? 'text-emerald-600 font-medium' : 'text-stone-400'}`}>
                                {info.label}
                              </span>
                            </div>
                            {i < statusFlow.length - 1 && (
                              <div
                                className={`w-6 h-0.5 mb-4 mx-0.5 ${
                                  i < current ? 'bg-emerald-300' : 'bg-stone-200'
                                }`}
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Timestamps */}
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-[11px] text-stone-400">
                      <span>Created: {formatDateTime(donation.createdAt)}</span>
                      {donation.acceptedAt && <span>Accepted: {formatDateTime(donation.acceptedAt)}</span>}
                      {donation.pickedUpAt && <span>Picked up: {formatDateTime(donation.pickedUpAt)}</span>}
                      {donation.deliveredAt && <span>Delivered: {formatDateTime(donation.deliveredAt)}</span>}
                    </div>

                    {donation.acceptedByName && (
                      <p className="text-xs text-stone-500 mt-2">
                        Accepted by: <span className="font-medium text-stone-700">{donation.acceptedByName}</span>
                      </p>
                    )}
                  </div>

                  {/* Action Button */}
                  {showAdvance && nextStatus && (
                    <button
                      onClick={() => updateDonationStatus(donation.id, nextStatus)}
                      className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all shadow-sm whitespace-nowrap"
                    >
                      Mark as {getStatusLabel(nextStatus)}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
