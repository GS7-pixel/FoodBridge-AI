import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DonationFormData, FoodCategory, StorageCondition } from '../types';
import {
  UtensilsCrossed,
  MapPin,
  Clock,
  Phone,
  FileText,
  CheckCircle,
  ArrowLeft,
  Sparkles,
  Package,
  Thermometer,
  User,
  Calendar,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { fetchAIMatches, MatchFetchResult } from '../utils/smartMatch';

const categories: FoodCategory[] = [
  'Cooked Meals', 'Fresh Produce', 'Bakery Items', 'Dairy Products',
  'Canned Goods', 'Beverages', 'Dry Goods', 'Mixed/Other',
];

const storageOptions: { value: StorageCondition; label: string }[] = [
  { value: 'room_temperature', label: 'Room Temperature' },
  { value: 'refrigerated', label: 'Refrigerated' },
  { value: 'frozen', label: 'Frozen' },
  { value: 'hot_holding', label: 'Hot Holding' },
];

const units = ['servings', 'kg', 'liters', 'packets', 'boxes', 'platters', 'cans', 'pieces'];

const emptyForm: DonationFormData = {
  foodName: '',
  category: '',
  quantity: '',
  unit: 'servings',
  preparedAt: '',
  pickupLocation: '',
  pickupDeadline: '',
  storageCondition: '',
  contactName: '',
  contactPhone: '',
  notes: '',
};

interface FormErrors {
  [key: string]: string;
}

export default function DonatePage() {
  const { addDonation, ngoPartners, currentUser } = useApp();
  const [form, setForm] = useState<DonationFormData>({
    ...emptyForm,
    contactName: currentUser.name,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [createdDonation, setCreatedDonation] = useState<ReturnType<typeof addDonation> | null>(null);

  const update = (field: keyof DonationFormData, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validate = (): boolean => {
    const errs: FormErrors = {};
    if (!form.foodName.trim()) errs.foodName = 'Food name is required';
    if (!form.category) errs.category = 'Select a category';
    if (!form.quantity || parseInt(form.quantity) <= 0) errs.quantity = 'Enter a valid quantity';
    if (!form.pickupLocation.trim()) errs.pickupLocation = 'Pickup location is required';
    if (!form.pickupDeadline) errs.pickupDeadline = 'Pickup deadline is required';
    if (!form.storageCondition) errs.storageCondition = 'Select storage condition';
    if (!form.contactName.trim()) errs.contactName = 'Contact name is required';
    if (!form.contactPhone.trim()) errs.contactPhone = 'Contact phone is required';
    
    if (form.pickupDeadline) {
      const deadline = new Date(form.pickupDeadline);
      if (deadline <= new Date()) errs.pickupDeadline = 'Deadline must be in the future';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const [matchResult, setMatchResult] = useState<MatchFetchResult | null>(null);
  const [loadingMatches, setLoadingMatches] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const donation = addDonation(form);
    setCreatedDonation(donation);
    setSubmitted(true);
    setLoadingMatches(true);

    try {
      const res = await fetchAIMatches(donation, ngoPartners);
      setMatchResult(res);
    } catch (err) {
      console.error('Failed to fetch AI match on donation creation:', err);
    } finally {
      setLoadingMatches(false);
    }
  };

  const handleReset = () => {
    setForm({ ...emptyForm, contactName: currentUser.name });
    setErrors({});
    setSubmitted(false);
    setCreatedDonation(null);
    setMatchResult(null);
    setLoadingMatches(false);
  };

  if (submitted && createdDonation) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl border border-stone-200 p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-stone-800 mb-2">Donation Listed!</h2>
          <p className="text-stone-500 mb-6">
            Your donation of <strong>{createdDonation.foodName}</strong> ({createdDonation.quantity} {createdDonation.unit})
            has been posted and is now visible to NGO partners.
          </p>

          {/* Smart Match Recommendations Loading State */}
          {loadingMatches && (
            <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-6 mb-6 text-left">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-emerald-600 animate-spin" />
                <h3 className="font-semibold text-stone-800">Finding Best NGO Matches with AI...</h3>
              </div>
              <p className="text-xs text-stone-500 mb-4">
                Evaluating accepted food types, capacities, Delhi/NCR proximity, and urgency...
              </p>
              <div className="space-y-3">
                <div className="bg-white/80 rounded-lg p-4 border border-emerald-100 animate-pulse h-20" />
                <div className="bg-white/80 rounded-lg p-4 border border-emerald-100 animate-pulse h-20" />
                <div className="bg-white/80 rounded-lg p-4 border border-emerald-100 animate-pulse h-20" />
              </div>
            </div>
          )}

          {/* Smart Match Recommendations Loaded */}
          {!loadingMatches && matchResult && matchResult.matches.length > 0 && (
            <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-5 mb-6 text-left">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-semibold text-stone-800">Smart Match Recommendations</h3>
                </div>
                <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-medium ${
                  matchResult.isFallback 
                    ? 'bg-amber-100 text-amber-700 border border-amber-200' 
                    : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                }`}>
                  {matchResult.isFallback ? 'Basic match' : 'Gemini AI Match'}
                </span>
              </div>
              <div className="space-y-3">
                {matchResult.matches.map((m) => (
                  <div key={m.ngoId} className="bg-white rounded-lg p-4 border border-emerald-100">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{m.ngo.avatar}</span>
                        <div>
                          <p className="text-sm font-semibold text-stone-800">{m.ngo.name}</p>
                          <p className="text-[11px] text-stone-400">
                            {m.ngo.area || m.ngo.location} • Cap: {m.ngo.capacity} servings
                            {m.ngo.pickupAvailable ? ' • 🚚 Pickup Available' : ' • 📍 Drop-off'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-emerald-600">{m.score}%</p>
                        <p className="text-[10px] text-stone-400">match</p>
                      </div>
                    </div>
                    <p className="text-xs text-stone-600 leading-relaxed mt-1">{m.reason}</p>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-stone-400 mt-3 italic">
                {matchResult.isFallback
                  ? 'Showing Basic match filtered by accepted food type and capacity, sorted by area.'
                  : 'Ranked by Google Gemini AI based on food compatibility, capacity, locality & pickup urgency.'}
              </p>
            </div>
          )}

          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-3 rounded-xl transition-all text-sm"
            >
              Donate Again
            </button>
            <Link
              to="/my-donations"
              className="inline-flex items-center gap-2 bg-white hover:bg-stone-50 text-stone-700 font-semibold px-6 py-3 rounded-xl border border-stone-200 transition-all text-sm"
            >
              View My Donations
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-stone-800">Donate Food</h1>
        <p className="text-sm text-stone-500 mt-1">
          Share your surplus food with NGOs and communities in need.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Food Details */}
        <div className="bg-white rounded-xl border border-stone-200 p-6">
          <div className="flex items-center gap-2 mb-5">
            <UtensilsCrossed className="w-5 h-5 text-emerald-600" />
            <h2 className="font-semibold text-stone-800">Food Details</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Food Name *</label>
              <input
                type="text"
                value={form.foodName}
                onChange={e => update('foodName', e.target.value)}
                placeholder="e.g. Vegetable Biryani"
                className={`w-full px-4 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all ${errors.foodName ? 'border-red-300 bg-red-50/30' : 'border-stone-200'}`}
              />
              {errors.foodName && <p className="text-xs text-red-500 mt-1">{errors.foodName}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Category *</label>
              <select
                value={form.category}
                onChange={e => update('category', e.target.value)}
                className={`w-full px-4 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all ${errors.category ? 'border-red-300 bg-red-50/30' : 'border-stone-200'}`}
              >
                <option value="">Select category</option>
                {categories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Storage Condition *</label>
              <select
                value={form.storageCondition}
                onChange={e => update('storageCondition', e.target.value)}
                className={`w-full px-4 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all ${errors.storageCondition ? 'border-red-300 bg-red-50/30' : 'border-stone-200'}`}
              >
                <option value="">Select storage</option>
                {storageOptions.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
              {errors.storageCondition && <p className="text-xs text-red-500 mt-1">{errors.storageCondition}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Quantity *</label>
              <input
                type="number"
                min="1"
                value={form.quantity}
                onChange={e => update('quantity', e.target.value)}
                placeholder="e.g. 50"
                className={`w-full px-4 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all ${errors.quantity ? 'border-red-300 bg-red-50/30' : 'border-stone-200'}`}
              />
              {errors.quantity && <p className="text-xs text-red-500 mt-1">{errors.quantity}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Unit</label>
              <select
                value={form.unit}
                onChange={e => update('unit', e.target.value)}
                className="w-full px-4 py-2.5 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all"
              >
                {units.map(u => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Schedule & Location */}
        <div className="bg-white rounded-xl border border-stone-200 p-6">
          <div className="flex items-center gap-2 mb-5">
            <MapPin className="w-5 h-5 text-emerald-600" />
            <h2 className="font-semibold text-stone-800">Schedule & Location</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Preparation Date & Time</label>
              <input
                type="datetime-local"
                value={form.preparedAt}
                onChange={e => update('preparedAt', e.target.value)}
                className="w-full px-4 py-2.5 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all"
              />
              <p className="text-[11px] text-stone-400 mt-1">When was the food prepared?</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Pickup Deadline *</label>
              <input
                type="datetime-local"
                value={form.pickupDeadline}
                onChange={e => update('pickupDeadline', e.target.value)}
                className={`w-full px-4 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all ${errors.pickupDeadline ? 'border-red-300 bg-red-50/30' : 'border-stone-200'}`}
              />
              {errors.pickupDeadline && <p className="text-xs text-red-500 mt-1">{errors.pickupDeadline}</p>}
              <p className="text-[11px] text-stone-400 mt-1">Latest time for pickup.</p>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Pickup Location *</label>
              <input
                type="text"
                value={form.pickupLocation}
                onChange={e => update('pickupLocation', e.target.value)}
                placeholder="e.g. 123 Main Street, Koramangala, Bangalore"
                className={`w-full px-4 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all ${errors.pickupLocation ? 'border-red-300 bg-red-50/30' : 'border-stone-200'}`}
              />
              {errors.pickupLocation && <p className="text-xs text-red-500 mt-1">{errors.pickupLocation}</p>}
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="bg-white rounded-xl border border-stone-200 p-6">
          <div className="flex items-center gap-2 mb-5">
            <Phone className="w-5 h-5 text-emerald-600" />
            <h2 className="font-semibold text-stone-800">Contact Information</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Contact Name *</label>
              <input
                type="text"
                value={form.contactName}
                onChange={e => update('contactName', e.target.value)}
                placeholder="Your name"
                className={`w-full px-4 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all ${errors.contactName ? 'border-red-300 bg-red-50/30' : 'border-stone-200'}`}
              />
              {errors.contactName && <p className="text-xs text-red-500 mt-1">{errors.contactName}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Contact Phone *</label>
              <input
                type="tel"
                value={form.contactPhone}
                onChange={e => update('contactPhone', e.target.value)}
                placeholder="+91 98765 43210"
                className={`w-full px-4 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all ${errors.contactPhone ? 'border-red-300 bg-red-50/30' : 'border-stone-200'}`}
              />
              {errors.contactPhone && <p className="text-xs text-red-500 mt-1">{errors.contactPhone}</p>}
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Additional Notes</label>
              <textarea
                value={form.notes}
                onChange={e => update('notes', e.target.value)}
                rows={3}
                placeholder="Any allergens, special handling instructions, or details..."
                className="w-full px-4 py-2.5 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all resize-none"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-5 py-3 text-sm font-medium text-stone-600 hover:text-stone-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Cancel
          </Link>
          <button
            type="submit"
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-8 py-3 rounded-xl transition-all shadow-sm hover:shadow-md text-sm"
          >
            <Package className="w-4 h-4" />
            Submit Donation
          </button>
        </div>
      </form>
    </div>
  );
}
