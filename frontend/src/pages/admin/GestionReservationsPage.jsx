import { useEffect, useMemo, useState } from 'react';
import {
  Check, X, Plus, Ban, Archive, Edit2, RotateCcw, ChevronDown, ChevronUp,
  Search, Link as LinkIcon, User, Calendar, FileText, Wrench, Users as UsersIcon,
  Building2, Mail, Phone, MapPin, Image as ImageIcon, Sparkles, FileSpreadsheet, Download,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import Loading from '@/components/ui/Loading';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import RejectDialog from '@/components/ui/RejectDialog';
import ReservationStatus from '@/components/features/reservations/ReservationStatus';
import reservationService from '@/services/reservationService';
import localService from '@/services/localService';
import statsService from '@/services/statsService';
import { getPageContent } from '@/utils/helpers';
import { formatDateTime } from '@/utils/formatters';
import { RESERVATION_STATUS } from '@/utils/constants';

const TYPE_OPTIONS = [
  { key: 'REUNION', label: 'Réunion' },
  { key: 'FORMATION', label: 'Formation' },
  { key: 'CONFERENCE', label: 'Conférence' },
  { key: 'AUTRE', label: 'Autre' },
];

const MODE_OPTIONS = [
  { key: '', label: '—' },
  { key: 'Gratuit', label: 'Gratuit' },
  { key: 'Convention', label: 'Convention' },
  { key: 'Autre', label: 'Autre' },
];

const emptyForm = {
  demandeurNom: '', demandeurPrenom: '', demandeurEmail: '', demandeurTelephone: '',
  demandeurOrganisme: '', localId: '', dateDebut: '', dateFin: '', nombreParticipants: '',
  motif: '', validerImmediatement: true, typeEvenement: 'REUNION', publicRecu: '',
  modeReglement: 'Gratuit', programmeAfficheUrl: '', logoOrganismeUrl: '',
};

function safeUrl(u) {
  if (!u) return '';
  return String(u).trim();
}

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

function parseMotif(motif) {
  if (!motif || typeof motif !== 'string') return { sections: {}, raw: motif || '' };
  const sections = {};
  const lines = motif.split('\n').map((l) => l.trim());
  let currentSection = null;
  for (const line of lines) {
    if (!line) continue;
    const sectionMatch = line.match(/^={2,}\s*(.+?)\s*={2,}$/);
    if (sectionMatch) {
      currentSection = sectionMatch[1].toLowerCase().replace(/\s+/g, '_').replace(/_+/g, '_');
      sections[currentSection] = {};
      continue;
    }
    const kvMatch = line.match(/^([^:]+):\s*(.+)$/);
    if (kvMatch && currentSection) {
      const key = kvMatch[1].trim().toLowerCase().replace(/[\s'"]+/g, '_').replace(/_+/g, '_');
      sections[currentSection][key] = kvMatch[2].trim();
    } else if (currentSection) {
      if (!sections[currentSection]._extra) sections[currentSection]._extra = [];
      sections[currentSection]._extra.push(line);
    }
  }
  return { sections, raw: motif };
}

function mergeReservationData(reservation) {
  const { sections } = parseMotif(reservation.motif);
  const demandeur = sections.demandeur || {};
  const evenement = sections['événement'] || sections.evenement || {};
  const programme = sections.programme || sections['programme_/_affiche'] || sections.programme_affiche || {};
  const reserv = sections['réservation'] || sections.reservation || {};
  const nomComplet =
    (reservation.demandeurPrenom && reservation.demandeurNom
      ? `${reservation.demandeurPrenom} ${reservation.demandeurNom}`
      : reservation.demandeurNom) || demandeur.nom || '';

  return {
    nom: nomComplet,
    email: reservation.demandeurEmail || demandeur.email || '',
    telephone: reservation.demandeurTelephone || demandeur.téléphone || demandeur.telephone || '',
    organisme: reservation.demandeurOrganisme || demandeur.organisme || '',
    etablissement: reservation.demandeurEtablissement || demandeur.établissement || demandeur.etablissement || '',
    ville: reservation.demandeurVille || demandeur.ville_établissement || demandeur.ville_etablissement || demandeur.ville || '',
    type: reservation.demandeurType || demandeur.type || '',
    logoOrganisme: reservation.logoOrganismeUrl || demandeur.logo_organisme || '',
    typeEvenement: reservation.typeEvenement || evenement["type_d'événement"] || evenement.type_d_événement || evenement.type || '',
    publicRecu: reservation.publicRecu || evenement.public_reçu || evenement.public_recu || '',
    participants: reservation.nombreParticipants || evenement.participants || '',
    equipements: reservation.equipements || evenement.équipements_demandés || evenement.equipements_demandes || '',
    descriptionLogistique: reservation.descriptionLogistique || evenement.description_logistique || '',
    programmeFichier: reservation.programmeAfficheUrl || programme.fichier || '',
    programmeLien: programme.lien || '',
    motifReel: reserv.motif || evenement.motif || (Object.keys(sections).length === 0 ? reservation.motif : ''),
    modeReglement: reservation.modeReglement || '',
  };
}

function InfoLine({ icon: Icon, label, value, color = '#78716C' }) {
  if (!value || value === '-' || value === '—') return null;
  return (
    <div className="flex items-start gap-2 text-xs">
      <div
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md"
        style={{ background: `${color}15`, color }}
      >
        <Icon className="h-3 w-3" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[9px] font-bold uppercase tracking-wider text-stone-400">{label}</p>
        <p className="text-xs font-medium text-stone-800 break-words">{value}</p>
      </div>
    </div>
  );
}

function DetailsBlock({ reservation }) {
  const data = mergeReservationData(reservation);
  const hasDemandeurInfo = data.nom || data.email || data.telephone || data.organisme || data.etablissement;
  const hasEvenementInfo = data.typeEvenement || data.publicRecu || data.participants || data.equipements || data.descriptionLogistique;
  const hasProgrammeInfo = data.programmeFichier || data.programmeLien || data.logoOrganisme;
  const hasMotifReel = Boolean(data.motifReel);
  const hasModeReglement = Boolean(data.modeReglement);

  return (
    <div className="grid gap-3 lg:grid-cols-2">
      <div className="rounded-xl bg-white border border-stone-200 overflow-hidden">
        <div className="flex items-center gap-1.5 bg-gradient-to-r from-[#E07A5F]/10 to-[#F2CC8F]/10 border-b border-[#E07A5F]/20 px-3 py-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-[#E07A5F] to-[#E8956F] shadow-sm">
            <User className="h-3.5 w-3.5 text-white" />
          </div>
          <p className="text-xs font-bold text-[#C96A50]">Demandeur</p>
        </div>
        <div className="p-3 space-y-2">
          {hasDemandeurInfo ? (
            <>
              <InfoLine icon={User} label="Nom complet" value={data.nom} color="#E07A5F" />
              <InfoLine icon={Mail} label="Email" value={data.email} color="#9B8EC4" />
              <InfoLine icon={Phone} label="Téléphone" value={data.telephone} color="#5BBFA0" />
              <InfoLine icon={Building2} label="Organisme" value={data.organisme} color="#E9B86A" />
              <InfoLine icon={Building2} label="Établissement" value={data.etablissement} color="#E9B86A" />
              <InfoLine icon={MapPin} label="Ville" value={data.ville} color="#E07A5F" />
              <InfoLine icon={FileText} label="Type" value={data.type} color="#9B8EC4" />
              {data.logoOrganisme && (
                <a
                  href={data.logoOrganisme}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 mt-1.5 rounded-full bg-gradient-to-r from-[#E07A5F]/10 to-[#F2CC8F]/10 border border-[#E07A5F]/25 px-2.5 py-1 text-[10px] font-semibold text-[#C96A50] hover:bg-[#E07A5F]/15 transition-all"
                >
                  <ImageIcon className="h-3 w-3" />
                  Voir le logo
                </a>
              )}
            </>
          ) : (
            <p className="text-xs italic text-stone-500">Aucune information.</p>
          )}
        </div>
      </div>

      <div className="rounded-xl bg-white border border-stone-200 overflow-hidden">
        <div className="flex items-center gap-1.5 bg-gradient-to-r from-[#5BBFA0]/10 to-[#A8E6CF]/10 border-b border-[#5BBFA0]/20 px-3 py-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-[#5BBFA0] to-[#7DD4B8] shadow-sm">
            <Calendar className="h-3.5 w-3.5 text-white" />
          </div>
          <p className="text-xs font-bold text-[#4AA88D]">Événement</p>
        </div>
        <div className="p-3 space-y-2">
          {hasEvenementInfo ? (
            <>
              <InfoLine icon={Sparkles} label="Type d'événement" value={data.typeEvenement} color="#5BBFA0" />
              <InfoLine icon={UsersIcon} label="Public reçu" value={data.publicRecu} color="#9B8EC4" />
              <InfoLine icon={UsersIcon} label="Participants" value={data.participants} color="#E07A5F" />
              <InfoLine icon={Wrench} label="Équipements" value={data.equipements} color="#E9B86A" />
              <InfoLine icon={FileText} label="Description logistique" value={data.descriptionLogistique} color="#806FB0" />
            </>
          ) : (
            <p className="text-xs italic text-stone-500">Aucune information.</p>
          )}
          {hasModeReglement && (
            <div className="mt-2 pt-2 border-t border-stone-100">
              <InfoLine icon={FileText} label="Mode de règlement" value={data.modeReglement} color="#5BBFA0" />
            </div>
          )}
        </div>
      </div>

      <div className="rounded-xl bg-white border border-stone-200 overflow-hidden">
        <div className="flex items-center gap-1.5 bg-gradient-to-r from-[#9B8EC4]/10 to-[#B8AAD4]/10 border-b border-[#9B8EC4]/20 px-3 py-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-[#9B8EC4] to-[#B8AAD4] shadow-sm">
            <FileText className="h-3.5 w-3.5 text-white" />
          </div>
          <p className="text-xs font-bold text-[#806FB0]">Programme / Affiche</p>
        </div>
        <div className="p-3 space-y-1.5">
          {hasProgrammeInfo ? (
            <>
              {data.programmeFichier && (
                <a
                  href={data.programmeFichier}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 rounded-lg border border-stone-200 bg-stone-50 px-2.5 py-1.5 text-xs font-semibold text-stone-700 hover:border-[#9B8EC4] hover:text-[#806FB0] hover:bg-white hover:shadow-sm transition-all"
                >
                  <LinkIcon className="h-3 w-3 text-[#9B8EC4]" />
                  <span className="truncate flex-1">Télécharger le fichier</span>
                </a>
              )}
              {data.programmeLien && (
                <a
                  href={data.programmeLien}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 rounded-lg border border-stone-200 bg-stone-50 px-2.5 py-1.5 text-xs font-semibold text-stone-700 hover:border-[#9B8EC4] hover:text-[#806FB0] hover:bg-white hover:shadow-sm transition-all"
                >
                  <LinkIcon className="h-3 w-3 text-[#9B8EC4]" />
                  <span className="truncate flex-1">{data.programmeLien}</span>
                </a>
              )}
              {!data.programmeFichier && !data.programmeLien && data.logoOrganisme && (
                <p className="text-xs italic text-stone-500">
                  Pas de programme. Logo organisme disponible.
                </p>
              )}
            </>
          ) : (
            <p className="text-xs italic text-stone-500">Aucun programme.</p>
          )}
        </div>
      </div>

      <div className="rounded-xl bg-gradient-to-br from-[#FEF4F1] to-white border border-[#E07A5F]/25 overflow-hidden">
        <div className="flex items-center gap-1.5 bg-gradient-to-r from-[#E07A5F]/15 to-[#F2CC8F]/10 border-b border-[#E07A5F]/20 px-3 py-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-[#E07A5F] to-[#E8956F] shadow-sm">
            <FileText className="h-3.5 w-3.5 text-white" />
          </div>
          <p className="text-xs font-bold text-[#C96A50]">Motif détaillé</p>
        </div>
        <div className="p-3">
          {hasMotifReel ? (
            <p className="text-xs text-stone-700 whitespace-pre-wrap leading-relaxed">
              {data.motifReel}
            </p>
          ) : (
            <p className="text-xs italic text-stone-500">Aucun motif.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function GestionReservationsPage() {
  const [reservations, setReservations] = useState([]);
  const [locaux, setLocaux] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showArchived, setShowArchived] = useState(false);

  const [rejectId, setRejectId] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const [actionLoading, setActionLoading] = useState(null);

  const [q, setQ] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [expandedId, setExpandedId] = useState(null);

  const [exportOpen, setExportOpen] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [exportDebut, setExportDebut] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 6);
    return d.toISOString().slice(0, 16);
  });
  const [exportFin, setExportFin] = useState(() => new Date().toISOString().slice(0, 16));
  const [exportGranularity, setExportGranularity] = useState('MONTH');

  const load = () => {
    setLoading(true);
    reservationService
      .getAll(0, 100)
      .then((page) => {
        const content = getPageContent(page);
        if (!showArchived) {
          setReservations(content.filter((r) => r.statut !== RESERVATION_STATUS.ARCHIVEE));
        } else {
          setReservations(content);
        }
      })
      .catch(() => toast.error('Erreur de chargement'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    localService.getAll().then((locs) => setLocaux(locs)).catch(() => {});
  }, [showArchived]);

  const runAction = async (key, fn, successMsg) => {
    setActionLoading(key);
    try {
      await fn();
      toast.success(successMsg);
      load();
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur');
      return false;
    } finally {
      setActionLoading(null);
    }
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormOpen(true);
  };

  const openEdit = (reservation) => {
    setEditingId(reservation.id);
    setForm({
      demandeurNom: reservation.demandeurNom ?? '',
      demandeurPrenom: reservation.demandeurPrenom ?? '',
      demandeurEmail: reservation.demandeurEmail ?? '',
      demandeurTelephone: reservation.demandeurTelephone ?? '',
      demandeurOrganisme: reservation.demandeurOrganisme ?? '',
      localId: reservation.localId ?? '',
      dateDebut: reservation.dateDebut ? reservation.dateDebut.slice(0, 16) : '',
      dateFin: reservation.dateFin ? reservation.dateFin.slice(0, 16) : '',
      nombreParticipants: reservation.nombreParticipants ?? '',
      motif: reservation.motif ?? '',
      validerImmediatement: reservation.statut === RESERVATION_STATUS.VALIDEE,
      typeEvenement: reservation.typeEvenement ?? 'AUTRE',
      publicRecu: reservation.publicRecu ?? '',
      modeReglement: reservation.modeReglement ?? 'Gratuit',
      programmeAfficheUrl: reservation.programmeAfficheUrl ?? '',
      logoOrganismeUrl: reservation.logoOrganismeUrl ?? '',
    });
    setFormOpen(true);
  };

  const handleSave = async () => {
    if (!form.demandeurNom?.trim() || !form.demandeurPrenom?.trim() || !form.demandeurEmail?.trim()) {
      toast.error('Nom, Prénom et Email obligatoires');
      return;
    }
    if (!form.localId || !form.dateDebut || !form.dateFin || !form.motif?.trim()) {
      toast.error('Remplissez tous les champs obligatoires');
      return;
    }

    setActionLoading(editingId ? 'update' : 'create');
    try {
      const payload = {
        demandeurNom: form.demandeurNom.trim(),
        demandeurPrenom: form.demandeurPrenom.trim(),
        demandeurEmail: form.demandeurEmail.trim(),
        demandeurTelephone: form.demandeurTelephone?.trim() || '',
        demandeurOrganisme: form.demandeurOrganisme?.trim() || '',
        localId: Number(form.localId),
        dateDebut: form.dateDebut,
        dateFin: form.dateFin,
        nombreParticipants: Math.max(1, Number(form.nombreParticipants) || 1),
        motif: form.motif,
        validerImmediatement: form.validerImmediatement,
        typeEvenement: form.typeEvenement || 'AUTRE',
        publicRecu: form.publicRecu?.trim() || '',
        modeReglement: form.modeReglement?.trim() || '',
        programmeAfficheUrl: safeUrl(form.programmeAfficheUrl),
        logoOrganismeUrl: safeUrl(form.logoOrganismeUrl),
      };

      if (editingId) {
        await reservationService.update(editingId, payload);
        toast.success('Réservation modifiée');
      } else {
        await reservationService.createByAdmin(payload);
        toast.success('Réservation créée');
      }

      setFormOpen(false);
      setForm(emptyForm);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur');
    } finally {
      setActionLoading(null);
    }
  };

  const handleExport = async (type) => {
    setExportLoading(true);
    try {
      const debutIso = new Date(exportDebut).toISOString();
      const finIso = new Date(exportFin).toISOString();
      const fn = type === 'pdf' ? statsService.exportPdf : statsService.exportExcel;
      const res = await fn(debutIso, finIso, exportGranularity);
      const ext = type === 'pdf' ? 'pdf' : 'xlsx';
      downloadBlob(res.data, `reservations-rapport-${Date.now()}.${ext}`);
      toast.success(`Fichier ${ext.toUpperCase()} téléchargé`);
      setExportOpen(false);
    } catch {
      toast.error(`Erreur export ${type.toUpperCase()}`);
    } finally {
      setExportLoading(false);
    }
  };

  const canAnnuler = (statut) =>
    [RESERVATION_STATUS.EN_ATTENTE, RESERVATION_STATUS.VALIDEE, RESERVATION_STATUS.CONFIRMEE].includes(statut);

  const canModifier = (statut) =>
    [RESERVATION_STATUS.EN_ATTENTE, RESERVATION_STATUS.VALIDEE].includes(statut);

  const canRestaurer = (statut) =>
    statut === RESERVATION_STATUS.ARCHIVEE || statut === RESERVATION_STATUS.ANNULEE;

  const filteredReservations = useMemo(() => {
    let list = reservations;
    if (statusFilter !== 'ALL') {
      list = list.filter((r) => r.statut === statusFilter);
    }
    const s = q.trim().toLowerCase();
    if (!s) return list;
    return list.filter((r) => {
      const hay = [
        r.demandeurNom, r.demandeurPrenom, r.demandeurEmail, r.demandeurTelephone,
        r.demandeurOrganisme, r.localNom, r.localCode, r.statut, r.motif,
        r.typeEvenement, r.publicRecu, r.modeReglement, r.equipements,
      ].filter(Boolean).join(' ').toLowerCase();
      return hay.includes(s);
    });
  }, [reservations, q, statusFilter]);

  if (loading) return <Loading label="Chargement…" />;

  const cancelOpen = confirmAction?.type === 'cancel';
  const archiveOpen = confirmAction?.type === 'archive';
  const selectedR = confirmAction?.r;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-lg font-bold text-stone-800">
            Gestion des réservations
          </h1>
          <p className="text-xs text-stone-600">
            Réservations 100 % gratuites — confirmer, créer, modifier, annuler, rejeter ou archiver
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            icon={FileSpreadsheet}
            size="sm"
            onClick={() => setExportOpen(true)}
            className="bg-gradient-to-r from-[#5BBFA0] to-[#7DD4B8] hover:from-[#4AA88D] hover:to-[#5BBFA0] text-white border-transparent"
          >
            Exporter Excel
          </Button>

          <Button
            variant={showArchived ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowArchived(!showArchived)}
            className="border-stone-300 text-stone-700"
          >
            {showArchived ? 'Masquer archivées' : 'Voir archivées'}
          </Button>

          <Button
            icon={Plus}
            size="sm"
            onClick={openCreate}
            className="bg-[#E07A5F] hover:bg-[#C96A50] text-white border-transparent"
          >
            Ajouter
          </Button>
        </div>
      </div>

      <div className="grid gap-2.5 lg:grid-cols-[1fr,220px,180px]">
        <Input
          label="Recherche"
          icon={Search}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Nom, email, organisme, local, type…"
        />

        <div>
          <label className="mb-1 block text-xs font-semibold text-stone-700">Statut</label>
          <select
            className="w-full rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 text-xs text-stone-800 outline-none focus:border-[#E07A5F] focus:ring-4 focus:ring-[#E07A5F]/15"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">Tous</option>
            <option value={RESERVATION_STATUS.EN_ATTENTE}>En attente</option>
            <option value={RESERVATION_STATUS.VALIDEE}>Validée</option>
            <option value={RESERVATION_STATUS.REJETEE}>Rejetée</option>
            <option value={RESERVATION_STATUS.ANNULEE}>Annulée</option>
            <option value={RESERVATION_STATUS.CONFIRMEE}>Confirmée</option>
            <option value={RESERVATION_STATUS.TERMINEE}>Terminée</option>
            <option value={RESERVATION_STATUS.ARCHIVEE}>Archivée</option>
          </select>
        </div>

        <div className="rounded-xl border border-stone-200 bg-white p-3 shadow-sm">
          <p className="text-[10px] text-stone-600">Résultats</p>
          <p className="text-xl font-extrabold text-stone-900">{filteredReservations.length}</p>
          <p className="text-[10px] text-stone-500">lignes affichées</p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white shadow-sm">
        <table className="min-w-full text-xs">
          <thead className="bg-stone-50">
            <tr>
              <th className="w-[42px] px-2 py-2.5" />
              <th className="px-3 py-2.5 text-left font-semibold text-stone-700">Demandeur</th>
              <th className="px-3 py-2.5 text-left font-semibold text-stone-700">Local</th>
              <th className="px-3 py-2.5 text-left font-semibold text-stone-700">Période</th>
              <th className="px-3 py-2.5 text-left font-semibold text-stone-700">Statut</th>
              <th className="px-3 py-2.5 text-right font-semibold text-stone-700">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-stone-100">
            {filteredReservations.map((r) => {
              const isExpanded = expandedId === r.id;
              return (
                <>
                  <tr key={r.id} className="hover:bg-[#FEF0EB]/40 transition-colors">
                    <td className="px-2 py-2.5 align-top">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="px-1.5"
                        onClick={() => setExpandedId(isExpanded ? null : r.id)}
                        aria-label={isExpanded ? 'Fermer détails' : 'Voir détails'}
                      >
                        {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                      </Button>
                    </td>
                    <td className="px-3 py-2.5 text-stone-800 align-top">
                      <div className="font-semibold">
                        {r.demandeurPrenom} {r.demandeurNom}
                      </div>
                      <div className="text-[10px] text-stone-500">{r.demandeurEmail}</div>
                      {r.demandeurOrganisme && (
                        <div className="mt-0.5 text-[10px] text-stone-600">
                          Org : <span className="font-semibold text-stone-700">{r.demandeurOrganisme}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-stone-800 align-top">
                      <div className="font-semibold">
                        {r.localNom} <span className="text-[10px] text-stone-500">({r.localCode})</span>
                      </div>
                      {(r.typeEvenement || r.publicRecu || r.modeReglement) && (
                        <div className="mt-0.5 text-[10px] text-stone-600 space-x-1.5">
                          {r.typeEvenement && <span>Type: <b>{r.typeEvenement}</b></span>}
                          {r.publicRecu && <span>Public: <b>{r.publicRecu}</b></span>}
                          {r.modeReglement && <span>Mode: <b>{r.modeReglement}</b></span>}
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-stone-600 align-top text-[11px]">
                      {formatDateTime(r.dateDebut)}
                      <br />
                      {formatDateTime(r.dateFin)}
                    </td>
                    <td className="px-3 py-2.5 align-top">
                      <ReservationStatus status={r.statut} size="sm" />
                      {r.statut === RESERVATION_STATUS.REJETEE && r.motifRejet && (
                        <div className="mt-0.5 text-[10px] text-red-600">Motif: {r.motifRejet}</div>
                      )}
                    </td>
                    <td className="px-3 py-2.5 align-top">
                      <div className="flex flex-wrap justify-end gap-1">
                        {canRestaurer(r.statut) ? (
                          <Button
                            size="sm"
                            variant="outline"
                            icon={RotateCcw}
                            className="border-[#5BBFA0] text-[#5BBFA0] hover:bg-[#5BBFA0]/10"
                            loading={actionLoading === `rest-${r.id}`}
                            onClick={() =>
                              runAction(
                                `rest-${r.id}`,
                                () =>
                                  r.statut === RESERVATION_STATUS.ANNULEE
                                    ? reservationService.restaurerApresAnnulation(r.id)
                                    : reservationService.restaurer(r.id),
                                'Réservation restaurée',
                              )
                            }
                          >
                            Restaurer
                          </Button>
                        ) : (
                          <>
                            {r.statut === RESERVATION_STATUS.EN_ATTENTE && (
                              <>
                                <Button
                                  size="sm"
                                  icon={Check}
                                  loading={actionLoading === `val-${r.id}`}
                                  className="bg-[#5BBFA0] hover:bg-[#4AA88D] text-white border-transparent"
                                  onClick={() =>
                                    runAction(
                                      `val-${r.id}`,
                                      () => reservationService.valider(r.id),
                                      'Validée',
                                    )
                                  }
                                >
                                  Confirmer
                                </Button>
                                <Button
                                  size="sm"
                                  variant="danger"
                                  icon={X}
                                  loading={actionLoading === `rej-${r.id}`}
                                  onClick={() => setRejectId(r.id)}
                                >
                                  Rejeter
                                </Button>
                              </>
                            )}
                            {canModifier(r.statut) && (
                              <Button
                                size="sm"
                                variant="outline"
                                icon={Edit2}
                                className="border-stone-300 text-stone-700 hover:bg-stone-50"
                                onClick={() => openEdit(r)}
                              >
                                Modifier
                              </Button>
                            )}
                            {canAnnuler(r.statut) && (
                              <Button
                                size="sm"
                                variant="outline"
                                icon={Ban}
                                className="border-stone-300 text-stone-700 hover:bg-stone-50"
                                loading={actionLoading === `ann-${r.id}`}
                                onClick={() => setConfirmAction({ type: 'cancel', r })}
                              >
                                Annuler
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              icon={Archive}
                              className="text-red-600 hover:bg-red-50"
                              loading={actionLoading === `arch-${r.id}`}
                              onClick={() => setConfirmAction({ type: 'archive', r })}
                            >
                              Archiver
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>

                  {isExpanded && (
                    <tr key={`${r.id}-details`}>
                      <td colSpan={6} className="px-3 pb-4 bg-gradient-to-b from-[#FEF4F1]/30 to-transparent">
                        <div className="animate-fade-in">
                          <DetailsBlock reservation={r} />
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              );
            })}
          </tbody>
        </table>

        {filteredReservations.length === 0 && (
          <p className="py-8 text-center text-xs text-stone-600">
            {showArchived ? 'Aucune réservation.' : 'Aucune réservation active.'}
          </p>
        )}
      </div>

      <ConfirmDialog
        open={cancelOpen}
        title="Annuler la réservation"
        description={
          selectedR
            ? `Êtes-vous sûr de vouloir annuler la réservation #${selectedR.id} ?`
            : 'Annuler ?'
        }
        confirmText="Oui, annuler"
        cancelText="Fermer"
        loading={selectedR ? actionLoading === `ann-${selectedR.id}` : false}
        onClose={() => setConfirmAction(null)}
        onConfirm={async () => {
          if (!selectedR) return;
          const ok = await runAction(
            `ann-${selectedR.id}`,
            () => reservationService.annulerAdmin(selectedR.id),
            'Réservation annulée',
          );
          if (ok) setConfirmAction(null);
        }}
      />

      <ConfirmDialog
        open={archiveOpen}
        title="Archiver la réservation"
        description={
          selectedR
            ? `Archiver la réservation #${selectedR.id} ?`
            : 'Archiver ?'
        }
        confirmText="Oui, archiver"
        cancelText="Fermer"
        variant="danger"
        loading={selectedR ? actionLoading === `arch-${selectedR.id}` : false}
        onClose={() => setConfirmAction(null)}
        onConfirm={async () => {
          if (!selectedR) return;
          const ok = await runAction(
            `arch-${selectedR.id}`,
            () => reservationService.archiver(selectedR.id),
            'Réservation archivée',
          );
          if (ok) setConfirmAction(null);
        }}
      />

      <RejectDialog
        open={Boolean(rejectId)}
        loading={rejectId ? actionLoading === `rej-${rejectId}` : false}
        onClose={() => setRejectId(null)}
        onConfirm={async (motif) => {
          if (!rejectId) return;
          const ok = await runAction(
            `rej-${rejectId}`,
            () => reservationService.rejeter(rejectId, motif),
            'Réservation rejetée',
          );
          if (ok) setRejectId(null);
        }}
      />

      {/* MODAL EXPORT */}
      <Modal
        isOpen={exportOpen}
        onClose={() => setExportOpen(false)}
        title="Exporter les réservations"
        size="md"
      >
        <div className="space-y-4">
          <div className="rounded-xl border border-[#5BBFA0]/30 bg-gradient-to-br from-[#F0FAF5] to-white p-3">
            <div className="flex items-start gap-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#5BBFA0] to-[#7DD4B8] shadow-md shadow-[#5BBFA0]/30">
                <FileSpreadsheet className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#3D8B74]">Rapport complet</p>
                <p className="mt-0.5 text-[11px] text-stone-600 leading-relaxed">
                  Le fichier Excel contient : KPIs, occupation des locaux, participation des
                  organismes, tableau détaillé, séries temporelles.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-stone-700">Date début</label>
              <input
                type="datetime-local"
                value={exportDebut}
                onChange={(e) => setExportDebut(e.target.value)}
                className="w-full rounded-lg border border-stone-200 bg-white px-2.5 py-2 text-xs text-stone-800 focus:border-[#E07A5F] focus:outline-none focus:ring-4 focus:ring-[#E07A5F]/15"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-stone-700">Date fin</label>
              <input
                type="datetime-local"
                value={exportFin}
                onChange={(e) => setExportFin(e.target.value)}
                className="w-full rounded-lg border border-stone-200 bg-white px-2.5 py-2 text-xs text-stone-800 focus:border-[#E07A5F] focus:outline-none focus:ring-4 focus:ring-[#E07A5F]/15"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-stone-700">Granularité</label>
            <select
              className="w-full rounded-lg border border-stone-200 bg-white px-2.5 py-2 text-xs text-stone-800 outline-none focus:border-[#E07A5F] focus:ring-4 focus:ring-[#E07A5F]/15"
              value={exportGranularity}
              onChange={(e) => setExportGranularity(e.target.value)}
            >
              <option value="MONTH">Par mois</option>
              <option value="WEEK_ISO">Par semaine (ISO)</option>
            </select>
          </div>

          <div className="flex flex-wrap justify-end gap-2 border-t border-stone-200 pt-3">
            <Button variant="outline" size="sm" onClick={() => setExportOpen(false)} disabled={exportLoading}>
              Annuler
            </Button>
            <Button
              icon={Download}
              size="sm"
              loading={exportLoading}
              onClick={() => handleExport('pdf')}
              className="bg-gradient-to-r from-[#9B8EC4] to-[#B8AAD4] hover:from-[#806FB0] hover:to-[#9B8EC4] text-white border-transparent"
            >
              PDF
            </Button>
            <Button
              icon={FileSpreadsheet}
              size="sm"
              loading={exportLoading}
              onClick={() => handleExport('excel')}
              className="bg-gradient-to-r from-[#5BBFA0] to-[#7DD4B8] hover:from-[#4AA88D] hover:to-[#5BBFA0] text-white border-transparent"
            >
              Excel
            </Button>
          </div>
        </div>
      </Modal>

      {/* MODAL CRÉATION / ÉDITION */}
      <Modal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        title={editingId ? 'Modifier la réservation' : 'Nouvelle réservation (admin)'}
        size="xl"
      >
        <div className="max-h-[70vh] space-y-3 overflow-y-auto pr-1">
          <section className="rounded-xl border border-stone-200 bg-stone-50 p-3">
            <h3 className="mb-2 text-xs font-semibold text-stone-800">Informations du demandeur</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                label="Nom *"
                value={form.demandeurNom}
                onChange={(e) => setForm((p) => ({ ...p, demandeurNom: e.target.value }))}
                placeholder="Ex: Benali"
                required
              />
              <Input
                label="Prénom *"
                value={form.demandeurPrenom}
                onChange={(e) => setForm((p) => ({ ...p, demandeurPrenom: e.target.value }))}
                placeholder="Ex: Mohamed"
                required
              />
              <Input
                label="Email *"
                type="email"
                value={form.demandeurEmail}
                onChange={(e) => setForm((p) => ({ ...p, demandeurEmail: e.target.value }))}
                placeholder="Ex: mohamed@example.com"
                required
              />
              <Input
                label="Téléphone"
                type="tel"
                value={form.demandeurTelephone}
                onChange={(e) => setForm((p) => ({ ...p, demandeurTelephone: e.target.value }))}
                placeholder="Ex: 06 12 34 56 78"
              />
              <Input
                label="Organisme"
                value={form.demandeurOrganisme}
                onChange={(e) => setForm((p) => ({ ...p, demandeurOrganisme: e.target.value }))}
                placeholder="Ex: Université Cadi Ayyad"
                containerClassName="sm:col-span-2"
              />
            </div>
          </section>

          <section className="rounded-xl border border-stone-200 bg-stone-50 p-3">
            <h3 className="mb-2 text-xs font-semibold text-stone-800">Détails de la réservation</h3>

            <div className="mb-3">
              <label className="mb-1 block text-xs font-medium text-stone-700">Local *</label>
              <select
                className="w-full rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 text-xs text-stone-800 focus:border-[#E07A5F] focus:outline-none focus:ring-4 focus:ring-[#E07A5F]/15"
                value={form.localId}
                onChange={(e) => setForm((p) => ({ ...p, localId: e.target.value }))}
                required
              >
                <option value="">Sélectionner un local…</option>
                {locaux.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.nom} ({l.code})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                label="Début *"
                type="datetime-local"
                value={form.dateDebut}
                onChange={(e) => setForm((p) => ({ ...p, dateDebut: e.target.value }))}
                required
              />
              <Input
                label="Fin *"
                type="datetime-local"
                value={form.dateFin}
                onChange={(e) => setForm((p) => ({ ...p, dateFin: e.target.value }))}
                required
              />
            </div>

            <div className="mt-3">
              <Input
                label="Nombre de participants"
                type="number"
                min={1}
                value={form.nombreParticipants}
                onChange={(e) => {
                  const v = e.target.value;
                  if (v === '' || Number(v) >= 0) {
                    setForm((p) => ({ ...p, nombreParticipants: v }));
                  }
                }}
                placeholder="Ex: 25"
              />
            </div>

            <div className="mt-3">
              <label className="mb-1 block text-xs font-medium text-stone-700">Motif *</label>
              <textarea
                className="w-full rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 text-xs text-stone-800 focus:border-[#E07A5F] focus:outline-none focus:ring-4 focus:ring-[#E07A5F]/15"
                rows={3}
                value={form.motif}
                onChange={(e) => setForm((p) => ({ ...p, motif: e.target.value }))}
                placeholder="Ex: Réunion de projet, Formation, etc."
                required
              />
            </div>
          </section>

          <section className="rounded-xl border border-stone-200 bg-stone-50 p-3">
            <h3 className="mb-2 text-xs font-semibold text-stone-800">
              Informations complémentaires (admin)
            </h3>

            <div className="mb-3">
              <p className="mb-2 text-xs font-medium text-stone-700">Type d&apos;événement</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {TYPE_OPTIONS.map((t) => {
                  const active = form.typeEvenement === t.key;
                  return (
                    <button
                      key={t.key}
                      type="button"
                      onClick={() => setForm((p) => ({ ...p, typeEvenement: t.key }))}
                      className={[
                        'flex items-center justify-between rounded-xl border px-3 py-2 text-left transition-all',
                        active
                          ? 'border-[#E07A5F] bg-white shadow-sm ring-4 ring-[#E07A5F]/10'
                          : 'border-stone-200 bg-white hover:bg-stone-50',
                      ].join(' ')}
                    >
                      <div>
                        <p className="text-xs font-semibold text-stone-800">{t.label}</p>
                        <p className="text-[10px] text-stone-500">Pour stats &amp; exports</p>
                      </div>
                      <span
                        className={[
                          'h-3.5 w-3.5 rounded-full border',
                          active ? 'border-[#E07A5F] bg-[#E07A5F]' : 'border-stone-300 bg-white',
                        ].join(' ')}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                label="Public reçu"
                value={form.publicRecu}
                onChange={(e) => setForm((p) => ({ ...p, publicRecu: e.target.value }))}
                placeholder="Ex: Interne / Externe / Mixte"
              />

              <div>
                <label className="mb-1 block text-xs font-semibold text-stone-700">
                  Mode de règlement
                </label>
                <select
                  className="w-full rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 text-xs text-stone-800 outline-none focus:border-[#E07A5F] focus:ring-4 focus:ring-[#E07A5F]/15"
                  value={form.modeReglement}
                  onChange={(e) => setForm((p) => ({ ...p, modeReglement: e.target.value }))}
                >
                  {MODE_OPTIONS.map((m) => (
                    <option key={m.key} value={m.key}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="Programme / Affiche (URL)"
                type="url"
                icon={LinkIcon}
                value={form.programmeAfficheUrl}
                onChange={(e) => setForm((p) => ({ ...p, programmeAfficheUrl: e.target.value }))}
                placeholder="https://..."
                containerClassName="sm:col-span-2"
              />

              <Input
                label="Logo organisme (URL)"
                type="url"
                icon={LinkIcon}
                value={form.logoOrganismeUrl}
                onChange={(e) => setForm((p) => ({ ...p, logoOrganismeUrl: e.target.value }))}
                placeholder="https://..."
                containerClassName="sm:col-span-2"
              />
            </div>
          </section>

          <label className="flex items-center gap-2 text-xs text-stone-700">
            <input
              type="checkbox"
              checked={form.validerImmediatement}
              onChange={(e) => setForm((p) => ({ ...p, validerImmediatement: e.target.checked }))}
              className="h-3.5 w-3.5 rounded border-stone-300 text-[#E07A5F] focus:ring-[#E07A5F]"
            />
            Confirmer immédiatement la réservation
          </label>
        </div>

        <div className="mt-3 flex justify-end gap-2 border-t border-stone-200 pt-3">
          <Button variant="outline" size="sm" onClick={() => setFormOpen(false)}>
            Annuler
          </Button>
          <Button
            size="sm"
            loading={actionLoading === 'create' || actionLoading === 'update'}
            onClick={handleSave}
            className="bg-[#5BBFA0] hover:bg-[#4AA88D] text-white border-transparent"
          >
            {editingId ? 'Enregistrer' : 'Créer'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}