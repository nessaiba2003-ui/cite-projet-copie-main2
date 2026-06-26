import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu } from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';
import Sidebar from './Sidebar';
import ProtectedRoute from '../common/ProtectedRoute';
import { ROLES } from '../../utils/constants';

export default function UserLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ProtectedRoute roles={[ROLES.DEMANDEUR]}>
      <div className="flex min-h-screen flex-col bg-[#FBF9F7] text-stone-800">
        <Navbar />

        <div className="flex flex-1">
          <div className="hidden lg:block">
            <Sidebar />
          </div>

          {sidebarOpen && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <button
                type="button"
                className="absolute inset-0 bg-black/40"
                onClick={() => setSidebarOpen(false)}
                aria-label="Fermer le menu"
              />
              <div className="absolute left-0 top-0 h-full shadow-2xl">
                <Sidebar onNavigate={() => setSidebarOpen(false)} />
              </div>
            </div>
          )}

          <main className="flex-1 overflow-auto">
            <div className="border-b border-stone-200 bg-white/85 px-4 py-3 backdrop-blur-md lg:hidden">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-100"
              >
                <Menu className="h-5 w-5" />
                Menu
              </button>
            </div>

            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
              <Outlet />
            </div>
          </main>
        </div>

        <Footer />
      </div>
    </ProtectedRoute>
  );
}