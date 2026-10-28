import { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  AreaChart, Area,
  LineChart, Line,
} from 'recharts';
import {
  TrendingUp,
  Package,
  Truck,
  Scale,
  Leaf,
  Users,
  Info,
} from 'lucide-react';

const COLORS = ['#059669', '#0ea5e9', '#f59e0b', '#8b5cf6', '#ef4444', '#ec4899', '#14b8a6', '#6366f1'];

export default function AnalyticsPage() {
  const { donations, ngoPartners } = useApp();

  const stats = useMemo(() => {
    const total = donations.length;
    const delivered = donations.filter(d => d.status === 'delivered');
    const pending = donations.filter(d => d.status === 'accepted' || d.status === 'picked_up');
    const totalMeals = donations.reduce((s, d) => s + d.quantity, 0);
    const deliveredMeals = delivered.reduce((s, d) => s + d.quantity, 0);
    // Rough estimate: average meal = 0.4 kg
    const wasteAvoided = (deliveredMeals * 0.4).toFixed(1);

    return {
      totalDonations: total,
      completedDeliveries: delivered.length,
      pendingPickups: pending.length,
      totalMeals,
      deliveredMeals,
      wasteAvoided,
    };
  }, [donations]);

  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {};
    donations.forEach(d => {
      counts[d.category] = (counts[d.category] || 0) + d.quantity;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [donations]);

  const statusData = useMemo(() => {
    const counts: Record<string, number> = {
      'Available': 0,
      'Accepted': 0,
      'Picked Up': 0,
      'Delivered': 0,
    };
    donations.forEach(d => {
      const label = d.status === 'picked_up' ? 'Picked Up' : d.status.charAt(0).toUpperCase() + d.status.slice(1);
      counts[label] = (counts[label] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [donations]);

  // Weekly trend (demo data)
  const weeklyTrend = [
    { day: 'Mon', donations: 4, rescued: 3 },
    { day: 'Tue', donations: 6, rescued: 5 },
    { day: 'Wed', donations: 3, rescued: 2 },
    { day: 'Thu', donations: 8, rescued: 7 },
    { day: 'Fri', donations: 5, rescued: 4 },
    { day: 'Sat', donations: 7, rescued: 6 },
    { day: 'Sun', donations: 2, rescued: 2 },
  ];

  // Monthly trend (demo data)
  const monthlyTrend = [
    { month: 'May', meals: 820 },
    { month: 'Jun', meals: 1100 },
    { month: 'Jul', meals: 1350 },
    { month: 'Aug', meals: 1580 },
    { month: 'Sep', meals: 1420 },
    { month: 'Oct', meals: 1750 },
  ];

  const summaryCards = [
    { label: 'Total Meals Donated', value: stats.totalMeals, icon: Package, color: 'text-emerald-600', bg: 'bg-emerald-50', source: 'from app data' },
    { label: 'Completed Deliveries', value: stats.completedDeliveries, icon: Truck, color: 'text-blue-600', bg: 'bg-blue-50', source: 'from app data' },
    { label: 'Pending Pickups', value: stats.pendingPickups, icon: TrendingUp, color: 'text-orange-600', bg: 'bg-orange-50', source: 'from app data' },
    { label: 'Food Waste Avoided', value: `${stats.wasteAvoided} kg`, icon: Scale, color: 'text-purple-600', bg: 'bg-purple-50', source: 'estimate (0.4 kg/meal)' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-800">Impact Analytics</h1>
        <p className="text-sm text-stone-500 mt-1">
          Track the social and environmental impact of FoodBridge.
        </p>
      </div>

      <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-xl p-4">
        <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm text-blue-800 font-medium">About these metrics</p>
          <p className="text-xs text-blue-600 mt-0.5">
            Summary cards are calculated from application data. Charts marked "demo" use sample data for illustration. 
            The food waste estimate uses an approximate 0.4 kg per meal average.
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map(card => (
          <div key={card.label} className="bg-white rounded-xl border border-stone-200 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-lg ${card.bg} flex items-center justify-center`}>
                <card.icon className={`w-5 h-5 ${card.color}`} />
              </div>
            </div>
            <p className="text-2xl font-bold text-stone-800">{card.value}</p>
            <p className="text-xs text-stone-500 mt-0.5">{card.label}</p>
            <p className="text-[10px] text-stone-400 mt-1 italic">{card.source}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <div className="bg-white rounded-xl border border-stone-200 p-5">
          <h3 className="font-semibold text-stone-800 mb-1">Donations by Category</h3>
          <p className="text-[11px] text-stone-400 mb-4">Based on current application data</p>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, percent }: { name?: string; percent?: number }) => `${name || ''} ${((percent || 0) * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {categoryData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: any) => [`${v} units`, 'Quantity']} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[280px] flex items-center justify-center text-sm text-stone-400">
              No data available
            </div>
          )}
        </div>

        {/* Status Breakdown */}
        <div className="bg-white rounded-xl border border-stone-200 p-5">
          <h3 className="font-semibold text-stone-800 mb-1">Donation Status Breakdown</h3>
          <p className="text-[11px] text-stone-400 mb-4">Based on current application data</p>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={statusData} barCategoryGap="20%">
              <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#78716c' }} />
              <YAxis tick={{ fontSize: 12, fill: '#78716c' }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" fill="#059669" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Weekly Trend */}
        <div className="bg-white rounded-xl border border-stone-200 p-5">
          <h3 className="font-semibold text-stone-800 mb-1">Weekly Activity</h3>
          <p className="text-[11px] text-stone-400 mb-4">Sample data for demonstration</p>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={weeklyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#78716c' }} />
              <YAxis tick={{ fontSize: 12, fill: '#78716c' }} allowDecimals={false} />
              <Tooltip />
              <Area type="monotone" dataKey="donations" stroke="#059669" fill="#059669" fillOpacity={0.15} name="Posted" />
              <Area type="monotone" dataKey="rescued" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.1} name="Rescued" />
              <Legend />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Growth */}
        <div className="bg-white rounded-xl border border-stone-200 p-5">
          <h3 className="font-semibold text-stone-800 mb-1">Monthly Meals Rescued</h3>
          <p className="text-[11px] text-stone-400 mb-4">Sample data for demonstration</p>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#78716c' }} />
              <YAxis tick={{ fontSize: 12, fill: '#78716c' }} />
              <Tooltip />
              <Line type="monotone" dataKey="meals" stroke="#059669" strokeWidth={2.5} dot={{ fill: '#059669', r: 4 }} name="Meals" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* NGO Partners */}
      <div className="bg-white rounded-xl border border-stone-200 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-emerald-600" />
          <h3 className="font-semibold text-stone-800">NGO Partners</h3>
          <span className="text-[10px] bg-stone-100 text-stone-400 px-2 py-0.5 rounded-full">Demo partners</span>
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          {ngoPartners.map(ngo => (
            <div key={ngo.id} className="rounded-lg border border-stone-100 p-4 bg-stone-50/50">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">{ngo.avatar}</span>
                <div>
                  <p className="font-semibold text-stone-800 text-sm">{ngo.name}</p>
                  <p className="text-[11px] text-stone-400">{ngo.location}</p>
                </div>
              </div>
              <p className="text-xs text-stone-500 mb-3 leading-relaxed">{ngo.description}</p>
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="bg-white rounded-lg p-2 border border-stone-100">
                  <p className="text-lg font-bold text-emerald-600">{ngo.totalDelivered}</p>
                  <p className="text-[10px] text-stone-400">Delivered</p>
                </div>
                <div className="bg-white rounded-lg p-2 border border-stone-100">
                  <p className="text-lg font-bold text-blue-600">{ngo.capacity}</p>
                  <p className="text-[10px] text-stone-400">Capacity</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
