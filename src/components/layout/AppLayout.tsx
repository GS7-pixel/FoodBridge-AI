import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNav from './TopNav';
import ToastContainer from '../ui/ToastContainer';

export default function AppLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-[#FAFAF8]">
      {/* Left Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Navbar */}
        <TopNav />

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Global Toasts */}
      <ToastContainer />
    </div>
  );
}
