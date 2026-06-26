import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  Menu,
  X,
  LogIn,
  LogOut,
  User,
  LayoutDashboard,
  ChevronDown,
  Compass,
} from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import NotificationBell from './NotificationBell';
import { cn } from '../../utils/helpers';

const publicLinks = [
  { to: '/', label: 'Accueil' },
  { to: '/structures', label: 'Structures' },
  { to: '/evenements', label: 'Événements' },
  { to: '/annonces', label: 'Annonces' },
  { to: '/partenariat', label: 'Partenariat' },
  { to: '/contact', label: 'Contact' },
  { to: '/locaux', label: 'Locaux' },
];

export default function Navbar() {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { isAuthenticated, user, isAdmin, logout, getDashboardPath } = useAuth();
  const userMenuRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!userMenuOpen) return;
    const onClick = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [userMenuOpen]);

  const navLinkClass = ({ isActive }) =>
    cn(
      'relative px-1 py-2 text-[13px] xl:text-sm font-semibold transition-colors duration-200 whitespace-nowrap',
      isActive ? 'text-[#C96A50]' : 'text-stone-600 hover:text-stone-900',
      'after:absolute after:bottom-0 after:left-1/2 after:h-[3px] after:rounded-full after:bg-gradient-to-r after:from-[#E07A5F] after:to-[#F2CC8F] after:transition-all after:duration-300',
      isActive
        ? 'after:w-full after:-translate-x-1/2'
        : 'after:w-0 after:-translate-x-1/2',
    );

  const handleDashboard = () => {
    setUserMenuOpen(false);
    navigate(getDashboardPath());
  };

  const handleLogout = () => {
    setUserMenuOpen(false);
    logout();
  };

  return (
    <header
      className={cn(
        'sticky top-0 z-40 w-full transition-all duration-300',
        scrolled
          ? 'bg-white/90 backdrop-blur-xl shadow-[0_6px_24px_-12px_rgba(60,40,30,0.12)] border-b border-white/60'
          : 'bg-white/70 backdrop-blur-md border-b border-transparent',
      )}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-10 left-1/4 h-32 w-64 rounded-full bg-[#E07A5F]/8 blur-3xl" />
        <div className="absolute -top-10 right-1/4 h-32 w-64 rounded-full bg-[#9B8EC4]/8 blur-3xl" />
      </div>

      <nav className="relative mx-auto flex max-w-7xl items-center justify-between gap-3 px-3 py-3 sm:px-4 lg:px-6">
        {/* LOGO AGRANDI — texte supprimé (l'accueil + le logo suffisent) */}
        <Link
          to="/"
          className="group flex items-center shrink-0"
          aria-label="Retour à l'accueil"
        >
          <img
            src="/images/logo.png"
            alt="Cité d'Innovation - Université Cadi Ayyad"
            className="h-16 xl:h-20 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
          />
        </Link>

        {/* LIENS DESKTOP */}
        <div className="hidden lg:flex items-center gap-4 xl:gap-6 min-w-0">
          {publicLinks.map((link) => (
            <NavLink key={link.to} to={link.to} className={navLinkClass}>
              {link.label}
            </NavLink>
          ))}
        </div>

        {/* ACTIONS DROITE */}
        <div className="hidden lg:flex items-center gap-2 shrink-0">
          {/* BOUTON VISITE IMMERSIVE */}
          <Link to="/immersion">
            <button
              type="button"
              className="group relative inline-flex items-center gap-1.5 rounded-full border border-[#E07A5F]/40 bg-white/80 backdrop-blur-sm px-4 py-2 text-xs xl:text-[13px] font-semibold text-[#C96A50] shadow-sm hover:bg-gradient-to-r hover:from-[#E07A5F] hover:to-[#E8956F] hover:text-white hover:border-transparent hover:shadow-lg hover:shadow-[#E07A5F]/40 hover:-translate-y-0.5 transition-all duration-300 whitespace-nowrap"
              title="Visite immersive"
            >
              <Compass className="h-3.5 w-3.5 transition-transform duration-500 group-hover:rotate-180" />
              <span className="hidden xl:inline">Visite immersive</span>
              <span className="xl:hidden">Immersion</span>
            </button>
          </Link>

          {isAuthenticated ? (
            <>
              <NotificationBell />

              <div className="relative" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => setUserMenuOpen((v) => !v)}
                  className="inline-flex items-center gap-1.5 rounded-full bg-white/80 backdrop-blur-sm border border-stone-200 px-2.5 py-1.5 hover:bg-white hover:border-stone-300 transition-all"
                  aria-label="Menu utilisateur"
                  aria-expanded={userMenuOpen}
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-[#9B8EC4] to-[#5BBFA0] text-white shrink-0">
                    <User className="h-3.5 w-3.5" />
                  </div>
                  <span className="hidden xl:inline text-xs font-semibold text-stone-700 max-w-[100px] truncate">
                    {user?.nomComplet?.split(' ')[0] || 'Compte'}
                  </span>
                  <ChevronDown
                    className={cn(
                      'h-3.5 w-3.5 text-stone-500 transition-transform duration-200',
                      userMenuOpen && 'rotate-180',
                    )}
                  />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-64 rounded-2xl border border-stone-200 bg-white shadow-xl shadow-stone-200/60 overflow-hidden animate-fade-in z-50">
                    <div className="bg-gradient-to-br from-[#FEF4F1] to-[#FFF8F3] px-4 py-3 border-b border-stone-100">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#9B8EC4] to-[#5BBFA0] text-white shadow-md">
                          <User className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-stone-900 truncate">
                            {user?.nomComplet || 'Mon compte'}
                          </p>
                          {isAdmin && (
                            <p className="text-[10px] font-bold uppercase tracking-wide text-[#9B8EC4]">
                              Administrateur
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="p-2 space-y-1">
                      <button
                        type="button"
                        onClick={handleDashboard}
                        className="w-full inline-flex items-center gap-3 rounded-xl bg-gradient-to-r from-[#5BBFA0] to-[#7DD4B8] px-3 py-2.5 text-sm font-semibold text-white shadow-md shadow-[#5BBFA0]/25 transition-all hover:shadow-lg hover:shadow-[#5BBFA0]/40 hover:-translate-y-0.5"
                      >
                        <LayoutDashboard className="h-4 w-4" />
                        Tableau de bord
                      </button>

                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full inline-flex items-center gap-3 rounded-xl bg-white border border-stone-200 px-3 py-2.5 text-sm font-semibold text-red-600 transition-all hover:bg-red-50 hover:border-red-300"
                      >
                        <LogOut className="h-4 w-4" />
                        Déconnexion
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <Link to="/login">
              <button
                type="button"
                className="inline-flex items-center gap-1.5 rounded-full border border-stone-300 bg-white/80 backdrop-blur-sm px-4 py-2 text-xs xl:text-[13px] font-semibold text-stone-800 transition-all duration-200 hover:bg-white hover:border-[#E07A5F] hover:text-[#C96A50] hover:shadow-md whitespace-nowrap"
              >
                <LogIn className="h-3.5 w-3.5" />
                Connexion
              </button>
            </Link>
          )}
        </div>

        <button
          type="button"
          className="lg:hidden rounded-full p-2.5 text-stone-700 bg-white/70 backdrop-blur-sm border border-stone-200/70 hover:bg-white hover:text-[#E07A5F] transition-all shrink-0"
          onClick={() => setMobileOpen((o) => !o)}
          aria-label={mobileOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {mobileOpen && (
        <div className="lg:hidden border-t border-stone-200/60 bg-white/95 backdrop-blur-xl px-4 py-5 space-y-2 animate-fade-in">
          {/* BOUTON VISITE IMMERSIVE MOBILE */}
          <Link to="/immersion" onClick={() => setMobileOpen(false)} className="block">
            <button
              type="button"
              className="group w-full inline-flex items-center justify-center gap-2 rounded-full border-2 border-[#E07A5F]/50 bg-gradient-to-r from-[#FEF4F1] to-white px-4 py-2.5 text-sm font-semibold text-[#C96A50] hover:from-[#E07A5F] hover:to-[#E8956F] hover:text-white hover:border-transparent hover:shadow-md transition-all"
            >
              <Compass className="h-4 w-4 transition-transform duration-500 group-hover:rotate-180" />
              Visite immersive
            </button>
          </Link>

          <div className="pt-2">
            {publicLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  cn(
                    'block rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors',
                    isActive
                      ? 'bg-gradient-to-r from-[#E07A5F]/10 to-[#F2CC8F]/10 text-[#C96A50]'
                      : 'text-stone-700 hover:bg-stone-50',
                  )
                }
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          {isAuthenticated ? (
            <div className="pt-3 border-t border-stone-200/60 space-y-2">
              <div className="flex items-center gap-2 px-3 py-2 text-sm text-stone-700">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#9B8EC4] to-[#5BBFA0] text-white">
                  <User className="h-4 w-4" />
                </div>
                <span className="font-semibold truncate">{user?.nomComplet || 'Mon compte'}</span>
                {isAdmin && (
                  <span className="text-[10px] font-bold uppercase text-[#9B8EC4]">Admin</span>
                )}
              </div>

              <Link to={getDashboardPath()} onClick={() => setMobileOpen(false)} className="block">
                <button
                  type="button"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#5BBFA0] to-[#7DD4B8] px-4 py-2.5 text-sm font-semibold text-white"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Tableau de bord
                </button>
              </Link>

              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  logout();
                }}
                className="w-full inline-flex items-center justify-center gap-2 rounded-full border border-red-200 bg-red-50/50 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
                Déconnexion
              </button>
            </div>
          ) : (
            <Link to="/login" onClick={() => setMobileOpen(false)} className="block">
              <button
                type="button"
                className="w-full inline-flex items-center justify-center gap-2 rounded-full border border-stone-300 bg-white px-4 py-2.5 text-sm font-semibold text-stone-800"
              >
                <LogIn className="h-4 w-4" />
                Connexion
              </button>
            </Link>
          )}
        </div>
      )}
    </header>
  );
}