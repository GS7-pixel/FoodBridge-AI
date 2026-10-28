import { Link } from 'react-router-dom';
import {
  Leaf,
  ArrowRight,
  Heart,
  Truck,
  Users,
  TrendingUp,
  MapPin,
  Clock,
  ChevronRight,
  Sparkles,
  Globe,
} from 'lucide-react';

const stats = [
  { label: 'Meals Rescued', value: '12,400+', sub: 'demo estimate' },
  { label: 'Active Donors', value: '280+', sub: 'demo data' },
  { label: 'NGO Partners', value: '45+', sub: 'demo data' },
  { label: 'Cities Reached', value: '8', sub: 'demo data' },
];

const steps = [
  {
    icon: Heart,
    title: 'List Surplus Food',
    desc: 'Restaurants, caterers, and households post surplus food with details on quantity, freshness, and pickup window.',
    color: 'bg-orange-100 text-orange-600',
  },
  {
    icon: Sparkles,
    title: 'Smart Match',
    desc: 'Our algorithm matches donations to the nearest NGO with the right capacity, specialty, and availability.',
    color: 'bg-emerald-100 text-emerald-600',
  },
  {
    icon: Truck,
    title: 'Pickup & Deliver',
    desc: 'NGOs accept, collect, and distribute meals to communities in need — all tracked in real time.',
    color: 'bg-blue-100 text-blue-600',
  },
];

const impacts = [
  { metric: '2.5 tonnes', label: 'food waste diverted this month', icon: TrendingUp },
  { metric: '98%', label: 'pickup success rate', icon: Clock },
  { metric: '15 min', label: 'average match time', icon: MapPin },
  { metric: '1,200+', label: 'families fed weekly', icon: Users },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-stone-200/60">
        <div className="max-w-6xl mx-auto flex items-center justify-between h-16 px-6">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center shadow-sm">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-stone-800 tracking-tight">
              FoodBridge <span className="text-emerald-600">AI</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/dashboard"
              className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-stone-600 hover:text-emerald-700 transition-colors"
            >
              Dashboard
              <ChevronRight className="w-4 h-4" />
            </Link>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all shadow-sm hover:shadow-md"
            >
              Get Started
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/60 via-transparent to-orange-50/40" />
        <div className="relative max-w-6xl mx-auto px-6 pt-20 pb-24 lg:pt-28 lg:pb-32">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              AI-Powered Food Rescue Platform
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-stone-900 leading-[1.1] tracking-tight">
              Good Food.
              <br />
              <span className="text-emerald-600">Better Futures.</span>
            </h1>
            <p className="mt-6 text-lg text-stone-500 leading-relaxed max-w-lg">
              Rescue surplus food, connect communities, and turn every extra meal
              into an opportunity. Because no meal should go to waste when someone
              is hungry.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/donate"
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-7 py-3.5 rounded-xl transition-all shadow-sm hover:shadow-lg text-sm"
              >
                <Heart className="w-4 h-4" />
                Start Donating
              </Link>
              <Link
                to="/find"
                className="inline-flex items-center gap-2 bg-white hover:bg-stone-50 text-stone-700 font-semibold px-7 py-3.5 rounded-xl border border-stone-200 transition-all shadow-sm hover:shadow-md text-sm"
              >
                <MapPin className="w-4 h-4" />
                Find Food
              </Link>
            </div>
          </div>

          {/* Hero illustration placeholder - a beautiful card arrangement */}
          <div className="hidden lg:block absolute right-8 top-16 w-[420px]">
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-xl border border-stone-100 p-6 transform rotate-2">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-xl">🥗</div>
                  <div>
                    <p className="font-semibold text-stone-800 text-sm">Fresh Salad Bowls</p>
                    <p className="text-xs text-stone-400">30 servings • 2h left</p>
                  </div>
                  <span className="ml-auto px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-700 rounded-full">AVAILABLE</span>
                </div>
                <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
                  <div className="h-full w-3/4 bg-emerald-500 rounded-full" />
                </div>
                <p className="text-[10px] text-stone-400 mt-1.5">Smart Match: Gemini AI ranked top 3 NGOs</p>
              </div>
              <div className="bg-white rounded-2xl shadow-lg border border-stone-100 p-5 transform -rotate-1 mt-[-12px] ml-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-xl">🍛</div>
                  <div>
                    <p className="font-semibold text-stone-800 text-sm">Vegetable Biryani</p>
                    <p className="text-xs text-stone-400">50 servings • Matched!</p>
                  </div>
                  <span className="ml-auto px-2 py-0.5 text-[10px] font-bold bg-blue-100 text-blue-700 rounded-full">ACCEPTED</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-stone-200 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map(s => (
            <div key={s.label} className="text-center">
              <p className="text-3xl font-bold text-stone-800">{s.value}</p>
              <p className="text-sm font-medium text-stone-600 mt-1">{s.label}</p>
              <p className="text-[10px] text-stone-400 mt-0.5 italic">{s.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-stone-800">How FoodBridge Works</h2>
          <p className="text-stone-500 mt-3 max-w-md mx-auto">
            Three simple steps to rescue food and feed communities.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <div
              key={step.title}
              className="bg-white rounded-2xl border border-stone-100 p-8 hover:shadow-lg transition-shadow group"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className={`w-12 h-12 rounded-xl ${step.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <step.icon className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-stone-300 uppercase tracking-widest">Step {i + 1}</span>
              </div>
              <h3 className="text-lg font-bold text-stone-800 mb-2">{step.title}</h3>
              <p className="text-sm text-stone-500 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Impact */}
      <section className="bg-[#1a3a2a] text-white">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold">Our Impact So Far</h2>
            <p className="text-emerald-300/80 mt-3 max-w-md mx-auto text-sm">
              Every number represents a meal saved and a person fed. These are sample figures for demonstration.
            </p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {impacts.map(item => (
              <div
                key={item.label}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10 text-center hover:bg-white/15 transition-colors"
              >
                <item.icon className="w-6 h-6 text-emerald-400 mx-auto mb-3" />
                <p className="text-2xl font-bold">{item.metric}</p>
                <p className="text-sm text-emerald-200/70 mt-1">{item.label}</p>
              </div>
            ))}
          </div>
          <p className="text-center text-[11px] text-emerald-300/50 mt-8 italic">
            All statistics shown are simulated demo data for demonstration purposes.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 py-20 text-center">
        <h2 className="text-3xl font-bold text-stone-800">Ready to Make a Difference?</h2>
        <p className="text-stone-500 mt-3 max-w-md mx-auto">
          Join FoodBridge and help turn surplus food into smiles.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            to="/donate"
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-7 py-3.5 rounded-xl transition-all shadow-sm hover:shadow-lg text-sm"
          >
            <Heart className="w-4 h-4" />
            Start Donating
          </Link>
          <Link
            to="/find"
            className="inline-flex items-center gap-2 bg-white hover:bg-stone-50 text-stone-700 font-semibold px-7 py-3.5 rounded-xl border border-stone-200 transition-all text-sm"
          >
            Find Donations
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-stone-200 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
                <Leaf className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-stone-800">
                FoodBridge <span className="text-emerald-600">AI</span>
              </span>
            </div>
            <p className="text-xs text-stone-400 text-center">
              Built for the "Food for Everyone" hackathon. All data is simulated for demonstration.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-stone-400 hover:text-stone-600 transition-colors" title="Global Impact">
                <Globe className="w-5 h-5" />
              </a>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-stone-100 text-center">
            <p className="text-[11px] text-stone-400">
              © 2026 FoodBridge AI — Reducing food waste, one meal at a time.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
