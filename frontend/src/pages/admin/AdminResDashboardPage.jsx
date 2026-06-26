import { Link } from 'react-router-dom';
import { Building2, BarChart3, ClipboardList, CalendarDays } from 'lucide-react';
import { Card, CardContent, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import AdminDashboardPage from './AdminDashboardPage';

/* ===== NOUVELLE PALETTE COHÉRENTE ===== */
const COLORS = {
  primary: '#818CF8',    // Indigo doux (Principal)
  secondary: '#C084FC',  // Violet clair
  accent: '#F472B6',     // Rose "Milk"
  success: '#34D399',    // Menthe
  warning: '#FDBA74',    // Pêche (Remplace l'orange)
};

const quickLinks = [
  {
    to: '/admin/reservations',
    label: 'Gérer les réservations',
    icon: ClipboardList,
    description: 'Confirmer, rejeter, créer ou annuler',
    color: COLORS.primary,
    bg: '#E0E7FF',
  },
  {
    to: '/admin/locaux',
    label: 'Gérer les locaux',
    icon: Building2,
    description: 'Capacités, statuts et médias',
    color: COLORS.accent,
    bg: '#FCE7F3',
  },
  {
    to: '/admin/stats',
    label: "Statistiques d'occupation",
    icon: BarChart3,
    description: 'Locaux les plus/moins réservés, organismes',
    color: COLORS.secondary,
    bg: '#EDE9FE',
  },
  {
    to: '/admin/dashboard/evenements',
    label: 'Vue événements',
    icon: CalendarDays,
    description: 'Activité événementielle de la cité',
    color: COLORS.success,
    bg: '#D1FAE5',
  },
];

export default function AdminResDashboardPage() {
  return (
    <>
      <header className="mb-5 rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
        <div
          className="mb-2 h-1 w-16 rounded-full"
          style={{ background: 'linear-gradient(90deg, #818CF8, #C084FC, #22D3EE)' }}
        />
        <h1 className="font-display text-lg font-bold text-stone-800">
          Tableau de bord — Réservations
        </h1>
        <p className="mt-0.5 text-xs text-stone-600">
          Occupation des locaux et historique des réservations (100 % gratuites)
        </p>
      </header>

      <section className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {quickLinks.map(({ to, label, icon: Icon, description, color, bg }) => (
          <Card
            key={to}
            hover
            className="rounded-xl border-stone-200 bg-white shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
          >
            <CardContent className="flex h-full flex-col gap-2 py-3.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: bg }}>
                <Icon className="h-5 w-5" style={{ color }} />
              </div>
              <div>
                <CardTitle className="text-sm text-stone-800">{label}</CardTitle>
                <p className="mt-0.5 text-[11px] text-stone-600">{description}</p>
              </div>
              <Link to={to} className="mt-auto">
                <Button
                  size="sm"
                  className="w-full text-white border-transparent text-xs hover:opacity-90 transition-opacity"
                  style={{ background: color }}
                >
                  Ouvrir
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </section>

      <section>
        <h2 className="mb-3 font-display text-sm font-semibold text-stone-800">
          Aperçu des réservations
        </h2>
        <AdminDashboardPage hideHeader />
      </section>
    </>
  );
}