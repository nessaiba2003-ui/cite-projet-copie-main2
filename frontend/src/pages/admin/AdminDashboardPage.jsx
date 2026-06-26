import { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import toast from 'react-hot-toast';
import { Card, CardContent, CardTitle } from '@/components/ui/Card';
import Loading from '@/components/ui/Loading';
import reservationService from '@/services/reservationService';
import statsService from '@/services/statsService';
import { getPageContent } from '@/utils/helpers';
import { RESERVATION_STATUS } from '@/utils/constants';

/* ===== PALETTE PROFESSIONNELLE ===== */
const KPI_COLORS = {
  reservations: '#6366F1', // Indigo
  enAttente:    '#F59E0B', // Ambre
  validees:     '#10B981', // Émeraude
  evenements:   '#8B5CF6', // Violet
};

const STATUS_COLORS = {
  'En attente': '#F59E0B',  // Ambre
  'Validées':   '#10B981',  // Émeraude
  'Rejetées':   '#F43F5E',  // Rose
  'Annulées':   '#64748B',  // Slate
};

const BAR_COLOR = '#0EA5E9';   // Sarcelle (clair, lisible)
const BAR_COLOR_LIGHT = '#7DD3FC';

export default function AdminDashboardPage({ hideHeader = false }) {
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState({
    total: 0, enAttente: 0, validees: 0, evenements: 0,
  });
  const [barData, setBarData] = useState([]);
  const [pieData, setPieData] = useState([]);

  useEffect(() => {
    const now = new Date();
    const debut = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const fin = now.toISOString();

    Promise.all([
      reservationService.getAll(0, 100),
      statsService.getDashboard(debut, fin).catch(() => ({})),
    ])
      .then(([page, stats]) => {
        const list = getPageContent(page);
        const enAttente = list.filter((r) => r.statut === RESERVATION_STATUS.EN_ATTENTE).length;
        const validees = list.filter((r) =>
          [RESERVATION_STATUS.VALIDEE, RESERVATION_STATUS.CONFIRMEE].includes(r.statut),
        ).length;
        const rejetees = list.filter((r) => r.statut === RESERVATION_STATUS.REJETEE).length;
        const annulees = list.filter((r) => r.statut === RESERVATION_STATUS.ANNULEE).length;

        setKpis({
          total: list.length,
          enAttente,
          validees,
          evenements: stats.totalEvenements ?? 0,
        });

        setPieData(
          [
            { name: 'En attente', value: enAttente, color: STATUS_COLORS['En attente'] },
            { name: 'Validées', value: validees, color: STATUS_COLORS['Validées'] },
            { name: 'Rejetées', value: rejetees, color: STATUS_COLORS['Rejetées'] },
            { name: 'Annulées', value: annulees, color: STATUS_COLORS['Annulées'] },
          ].filter((d) => d.value > 0),
        );

        const occupation = stats.occupationLocaux ?? [];
        setBarData(
          occupation.map((o) => ({
            name: o.localCode || o.localNom || `Local #${o.localId}`,
            reservations: o.count,
          })),
        );
      })
      .catch(() => toast.error('Erreur chargement dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading label="Chargement du tableau de bord…" />;

  const kpisList = [
    { label: 'Réservations', value: kpis.total, color: KPI_COLORS.reservations, light: '#E0E7FF' },
    { label: 'En attente',  value: kpis.enAttente, color: KPI_COLORS.enAttente, light: '#FEF3C7' },
    { label: 'Validées',    value: kpis.validees, color: KPI_COLORS.validees, light: '#D1FAE5' },
    { label: 'Événements',  value: kpis.evenements, color: KPI_COLORS.evenements, light: '#EDE9FE' },
  ];

  return (
    <div className="space-y-5">
      {!hideHeader && (
        <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
          <div
            className="mb-2 h-1 w-16 rounded-full"
            style={{ background: 'linear-gradient(90deg, #6366F1, #8B5CF6, #06B6D4)' }}
          />
          <h1 className="font-display text-lg font-bold text-stone-800">Tableau de bord</h1>
          <p className="mt-0.5 text-xs text-stone-600">Vue d&apos;ensemble de l&apos;activité</p>
        </div>
      )}

      {/* KPI CARDS */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {kpisList.map((kpi) => (
          <Card
            key={kpi.label}
            className="relative overflow-hidden rounded-xl border-stone-200 bg-white shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
          >
            {/* Bande colorée à gauche */}
            <div
              className="absolute left-0 top-0 bottom-0 w-1"
              style={{ background: kpi.color }}
            />
            <CardContent className="py-3.5 pl-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-stone-600">{kpi.label}</p>
                  <p
                    className="mt-0.5 font-display text-2xl font-bold tabular-nums"
                    style={{ color: kpi.color }}
                  >
                    {kpi.value}
                  </p>
                </div>
                <div
                  className="h-9 w-9 rounded-lg flex items-center justify-center"
                  style={{ background: kpi.light }}
                >
                  <div
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ background: kpi.color }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* PIE CHART : Statuts */}
        <Card className="rounded-xl border-stone-200 bg-white shadow-sm">
          <CardContent className="pt-4">
            <div className="mb-3 flex items-center gap-2">
              <div
                className="h-3 w-3 rounded-full"
                style={{ background: '#6366F1' }}
              />
              <CardTitle className="text-stone-800 text-sm">
                Réservations par statut
              </CardTitle>
            </div>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={75}
                    innerRadius={45}
                    paddingAngle={3}
                    stroke="#fff"
                    strokeWidth={2}
                  >
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #E2E8F0',
                      borderRadius: '8px',
                      fontSize: '11px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                    iconType="circle"
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="py-8 text-center text-xs text-stone-500 italic">
                Aucune donnée
              </p>
            )}
          </CardContent>
        </Card>

        {/* BAR CHART : Occupation locaux */}
        <Card className="rounded-xl border-stone-200 bg-white shadow-sm">
          <CardContent className="pt-4">
            <div className="mb-3 flex items-center gap-2">
              <div
                className="h-3 w-3 rounded-full"
                style={{ background: BAR_COLOR }}
              />
              <CardTitle className="text-stone-800 text-sm">
                Occupation par local
              </CardTitle>
            </div>
            {barData.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={barData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <defs>
                    <linearGradient id="barGradTeal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={BAR_COLOR} stopOpacity={1} />
                      <stop offset="100%" stopColor={BAR_COLOR_LIGHT} stopOpacity={0.7} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#F1F5F9" strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10, fill: '#64748B' }}
                    axisLine={{ stroke: '#E2E8F0' }}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: '#64748B' }}
                    axisLine={{ stroke: '#E2E8F0' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #E2E8F0',
                      borderRadius: '8px',
                      fontSize: '11px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    }}
                    cursor={{ fill: '#F1F5F9' }}
                  />
                  <Bar
                    dataKey="reservations"
                    fill="url(#barGradTeal)"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="py-8 text-center text-xs text-stone-500 italic">
                Aucune donnée
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}