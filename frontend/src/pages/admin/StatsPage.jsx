import { useEffect, useMemo, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend, PieChart, Pie, Cell, AreaChart, Area,
} from 'recharts';
import { motion } from 'framer-motion';
import {
  BarChart3, Calendar, Users, TrendingUp, Building2, FileSpreadsheet,
  FileText, Filter, PieChart as PieIcon, Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Loading from '@/components/ui/Loading';
import statsService from '@/services/statsService';

/* ============ NOUVELLE PALETTE PROFESSIONNELLE DOUCE ============ */
const PRO_COLORS = {
  indigo:  '#818CF8', // Indigo doux
  teal:    '#22D3EE', // Cyan doux
  violet:  '#C084FC', // Violet clair
  amber:   '#FDBA74', // Pêche (Remplace l'orange agressif)
  emerald: '#34D399', // Menthe
  rose:    '#F472B6', // Rose "Milk"
  cyan:    '#67E8F9', // Cyan clair
  slate:   '#64748B', // Slate
};

/* Palette pour les graphes en cercles (Donuts) - Couleurs distinctes */
const CHART_COLORS = [
  '#F472B6', // 1. Rose "Milk"
  '#818CF8', // 2. Indigo doux
  '#34D399', // 3. Menthe
  '#FDBA74', // 4. Pêche
  '#A78BFA', // 5. Lavande
  '#22D3EE', // 6. Cyan
  '#F87171', // 7. Rouge doux
  '#FBBF24', // 8. Jaune doux
];

function downloadBlob(blob, filename) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

function buildStackedSeries(rows, keyField, valueField = 'count', topN = 5) {
  const totalByKey = new Map();
  for (const r of rows) {
    const k = r[keyField] ?? 'Non renseigné';
    const v = Number(r[valueField] ?? 0);
    totalByKey.set(k, (totalByKey.get(k) ?? 0) + v);
  }
  const topKeys = [...totalByKey.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([k]) => k);

  const byPeriod = new Map();
  for (const r of rows) {
    const period = r.period;
    const k = r[keyField] ?? 'Non renseigné';
    const v = Number(r[valueField] ?? 0);
    if (!byPeriod.has(period)) byPeriod.set(period, { period });
    const obj = byPeriod.get(period);
    if (topKeys.includes(k)) obj[k] = (obj[k] ?? 0) + v;
    else obj.Autres = (obj.Autres ?? 0) + v;
  }

  const data = [...byPeriod.values()].sort((a, b) =>
    String(a.period).localeCompare(String(b.period)),
  );
  return { data, keys: [...topKeys, 'Autres'] };
}

function nicePercent(part, total) {
  if (!total) return '0%';
  return `${Math.round((part / total) * 100)}%`;
}

function ProTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-lg">
      {label != null && (
        <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-700">
          {label}
        </p>
      )}
      <div className="space-y-1">
        {payload.map((p) => (
          <div
            key={p.dataKey ?? p.name}
            className="flex items-center justify-between gap-3 text-[10px]"
          >
            <div className="flex items-center gap-1.5">
              <span
                className="h-2 w-2 rounded-full"
                style={{ background: p.color || p.fill }}
              />
              <span className="font-medium text-slate-600">{p.name ?? p.dataKey}</span>
            </div>
            <span className="font-bold text-slate-900 tabular-nums">{String(p.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatSection({ title, subtitle, icon: Icon, accentColor = PRO_COLORS.indigo, children }) {
  return (
    <div
      className="overflow-hidden rounded-xl border border-slate-200 bg-white transition-all duration-300"
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = `0 12px 32px -12px ${accentColor}30`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '';
      }}
    >
      {/* Bande pleine en haut, plus sobre */}
      <div className="h-1" style={{ background: accentColor }} />
      <div className="p-4">
        <div className="mb-4 flex items-start gap-2.5">
          {Icon && (
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
              style={{
                background: `${accentColor}15`,
                color: accentColor,
              }}
            >
              <Icon className="h-4 w-4" />
            </div>
          )}
          <div>
            <h3 className="font-display text-sm font-bold text-slate-900">{title}</h3>
            {subtitle && <p className="mt-0.5 text-[11px] text-slate-500">{subtitle}</p>}
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}

function KpiCard({ label, value, sublabel, icon: Icon, color, lightBg, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <div
        className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white transition-all duration-300 hover:-translate-y-0.5 h-full"
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = `0 14px 32px -12px ${color}40, 0 0 0 1px ${color}30`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = '';
        }}
      >
        {/* Bande verticale colorée à gauche */}
        <div
          className="absolute left-0 top-0 bottom-0 w-1"
          style={{ background: color }}
        />
        <div className="p-4 pl-5 flex items-center gap-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
            style={{ background: lightBg, color }}
          >
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 truncate">
              {label}
            </p>
            <p
              className="font-display text-2xl font-bold leading-none tabular-nums"
              style={{ color }}
            >
              {value}
            </p>
            {sublabel && (
              <p className="mt-0.5 text-[9px] font-medium text-slate-500">{sublabel}</p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function DonutCard({ title, subtitle, data, icon: Icon, accentColor = PRO_COLORS.indigo, colorPalette = CHART_COLORS }) {
  const total = useMemo(() => data.reduce((s, d) => s + Number(d.value ?? 0), 0), [data]);

  return (
    <StatSection
      title={title}
      subtitle={subtitle}
      icon={Icon || PieIcon}
      accentColor={accentColor}
    >
      {data.length === 0 ? (
        <div className="py-8 text-center">
          <PieIcon className="mx-auto h-8 w-8 text-slate-300 mb-1.5" />
          <p className="text-xs text-slate-500 italic">Aucune donnée</p>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[220px,1fr]">
          <div className="relative">
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip content={<ProTooltip />} />
                  <Pie
                    data={data}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    stroke="#fff"
                    strokeWidth={2}
                  >
                    {data.map((_, idx) => (
                      <Cell key={idx} fill={colorPalette[idx % colorPalette.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <p className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Total</p>
              <p
                className="font-display text-2xl font-bold tabular-nums"
                style={{ color: accentColor }}
              >
                {total}
              </p>
            </div>
          </div>

          <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
            {data.map((d, idx) => {
              const pct = total ? (Number(d.value) / total) * 100 : 0;
              const cellColor = colorPalette[idx % colorPalette.length];
              return (
                <div
                  key={d.name}
                  className="rounded-lg border border-slate-200 bg-slate-50/50 px-2.5 py-2 hover:bg-white hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-sm"
                        style={{ backgroundColor: cellColor }}
                      />
                      <span className="text-xs font-semibold text-slate-800 truncate">
                        {d.name}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-slate-900 shrink-0 tabular-nums">
                      {d.value}{' '}
                      <span className="text-[10px] font-medium text-slate-500">
                        ({nicePercent(d.value, total)})
                      </span>
                    </div>
                  </div>

                  <div className="mt-1 h-1 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-1 rounded-full transition-all duration-700"
                      style={{
                        width: `${pct}%`,
                        background: cellColor,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </StatSection>
  );
}

export default function StatsPage() {
  const [debut, setDebut] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return d.toISOString().slice(0, 16);
  });
  const [fin, setFin] = useState(() => new Date().toISOString().slice(0, 16));
  const [granularity, setGranularity] = useState('MONTH');

  const [stats, setStats] = useState(null);
  const [localsTs, setLocalsTs] = useState([]);
  const [orgTs, setOrgTs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingExport, setLoadingExport] = useState(false);

  const load = () => {
    setLoading(true);
    const debutIso = new Date(debut).toISOString();
    const finIso = new Date(fin).toISOString();

    Promise.all([
      statsService.getDashboard(debutIso, finIso),
      statsService.getLocalTimeSeries(debutIso, finIso, granularity),
      statsService.getOrganismeTimeSeries(debutIso, finIso, granularity),
    ])
      .then(([dash, localTS, orgTS]) => {
        setStats(dash);
        setLocalsTs(localTS?.rows ?? []);
        setOrgTs(orgTS?.rows ?? []);
      })
      .catch(() => toast.error('Erreur chargement statistiques'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const barLocaux = (stats?.occupationLocaux ?? []).map((o) => ({
    name: o.localCode || o.localNom || `#${o.localId}`,
    count: Number(o.count ?? 0),
  }));

  const barOrganismes = (stats?.participationOrganismes ?? []).map((o) => ({
    name: o.organisme?.length > 18 ? `${o.organisme.slice(0, 16)}…` : o.organisme,
    reservations: Number(o.reservations ?? 0),
    presence: Number(o.demandeursDistincts ?? 0),
  }));

  const localsStack = useMemo(
    () =>
      buildStackedSeries(
        localsTs.map((r) => ({ ...r, localKey: r.localCode || r.localNom || `#${r.localId}` })),
        'localKey',
        'count',
        5,
      ),
    [localsTs],
  );

  const orgStack = useMemo(
    () =>
      buildStackedSeries(
        orgTs.map((r) => ({ ...r, orgKey: r.organisme || 'Non renseigné' })),
        'orgKey',
        'count',
        5,
      ),
    [orgTs],
  );

  const donutOrganismes = useMemo(() => {
    const rows = stats?.participationOrganismes ?? [];
    const top = rows.slice(0, 8).map((r) => ({
      name: r.organisme || 'Non renseigné',
      value: Number(r.reservations ?? 0),
    }));
    const others = rows.slice(8).reduce((s, r) => s + Number(r.reservations ?? 0), 0);
    if (others > 0) top.push({ name: 'Autres', value: others });
    return top.filter((x) => x.value > 0);
  }, [stats]);

  const donutLocaux = useMemo(() => {
    const rows = stats?.occupationLocaux ?? [];
    const top = rows.slice(0, 8).map((r) => ({
      name: r.localCode || r.localNom || `#${r.localId}`,
      value: Number(r.count ?? 0),
    }));
    const others = rows.slice(8).reduce((s, r) => s + Number(r.count ?? 0), 0);
    if (others > 0) top.push({ name: 'Autres', value: others });
    return top.filter((x) => x.value > 0);
  }, [stats]);

  const donutTypesEvts = useMemo(() => {
    const rows = stats?.typesEvenements ?? [];
    return rows
      .map((r) => ({
        name: r.type || 'AUTRE',
        value: Number(r.count ?? 0),
      }))
      .filter((x) => x.value > 0);
  }, [stats]);

  const trendReservations = useMemo(() => {
    const map = new Map();
    for (const r of localsTs) {
      const p = r.period;
      map.set(p, (map.get(p) ?? 0) + Number(r.count ?? 0));
    }
    return [...map.entries()]
      .sort((a, b) => String(a[0]).localeCompare(String(b[0])))
      .map(([period, count]) => ({ period, count }));
  }, [localsTs]);

  const exportExcel = async () => {
    try {
      setLoadingExport(true);
      const debutIso = new Date(debut).toISOString();
      const finIso = new Date(fin).toISOString();
      const res = await statsService.exportExcel(debutIso, finIso, granularity);
      downloadBlob(res.data, `rapport-stats-${Date.now()}.xlsx`);
      toast.success('Fichier Excel téléchargé');
    } catch {
      toast.error('Erreur export Excel');
    } finally {
      setLoadingExport(false);
    }
  };

  const exportPdf = async () => {
    try {
      setLoadingExport(true);
      const debutIso = new Date(debut).toISOString();
      const finIso = new Date(fin).toISOString();
      const res = await statsService.exportPdf(debutIso, finIso, granularity);
      downloadBlob(res.data, `rapport-stats-${Date.now()}.pdf`);
      toast.success('Fichier PDF téléchargé');
    } catch {
      toast.error('Erreur export PDF');
    } finally {
      setLoadingExport(false);
    }
  };

  return (
    <div className="relative space-y-4">
      {/* HEADER */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div
          className="h-1"
          style={{
            background: `linear-gradient(90deg, ${PRO_COLORS.indigo}, ${PRO_COLORS.violet}, ${PRO_COLORS.cyan})`,
          }}
        />
        <div className="p-4 sm:p-5">
          <div className="flex flex-wrap items-start gap-3">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
              style={{ background: `${PRO_COLORS.indigo}15`, color: PRO_COLORS.indigo }}
            >
              <BarChart3 className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                style={{
                  background: `${PRO_COLORS.indigo}10`,
                  color: PRO_COLORS.indigo,
                }}
              >
                <Sparkles className="h-3 w-3" />
                Analytics
              </span>
              <h1 className="mt-1.5 font-display text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                Statistiques
              </h1>
              <p className="mt-0.5 text-xs text-slate-600">
                Participation, événements, partenaires et occupation des locaux
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* FILTRES */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="p-4">
          <div className="mb-3 flex items-center gap-1.5">
            <Filter className="h-3.5 w-3.5 text-slate-500" />
            <h2 className="font-display text-xs font-bold uppercase tracking-wider text-slate-700">
              Filtres &amp; Export
            </h2>
          </div>

          <div className="grid gap-3 lg:grid-cols-[1fr_1fr_180px_auto]">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Début</label>
              <input
                type="datetime-local"
                value={debut}
                onChange={(e) => setDebut(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Fin</label>
              <input
                type="datetime-local"
                value={fin}
                onChange={(e) => setFin(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Granularité</label>
              <select
                className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                value={granularity}
                onChange={(e) => setGranularity(e.target.value)}
              >
                <option value="MONTH">Par mois</option>
                <option value="WEEK_ISO">Par semaine (ISO)</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                type="button"
                onClick={load}
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 disabled:opacity-50"
                style={{ background: PRO_COLORS.indigo }}
              >
                {loading ? 'Chargement…' : 'Appliquer'}
              </button>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={exportExcel}
              disabled={loadingExport}
              className="inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 disabled:opacity-50"
              style={{ background: PRO_COLORS.emerald }}
            >
              <FileSpreadsheet className="h-3.5 w-3.5" />
              {loadingExport ? 'Export…' : 'Excel'}
            </button>
            <button
              type="button"
              onClick={exportPdf}
              disabled={loadingExport}
              className="inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 disabled:opacity-50"
              style={{ background: PRO_COLORS.violet }}
            >
              <FileText className="h-3.5 w-3.5" />
              {loadingExport ? 'Export…' : 'PDF'}
            </button>
          </div>
        </div>
      </div>

      {loading && !stats ? (
        <Loading label="Chargement…" />
      ) : (
        <>
          {/* KPI CARDS */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard
              label="Réservations (période)"
              value={stats?.totalReservations ?? 0}
              icon={Calendar}
              color={PRO_COLORS.indigo}
              lightBg="#E0E7FF"
              delay={0}
            />
            <KpiCard
              label="Événements"
              value={stats?.totalEvenements ?? 0}
              sublabel={`${stats?.evenementsPublies ?? 0} publiés`}
              icon={Sparkles}
              color={PRO_COLORS.violet}
              lightBg="#EDE9FE"
              delay={0.08}
            />
            <KpiCard
              label="Inscriptions événements"
              value={stats?.inscriptionsEvenements ?? 0}
              icon={Users}
              color={PRO_COLORS.cyan}
              lightBg="#CFFAFE"
              delay={0.16}
            />
            <KpiCard
              label="Présences estimées"
              value={stats?.presencesCite ?? 0}
              icon={TrendingUp}
              color={PRO_COLORS.emerald}
              lightBg="#D1FAE5"
              delay={0.24}
            />
          </div>

          {/* DONUTS */}
          <div className="grid gap-4 lg:grid-cols-2">
            <DonutCard
              title="Occupation par organisme"
              subtitle="Répartition des réservations (Top 8 + Autres)"
              data={donutOrganismes}
              icon={Building2}
              accentColor={PRO_COLORS.indigo}
            />
            <DonutCard
              title="Occupation des locaux"
              subtitle="Réservations par local (Top 8 + Autres)"
              data={donutLocaux}
              icon={Building2}
              accentColor={PRO_COLORS.teal}
            />
          </div>

          {donutTypesEvts.length > 0 && (
            <DonutCard
              title="Types d'événements"
              subtitle="Répartition par catégorie"
              data={donutTypesEvts}
              icon={PieIcon}
              accentColor={PRO_COLORS.violet}
            />
          )}

          {/* TENDANCE — AREA CHART */}
          <StatSection
            title={`Tendance des réservations ${granularity === 'WEEK_ISO' ? '(par semaine ISO)' : '(par mois)'}`}
            subtitle="Évolution dans le temps"
            icon={TrendingUp}
            accentColor={PRO_COLORS.indigo}
          >
            {trendReservations.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={trendReservations} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <defs>
                    <linearGradient id="proTrend" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={PRO_COLORS.indigo} stopOpacity={0.4} />
                      <stop offset="100%" stopColor={PRO_COLORS.indigo} stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#F1F5F9" strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="period"
                    tick={{ fontSize: 10, fill: '#64748B' }}
                    axisLine={{ stroke: '#E2E8F0' }}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 10, fill: '#64748B' }}
                    axisLine={{ stroke: '#E2E8F0' }}
                  />
                  <Tooltip content={<ProTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="count"
                    name="Réservations"
                    stroke={PRO_COLORS.indigo}
                    strokeWidth={2.5}
                    fill="url(#proTrend)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <p className="py-8 text-center text-xs italic text-slate-500">
                Aucune donnée
              </p>
            )}
          </StatSection>

          {/* OCCUPATION PAR LOCAL — BAR CHART */}
          <StatSection
            title="Occupation par local"
            subtitle="Total des réservations sur la période"
            icon={BarChart3}
            accentColor={PRO_COLORS.teal}
          >
            {barLocaux.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={barLocaux} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <defs>
                    <linearGradient id="barTeal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={PRO_COLORS.teal} stopOpacity={1} />
                      <stop offset="100%" stopColor="#7DD3FC" stopOpacity={0.7} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#F1F5F9" strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10, fill: '#64748B' }}
                    axisLine={{ stroke: '#E2E8F0' }}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 10, fill: '#64748B' }}
                    axisLine={{ stroke: '#E2E8F0' }}
                  />
                  <Tooltip content={<ProTooltip />} cursor={{ fill: '#F1F5F9' }} />
                  <Bar dataKey="count" fill="url(#barTeal)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="py-8 text-center text-xs italic text-slate-500">Aucune donnée</p>
            )}
          </StatSection>

          {/* STACKED BAR — LOCAUX TOP 5 */}
          <StatSection
            title={`Réservations par local — Top 5 (${granularity === 'WEEK_ISO' ? 'par semaine' : 'par mois'})`}
            subtitle="Évolution dans le temps avec empilement"
            icon={BarChart3}
            accentColor={PRO_COLORS.emerald}
          >
            {localsStack.data.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={localsStack.data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid stroke="#F1F5F9" strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="period"
                    tick={{ fontSize: 10, fill: '#64748B' }}
                    axisLine={{ stroke: '#E2E8F0' }}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 10, fill: '#64748B' }}
                    axisLine={{ stroke: '#E2E8F0' }}
                  />
                  <Tooltip content={<ProTooltip />} cursor={{ fill: '#F1F5F9' }} />
                  <Legend
                    wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                    iconType="circle"
                  />
                  {localsStack.keys.map((k, idx) => (
                    <Bar
                      key={k}
                      dataKey={k}
                      stackId="a"
                      fill={CHART_COLORS[idx % CHART_COLORS.length]}
                      radius={[5, 5, 0, 0]}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="py-8 text-center text-xs italic text-slate-500">Aucune donnée</p>
            )}
          </StatSection>

          {/* PARTICIPATION ORGANISMES — BAR DOUBLE */}
          <StatSection
            title="Participation des organismes"
            subtitle="Réservations et demandeurs distincts"
            icon={Building2}
            accentColor={PRO_COLORS.violet}
          >
            {barOrganismes.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={barOrganismes} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid stroke="#F1F5F9" strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 9, fill: '#64748B' }}
                    axisLine={{ stroke: '#E2E8F0' }}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 10, fill: '#64748B' }}
                    axisLine={{ stroke: '#E2E8F0' }}
                  />
                  <Tooltip content={<ProTooltip />} cursor={{ fill: '#F1F5F9' }} />
                  <Legend
                    wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                    iconType="circle"
                  />
                  <Bar
                    dataKey="reservations"
                    name="Réservations"
                    fill={PRO_COLORS.indigo}
                    radius={[5, 5, 0, 0]}
                  />
                  <Bar
                    dataKey="presence"
                    name="Demandeurs"
                    fill={PRO_COLORS.emerald}
                    radius={[5, 5, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="py-6 text-center text-xs italic text-slate-500">Aucune donnée</p>
            )}
          </StatSection>

          {/* STACKED BAR — ORGANISMES TOP 5 */}
          <StatSection
            title={`Réservations par organisme — Top 5 (${granularity === 'WEEK_ISO' ? 'par semaine' : 'par mois'})`}
            subtitle="Évolution avec empilement"
            icon={Building2}
            accentColor={PRO_COLORS.amber}
          >
            {orgStack.data.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={orgStack.data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid stroke="#F1F5F9" strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="period"
                    tick={{ fontSize: 10, fill: '#64748B' }}
                    axisLine={{ stroke: '#E2E8F0' }}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 10, fill: '#64748B' }}
                    axisLine={{ stroke: '#E2E8F0' }}
                  />
                  <Tooltip content={<ProTooltip />} cursor={{ fill: '#F1F5F9' }} />
                  <Legend
                    wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                    iconType="circle"
                  />
                  {orgStack.keys.map((k, idx) => (
                    <Bar
                      key={k}
                      dataKey={k}
                      stackId="a"
                      fill={CHART_COLORS[idx % CHART_COLORS.length]}
                      radius={[5, 5, 0, 0]}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="py-8 text-center text-xs italic text-slate-500">Aucune donnée</p>
            )}
          </StatSection>

          {/* TABLEAU ÉTABLISSEMENTS */}
          {(stats?.presenceEvenements ?? []).length > 0 && (
            <StatSection
              title="Présence aux événements"
              subtitle="Par établissement"
              icon={Users}
              accentColor={PRO_COLORS.cyan}
            >
              <div className="overflow-x-auto">
                <table className="min-w-full text-xs">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-3 py-2.5 text-left font-bold text-[10px] uppercase tracking-wider text-slate-600">
                        Établissement
                      </th>
                      <th className="px-3 py-2.5 text-right font-bold text-[10px] uppercase tracking-wider text-slate-600">
                        Inscriptions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(stats?.presenceEvenements ?? []).map((p, idx) => (
                      <tr key={idx} className="hover:bg-cyan-50/30 transition-colors">
                        <td className="px-3 py-2.5 font-medium text-slate-800">{p.etablissement}</td>
                        <td className="px-3 py-2.5 text-right">
                          <span
                            className="inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-[10px] font-bold tabular-nums"
                            style={{
                              background: `${PRO_COLORS.cyan}15`,
                              color: PRO_COLORS.cyan,
                            }}
                          >
                            {p.inscriptions}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </StatSection>
          )}
        </>
      )}
    </div>
  );
}