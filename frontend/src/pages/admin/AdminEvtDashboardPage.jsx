import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, Megaphone, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { Card, CardContent, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Loading from '@/components/ui/Loading';
import evenementService from '@/services/evenementService';
import { getPageContent } from '@/utils/helpers';
import { PUBLICATION_STATUS, ROLES } from '@/utils/constants';
import useAuth from '@/hooks/useAuth';

const quickLinks = [
  {
    to: '/admin/evenements',
    label: 'Gérer les événements',
    icon: CalendarDays,
    description: 'Créer, publier et archiver',
  },
  {
    to: '/admin/annonces',
    label: 'Publier des annonces',
    icon: Megaphone,
    description: 'Communications et actualités',
  },
];

export default function AdminEvtDashboardPage() {
  const { role } = useAuth();
  const canManage = role === ROLES.SUPER_ADMIN || role === ROLES.ADMIN_EVT;
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState({ total: 0, publies: 0, brouillons: 0 });

  useEffect(() => {
    if (!canManage) {
      evenementService
        .getPage(0, 100)
        .then((page) => {
          const list = getPageContent(page);
          setKpis({ total: list.length, publies: list.length, brouillons: 0 });
        })
        .catch(() => toast.error('Erreur chargement des événements'))
        .finally(() => setLoading(false));
      return;
    }

    evenementService
      .getAllAdmin(0, 100)
      .then((page) => {
        const list = getPageContent(page);
        setKpis({
          total: list.length,
          publies: list.filter((e) => e.statutPublication === PUBLICATION_STATUS.PUBLIE).length,
          brouillons: list.filter((e) => e.statutPublication === PUBLICATION_STATUS.BROUILLON).length,
        });
      })
      .catch(() => toast.error('Erreur chargement des événements'))
      .finally(() => setLoading(false));
  }, [canManage]);

  if (loading) return <Loading label="Chargement du tableau de bord…" />;

  return (
    <>
      <header className="mb-5 rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
        <div
          className="mb-2 h-1 w-16 rounded-full"
          style={{ background: 'linear-gradient(90deg, #9B8EC4, #F2CC8F, #E07A5F)' }}
        />
        <h1 className="font-display text-lg font-bold text-stone-800">
          Tableau de bord — Événements
        </h1>
        <p className="mt-0.5 text-xs text-stone-600">
          Inscriptions, publications et annonces de la cité
        </p>
      </header>

      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        {[
          { label: 'Événements', value: kpis.total, color: '#E07A5F' },
          { label: 'Publiés', value: kpis.publies, color: '#5BBFA0' },
          { label: 'Brouillons', value: kpis.brouillons, color: '#9B8EC4' },
        ].map(({ label, value, color }) => (
          <Card key={label} className="rounded-xl border-stone-200 bg-white shadow-sm">
            <CardContent className="py-3.5">
              <p className="text-xs text-stone-600">{label}</p>
              <p className="mt-0.5 font-display text-xl font-bold" style={{ color }}>
                {value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {canManage && (
        <section className="grid gap-3 sm:grid-cols-2">
          {quickLinks.map(({ to, label, icon: Icon, description }) => (
            <Card
              key={to}
              hover
              className="rounded-xl border-stone-200 bg-white shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
            >
              <CardContent className="flex h-full flex-col gap-2 py-3.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E07A5F]/10">
                  <Icon className="h-5 w-5 text-[#E07A5F]" />
                </div>
                <div>
                  <CardTitle className="text-sm text-stone-800">{label}</CardTitle>
                  <p className="mt-0.5 text-[11px] text-stone-600">{description}</p>
                </div>
                <Link to={to} className="mt-auto">
                  <Button
                    size="sm"
                    className="w-full bg-[#5BBFA0] hover:bg-[#4AA88D] text-white border-transparent text-xs"
                  >
                    Ouvrir
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </section>
      )}

      {canManage && (
        <Card className="mt-5 rounded-xl border-stone-200 bg-white shadow-sm">
          <CardContent className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#9B8EC4]/15">
              <Users className="h-5 w-5 text-[#9B8EC4]" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-sm text-stone-800">Inscriptions aux événements</p>
              <p className="text-xs text-stone-600">
                Consultez et exportez les inscrits depuis la fiche de chaque événement.
              </p>
            </div>
            <Link to="/admin/evenements" className="shrink-0">
              <Button className="bg-[#E07A5F] hover:bg-[#C96A50] text-white border-transparent text-xs">
                Voir les événements
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </>
  );
}