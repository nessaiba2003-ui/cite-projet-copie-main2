import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Outlet, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import UserLayout from '@/components/layout/UserLayout';
import AdminLayout from '@/components/layout/AdminLayout';
import ScrollToTop from '@/components/common/ScrollToTop';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import Loading from '@/components/ui/Loading';

const HomePage = lazy(() => import('@/pages/public/HomePage'));
const AnnoncesPage = lazy(() => import('@/pages/public/AnnoncesPage'));
const EvenementsPage = lazy(() => import('@/pages/public/EvenementsPage'));
const EventDetailPage = lazy(() => import('@/pages/public/EventDetailPage'));
const InscriptionPage = lazy(() => import('@/pages/public/InscriptionPage'));
const LocauxPublicPage = lazy(() => import('@/pages/public/LocauxPublicPage'));
const StructuresPage = lazy(() => import('@/pages/public/StructuresPage'));
const ContactPage = lazy(() => import('@/pages/public/ContactPage'));
const PartenariatPage = lazy(() => import('@/pages/public/PartenariatPage'));

const ImmersionEntryPage = lazy(() => import('@/pages/public/ImmersionEntryPage'));
const ImmersionElevatorPage = lazy(() => import('@/pages/public/ImmersionElevatorPage'));
const ImmersionFloorPage = lazy(() => import('@/pages/public/ImmersionFloorPage'));

const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage'));

const DashboardPage = lazy(() => import('@/pages/user/DashboardPage'));
const LocauxPage = lazy(() => import('@/pages/user/LocauxPage'));
const LocalDetailPage = lazy(() => import('@/pages/user/LocalDetailPage'));
const ReservationPage = lazy(() => import('@/pages/user/ReservationPage'));
const MesReservationsPage = lazy(() => import('@/pages/user/MesReservationsPage'));
const AccessDeniedPage = lazy(() => import('@/pages/AccessDeniedPage'));

const AdminDashboardRedirect = lazy(() => import('@/pages/admin/AdminDashboardRedirect'));
const AdminResDashboardPage = lazy(() => import('@/pages/admin/AdminResDashboardPage'));
const AdminEvtDashboardPage = lazy(() => import('@/pages/admin/AdminEvtDashboardPage'));
const GestionLocauxPage = lazy(() => import('@/pages/admin/GestionLocauxPage'));
const GestionReservationsPage = lazy(() => import('@/pages/admin/GestionReservationsPage'));
const GestionEvenementsPage = lazy(() => import('@/pages/admin/GestionEvenementsPage'));
const GestionAnnoncesPage = lazy(() => import('@/pages/admin/GestionAnnoncesPage'));
const GestionUsersPage = lazy(() => import('@/pages/admin/GestionUsersPage'));
const StatsPage = lazy(() => import('@/pages/admin/StatsPage'));

function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col aurora-page">
      <Navbar />
      <main className="flex-1 relative z-10">
        <Suspense fallback={<Loading label="Chargement…" />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}

function AuthLayout() {
  return (
    <div className="aurora-page min-h-screen">
      <Suspense fallback={<Loading fullScreen label="Chargement…" />}>
        <Outlet />
      </Suspense>
    </div>
  );
}

function PageSuspense({ children }) {
  return <Suspense fallback={<Loading label="Chargement…" />}>{children}</Suspense>;
}

export default function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <ScrollToTop />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              borderRadius: '16px',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              color: '#292524',
              border: '1px solid rgba(231, 229, 228, 0.8)',
              boxShadow: '0 12px 32px -8px rgba(60, 40, 30, 0.18)',
              padding: '12px 16px',
              fontSize: '0.9rem',
              fontWeight: '500',
            },
            success: {
              iconTheme: {
                primary: '#5BBFA0',
                secondary: '#fff',
              },
              style: {
                borderLeft: '4px solid #5BBFA0',
              },
            },
            error: {
              iconTheme: {
                primary: '#E07A5F',
                secondary: '#fff',
              },
              style: {
                borderLeft: '4px solid #E07A5F',
              },
            },
          }}
        />

        <Routes>
          <Route element={<PublicLayout />}>
            <Route index element={<HomePage />} />
            <Route path="annonces" element={<AnnoncesPage />} />

            <Route path="chatbot" element={<Navigate to="/annonces" replace />} />
            <Route path="faq" element={<Navigate to="/annonces" replace />} />

            <Route path="evenements" element={<EvenementsPage />} />
            <Route path="evenements/:id" element={<EventDetailPage />} />
            <Route path="evenements/:id/inscription" element={<InscriptionPage />} />
            <Route path="locaux" element={<LocauxPublicPage />} />
            <Route path="locaux/:id" element={<LocalDetailPage />} />
            <Route path="reservation/:localId" element={<ReservationPage />} />
            <Route path="structures" element={<StructuresPage />} />
            <Route path="contact" element={<ContactPage />} />
            <Route path="partenariat" element={<PartenariatPage />} />
            <Route path="immersion" element={<ImmersionEntryPage />} />
            <Route path="immersion/elevator/:etage" element={<ImmersionElevatorPage />} />
            <Route path="immersion/floor/:etage" element={<ImmersionFloorPage />} />
          </Route>

          <Route element={<AuthLayout />}>
            <Route path="login" element={<LoginPage />} />
            <Route path="forgot-password" element={<ForgotPasswordPage />} />
          </Route>

          <Route path="access-denied" element={<PageSuspense><AccessDeniedPage /></PageSuspense>} />

          <Route path="demandeur" element={<UserLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="locaux" element={<LocauxPage />} />
            <Route path="locaux/:id" element={<LocalDetailPage />} />
            <Route path="reservation/:localId" element={<ReservationPage />} />
            <Route path="mes-reservations" element={<MesReservationsPage />} />
          </Route>

          <Route path="admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboardRedirect />} />
            <Route path="dashboard" element={<AdminDashboardRedirect />} />
            <Route path="dashboard/reservations" element={<AdminResDashboardPage />} />
            <Route path="dashboard/evenements" element={<AdminEvtDashboardPage />} />
            <Route path="locaux" element={<GestionLocauxPage />} />
            <Route path="reservations" element={<GestionReservationsPage />} />
            <Route path="evenements" element={<GestionEvenementsPage />} />
            <Route path="annonces" element={<GestionAnnoncesPage />} />
            <Route path="demandeurs" element={<GestionUsersPage />} />
            <Route path="stats" element={<StatsPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ErrorBoundary>
    </BrowserRouter>
  );
}