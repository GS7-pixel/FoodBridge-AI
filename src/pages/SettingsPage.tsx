import { useApp } from '../context/AppContext';
import { Settings, User, Bell, Shield, Palette, Info } from 'lucide-react';

export default function SettingsPage() {
  const { currentUser } = useApp();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-800">Settings</h1>
        <p className="text-sm text-stone-500 mt-1">
          Manage your account and preferences.
        </p>
      </div>

      <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-4">
        <Info className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-amber-800">
          This is a demo application. Settings shown below are illustrative and do not persist beyond this session.
        </p>
      </div>

      {/* Profile */}
      <div className="bg-white rounded-xl border border-stone-200 p-6">
        <div className="flex items-center gap-2 mb-5">
          <User className="w-5 h-5 text-emerald-600" />
          <h2 className="font-semibold text-stone-800">Profile</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">Name</label>
            <input
              type="text"
              value={currentUser.name}
              readOnly
              className="w-full px-4 py-2.5 text-sm border border-stone-200 rounded-lg bg-stone-50 text-stone-600"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">Email</label>
            <input
              type="email"
              value={currentUser.email}
              readOnly
              className="w-full px-4 py-2.5 text-sm border border-stone-200 rounded-lg bg-stone-50 text-stone-600"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">Organization</label>
            <input
              type="text"
              value={currentUser.organization || ''}
              readOnly
              className="w-full px-4 py-2.5 text-sm border border-stone-200 rounded-lg bg-stone-50 text-stone-600"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">Role</label>
            <input
              type="text"
              value={currentUser.role.toUpperCase()}
              readOnly
              className="w-full px-4 py-2.5 text-sm border border-stone-200 rounded-lg bg-stone-50 text-stone-600"
            />
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-xl border border-stone-200 p-6">
        <div className="flex items-center gap-2 mb-5">
          <Bell className="w-5 h-5 text-emerald-600" />
          <h2 className="font-semibold text-stone-800">Notifications</h2>
        </div>
        <div className="space-y-4">
          {[
            { label: 'New donation alerts', desc: 'Get notified when new donations are posted nearby.', default: true },
            { label: 'Pickup reminders', desc: 'Reminders before pickup deadlines.', default: true },
            { label: 'Status updates', desc: 'When your donation status changes.', default: true },
            { label: 'Weekly impact report', desc: 'Summary of your impact each week.', default: false },
          ].map(item => (
            <div key={item.label} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-stone-700">{item.label}</p>
                <p className="text-xs text-stone-400 mt-0.5">{item.desc}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked={item.default} className="sr-only peer" />
                <div className="w-10 h-5.5 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* About */}
      <div className="bg-white rounded-xl border border-stone-200 p-6">
        <div className="flex items-center gap-2 mb-5">
          <Palette className="w-5 h-5 text-emerald-600" />
          <h2 className="font-semibold text-stone-800">About FoodBridge AI</h2>
        </div>
        <div className="space-y-2 text-sm text-stone-600">
          <p>FoodBridge AI is a hackathon project built for the <strong>"Food for Everyone"</strong> theme.</p>
          <p>It demonstrates how technology can reduce food waste by connecting surplus food donors with NGOs and food distribution organizations.</p>
          <p className="text-xs text-stone-400 mt-4">
            All data is simulated for demonstration purposes. No real organizations are represented.
          </p>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-xl border border-red-200 p-6">
        <div className="flex items-center gap-2 mb-5">
          <Shield className="w-5 h-5 text-red-500" />
          <h2 className="font-semibold text-stone-800">Data Management</h2>
        </div>
        <p className="text-sm text-stone-500 mb-4">
          Reset all demo data to the original sample data set.
        </p>
        <button
          onClick={() => {
            Object.keys(localStorage).forEach(k => {
              if (k.startsWith('foodbridge_')) {
                localStorage.removeItem(k);
              }
            });
            window.location.reload();
          }}
          className="inline-flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-semibold px-5 py-2.5 rounded-xl border border-red-200 transition-all"
        >
          Reset Demo Data
        </button>
      </div>
    </div>
  );
}
