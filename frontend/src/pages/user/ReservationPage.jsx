import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Calendar,
  FileText,
  Sparkles,
  User as UserIcon,
  Wrench,
  BadgeInfo,
  Link as LinkIcon,
  Upload,
  Image as ImageIcon,
  Download,
  School,
  Edit3,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Loading from '@/components/ui/Loading';
import AvailabilityCalendar from '@/components/features/reservation/AvailabilityCalendar';
import DurationSelector from '@/components/features/reservation/DurationSelector';
import MediaViewer from '@/components/features/reservation/MediaViewer';
import localService from '@/services/localService';
import reservationService from '@/services/reservationService';
import publicUploadService from '@/services/publicUploadService';
import { cn } from '@/utils/helpers';
import { formatDateTime } from '@/utils/formatters';

const MIN_DAYS_BEFORE = 7;

const STEPS = [
  { id: 'demandeur', label: 'Demandeur', icon: UserIcon },
  { id: 'event', label: 'Événement', icon: FileText },
  { id: 'creneau', label: 'Créneau', icon: Calendar },
  { id: 'confirmation', label: 'Confirmation', icon: Sparkles },
];

const EVENT_TYPES = [
  { value: 'REUNION', label: 'Réunion' },
  { value: 'FORMATION', label: 'Formation' },
  { value: 'CONFERENCE', label: 'Conférence' },
  { value: 'AUTRE', label: 'Autre' },
];

const AUDIENCE = [
  { value: 'MEMBRES', label: 'Membres' },
  { value: 'GRAND_PUBLIC', label: 'Grand public' },
];

const EQUIP_OPTIONS = [
  'Micro pour conférencier',
  'Projecteur numérique',
  'Rallonge électrique',
  'Support de projection',
];

/* ============ LISTE OFFICIELLE DES 15 ÉTABLISSEMENTS UCA ============ */
const ETABLISSEMENTS_UCA = [
  { value: 'FSSM', label: 'Faculté des Sciences Semlalia (FSSM)', ville: 'Marrakech' },
  { value: 'FSJES', label: 'Faculté des Sciences Juridiques, Économiques et Sociales (FSJES)', ville: 'Marrakech' },
  { value: 'FLSH', label: 'Faculté des Lettres et des Sciences Humaines (FLSH)', ville: 'Marrakech' },
  { value: 'FMPM', label: 'Faculté de Médecine et de Pharmacie (FMPM)', ville: 'Marrakech' },
  { value: 'FMDM', label: 'Faculté de Médecine Dentaire (FMDM)', ville: 'Marrakech' },
  { value: 'FSTG', label: 'Faculté des Sciences et Techniques Marrakech (FSTG)', ville: 'Marrakech' },
  { value: 'FPS', label: 'Faculté Polydisciplinaire de Safi (FPS)', ville: 'Safi' },
  { value: 'FSTBM', label: 'Faculté des Sciences et Techniques Béni Mellal (FSTBM)', ville: 'Béni Mellal' },
  { value: 'ENSAM', label: 'École Nationale des Sciences Appliquées Marrakech (ENSAM)', ville: 'Marrakech' },
  { value: 'ENSAS', label: 'École Nationale des Sciences Appliquées Safi (ENSAS)', ville: 'Safi' },
  { value: 'ENCG', label: 'École Nationale de Commerce et de Gestion (ENCG)', ville: 'Marrakech' },
  { value: 'ESTE', label: 'École Supérieure de Technologie Essaouira (ESTE)', ville: 'Essaouira' },
  { value: 'ESTS', label: 'École Supérieure de Technologie Safi (ESTS)', ville: 'Safi' },
  { value: 'ENS', label: 'École Normale Supérieure (ENS)', ville: 'Marrakech' },
  { value: 'ISSI', label: 'Institut Supérieur des Sciences Infirmières (ISSI)', ville: 'Marrakech' },
  { value: 'AUTRE', label: 'Autre établissement…', ville: '' },
];

const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(email || '').trim());

const normalizePhone = (p) => String(p || '').replace(/[\s\-().]/g, '');

const isValidPhoneMA = (phone) => {
  const p = normalizePhone(phone);
  return /^(?:0[67]\d{8}|\+212[67]\d{8})$/.test(p);
};

const toLocalDateTime = (v) => (v && v.length === 16 ? `${v}:00` : v);

function prettyFileName(name) {
  if (!name) return '';
  if (name.length <= 28) return name;
  return `${name.slice(0, 18)}…${name.slice(-8)}`;
}

/* ============ CHARGEMENT DYNAMIQUE DE jsPDF VIA CDN ============ */
const loadJsPDF = () =>
  new Promise((resolve, reject) => {
    if (window.jspdf?.jsPDF) {
      resolve(window.jspdf.jsPDF);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    script.async = true;
    script.onload = () => {
      if (window.jspdf?.jsPDF) {
        resolve(window.jspdf.jsPDF);
      } else {
        reject(new Error('jsPDF n\'a pas pu être chargé'));
      }
    };
    script.onerror = () => reject(new Error('Échec du chargement de jsPDF depuis le CDN'));
    document.head.appendChild(script);
  });

export default function ReservationPage() {
  const { localId } = useParams();
  const location = useLocation();
  const isDemandeurPath = location.pathname.startsWith('/demandeur');
  const backTo = isDemandeurPath ? `/demandeur/locaux/${localId}` : `/locaux/${localId}`;

  const navigate = useNavigate();
  const [local, setLocal] = useState(null);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [disponible, setDisponible] = useState(null);
  const [activePreset, setActivePreset] = useState(null);

  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingProgramme, setUploadingProgramme] = useState(false);

  // Réservation créée (pour générer le PDF)
  const [createdReservation, setCreatedReservation] = useState(null);
  const [generatingPdf, setGeneratingPdf] = useState(false);

  const [form, setForm] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    type: 'EXTERNE',
    organisme: '',
    etablissement: '',
    etablissementAutre: '',
    villeEtablissement: '',
    logoOrganismeUrl: '',
    logoOrganismeName: '',
    eventType: 'REUNION',
    eventTypeAutre: '',
    publicRecu: 'MEMBRES',
    equipements: [],
    descriptionLogistique: '',
    programmeLink: '',
    programmeUrl: '',
    programmeName: '',
    nombreParticipants: '',
    motif: '',
    dateDebut: '',
    dateFin: '',
    ackReservation: false,
    ackEmail: false,
  });

  useEffect(() => {
    localService
      .getById(localId)
      .then(setLocal)
      .catch(() => toast.error('Local introuvable'))
      .finally(() => setLoading(false));
  }, [localId]);

  const emailInvalid = form.email.trim().length > 0 && !isValidEmail(form.email);
  const phoneInvalid = form.telephone.trim().length > 0 && !isValidPhoneMA(form.telephone);

  const eventTypeLabel = useMemo(() => {
    const base = EVENT_TYPES.find((x) => x.value === form.eventType)?.label || form.eventType;
    if (form.eventType === 'AUTRE' && form.eventTypeAutre?.trim()) {
      return `Autre: ${form.eventTypeAutre.trim()}`;
    }
    return base;
  }, [form.eventType, form.eventTypeAutre]);

  const etablissementLabel = useMemo(() => {
    if (form.etablissement === 'AUTRE') {
      return form.etablissementAutre?.trim() || 'Autre';
    }
    const found = ETABLISSEMENTS_UCA.find((e) => e.value === form.etablissement);
    return found?.label || form.etablissement;
  }, [form.etablissement, form.etablissementAutre]);

  const handleEtablissementChange = (value) => {
    const found = ETABLISSEMENTS_UCA.find((e) => e.value === value);
    setForm((p) => ({
      ...p,
      etablissement: value,
      villeEtablissement: found?.ville || '',
      etablissementAutre: value !== 'AUTRE' ? '' : p.etablissementAutre,
    }));
  };

  const buildMotifFinal = () => {
    const lines = [];
    lines.push('=== DEMANDEUR ===');
    lines.push(`Nom: ${form.nom} ${form.prenom}`);
    lines.push(`Email: ${form.email}`);
    lines.push(`Téléphone: ${form.telephone}`);
    lines.push(`Type: ${form.type}`);
    lines.push(`Organisme: ${form.organisme}`);
    lines.push(`Établissement: ${etablissementLabel}`);
    lines.push(`Ville établissement: ${form.villeEtablissement}`);
    if (form.logoOrganismeUrl) lines.push(`Logo organisme: ${form.logoOrganismeUrl}`);

    lines.push('\n=== ÉVÉNEMENT ===');
    lines.push(`Type d'événement: ${eventTypeLabel}`);
    lines.push(`Public reçu: ${AUDIENCE.find((a) => a.value === form.publicRecu)?.label || form.publicRecu}`);
    lines.push(`Participants: ${form.nombreParticipants}`);
    lines.push(`Équipements demandés: ${form.equipements.length ? form.equipements.join(', ') : 'Aucun'}`);
    lines.push(`Description logistique: ${form.descriptionLogistique || '-'}`);

    lines.push('\n=== PROGRAMME / AFFICHE ===');
    if (form.programmeUrl) lines.push(`Fichier: ${form.programmeUrl}`);
    if (form.programmeLink) lines.push(`Lien: ${form.programmeLink}`);

    lines.push('\n=== RÉSERVATION ===');
    lines.push(`Motif: ${form.motif}`);

    return lines.join('\n');
  };

  /* ============ HELPERS PDF ============ */
  const drawLine = (doc, label, value, y, pageWidth) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(60, 60, 80);
    doc.text(`${label} :`, 18, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 30, 50);
    const valueLines = doc.splitTextToSize(String(value || '-'), pageWidth - 75);
    doc.text(valueLines, 55, y);
  };

  const drawSectionTitle = (doc, title, y, rgb) => {
    doc.setFillColor(rgb[0], rgb[1], rgb[2]);
    doc.rect(14, y - 4, 4, 7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(rgb[0], rgb[1], rgb[2]);
    doc.text(title, 22, y + 1);
  };

  /* ============ GÉNÉRATION DU PDF (avec CDN) ============ */
  const generatePDF = async (reservation) => {
    setGeneratingPdf(true);
    try {
      console.log('🔵 Chargement de jsPDF…');
      const jsPDF = await loadJsPDF();
      console.log('✅ jsPDF chargé');

      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();
      const refNumber = reservation?.id
        ? `R-${String(reservation.id).padStart(6, '0')}`
        : 'R-PENDING';

      // === EN-TÊTE COLORÉ ===
      doc.setFillColor(22, 163, 74);
      doc.rect(0, 0, pageWidth / 4, 35, 'F');
      doc.setFillColor(96, 165, 250);
      doc.rect(pageWidth / 4, 0, pageWidth / 4, 35, 'F');
      doc.setFillColor(219, 39, 119);
      doc.rect(pageWidth / 2, 0, pageWidth / 4, 35, 'F');
      doc.setFillColor(212, 175, 55);
      doc.rect((pageWidth / 4) * 3, 0, pageWidth / 4, 35, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      doc.text("CITE D'INNOVATION UCA", pageWidth / 2, 16, { align: 'center' });
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text('Universite Cadi Ayyad - Marrakech', pageWidth / 2, 24, { align: 'center' });
      doc.setFontSize(9);
      doc.text('Recepisse de demande de reservation', pageWidth / 2, 31, { align: 'center' });

      let y = 50;

      // === RÉFÉRENCE & STATUT ===
      doc.setFillColor(245, 247, 250);
      doc.rect(14, y - 6, pageWidth - 28, 18, 'F');
      doc.setTextColor(30, 30, 50);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text(`Reference : ${refNumber}`, 18, y);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text(`Emis le : ${new Date().toLocaleString('fr-FR')}`, 18, y + 6);

      doc.setFillColor(254, 240, 138);
      doc.roundedRect(pageWidth - 60, y - 3, 46, 9, 2, 2, 'F');
      doc.setTextColor(133, 77, 14);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text('EN ATTENTE', pageWidth - 37, y + 3, { align: 'center' });

      y += 24;

      // === SECTION : LOCAL RÉSERVÉ ===
      drawSectionTitle(doc, 'LOCAL RESERVE', y, [22, 163, 74]);
      y += 8;
      drawLine(doc, 'Local', `${local.nom} (${local.code})`, y, pageWidth); y += 6;
      if (local.localisation) {
        drawLine(doc, 'Localisation', local.localisation, y, pageWidth); y += 6;
      }
      if (local.capacite) {
        drawLine(doc, 'Capacite', `${local.capacite} personnes`, y, pageWidth); y += 6;
      }
      y += 4;

      // === SECTION : CRÉNEAU ===
      drawSectionTitle(doc, 'CRENEAU DEMANDE', y, [96, 165, 250]);
      y += 8;
      drawLine(doc, 'Debut', formatDateTime(form.dateDebut), y, pageWidth); y += 6;
      drawLine(doc, 'Fin', formatDateTime(form.dateFin), y, pageWidth); y += 6;
      y += 4;

      // === SECTION : DEMANDEUR ===
      drawSectionTitle(doc, 'DEMANDEUR', y, [219, 39, 119]);
      y += 8;
      drawLine(doc, 'Nom complet', `${form.prenom} ${form.nom}`, y, pageWidth); y += 6;
      drawLine(doc, 'Email', form.email, y, pageWidth); y += 6;
      drawLine(doc, 'Telephone', form.telephone, y, pageWidth); y += 6;
      drawLine(doc, 'Type', form.type, y, pageWidth); y += 6;
      drawLine(doc, 'Organisme', form.organisme, y, pageWidth); y += 6;
      drawLine(doc, 'Etablissement', etablissementLabel, y, pageWidth); y += 6;
      drawLine(doc, 'Ville', form.villeEtablissement, y, pageWidth); y += 6;
      y += 4;

      // === SECTION : ÉVÉNEMENT ===
      drawSectionTitle(doc, 'EVENEMENT', y, [212, 175, 55]);
      y += 8;
      drawLine(doc, "Type d'evenement", eventTypeLabel, y, pageWidth); y += 6;
      drawLine(
        doc,
        'Public recu',
        AUDIENCE.find((a) => a.value === form.publicRecu)?.label || form.publicRecu,
        y, pageWidth
      ); y += 6;
      drawLine(doc, 'Participants', String(form.nombreParticipants), y, pageWidth); y += 6;
      if (form.equipements.length > 0) {
        drawLine(doc, 'Equipements', form.equipements.join(', '), y, pageWidth); y += 6;
      }

      if (y > 240) {
        doc.addPage();
        y = 20;
      }

      // === MOTIF ===
      if (form.motif) {
        y += 4;
        drawSectionTitle(doc, 'MOTIF', y, [22, 163, 74]);
        y += 8;
        const motifLines = doc.splitTextToSize(form.motif, pageWidth - 36);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(60, 60, 80);
        doc.text(motifLines, 18, y);
        y += motifLines.length * 4.5;
      }

      // === LOGISTIQUE ===
      if (form.descriptionLogistique) {
        y += 4;
        if (y > 240) { doc.addPage(); y = 20; }
        drawSectionTitle(doc, 'LOGISTIQUE', y, [96, 165, 250]);
        y += 8;
        const logLines = doc.splitTextToSize(form.descriptionLogistique, pageWidth - 36);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(60, 60, 80);
        doc.text(logLines, 18, y);
        y += logLines.length * 4.5;
      }

      // === FOOTER ===
      const footerY = doc.internal.pageSize.getHeight() - 25;
      doc.setFillColor(245, 247, 250);
      doc.rect(0, footerY - 4, pageWidth, 29, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(219, 39, 119);
      doc.text('IMPORTANT', 14, footerY + 2);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(80, 80, 100);
      doc.text(
        "Cette demande de reservation est soumise a validation par l'administration de la Cite d'Innovation.",
        14, footerY + 8
      );
      doc.text(
        'Vous recevrez un email de confirmation des que votre demande aura ete traitee.',
        14, footerY + 12
      );
      doc.text(
        'Conservez ce recepisse comme preuve de votre demande.',
        14, footerY + 16
      );

      doc.setFont('helvetica', 'italic');
      doc.setFontSize(7);
      doc.setTextColor(120, 120, 140);
      doc.text(
        `(c) ${new Date().getFullYear()} Cite d'Innovation UCA - contact@cite-innovation.ma`,
        pageWidth / 2, footerY + 22, { align: 'center' }
      );

      // === BARRE COLORÉE FOOTER ===
      doc.setFillColor(22, 163, 74);
      doc.rect(0, footerY + 24, pageWidth / 4, 2, 'F');
      doc.setFillColor(96, 165, 250);
      doc.rect(pageWidth / 4, footerY + 24, pageWidth / 4, 2, 'F');
      doc.setFillColor(219, 39, 119);
      doc.rect(pageWidth / 2, footerY + 24, pageWidth / 4, 2, 'F');
      doc.setFillColor(212, 175, 55);
      doc.rect((pageWidth / 4) * 3, footerY + 24, pageWidth / 4, 2, 'F');

      const fileName = `reservation_${refNumber}_${form.nom}_${form.prenom}.pdf`;
      doc.save(fileName);
      console.log('✅ PDF généré :', fileName);
      toast.success('📄 Récépissé PDF téléchargé !');
    } catch (error) {
      console.error('❌ Erreur génération PDF :', error);
      toast.error('Erreur PDF : ' + error.message);
    } finally {
      setGeneratingPdf(false);
    }
  };

  const handleLogoFile = async (file) => {
    if (!file) return;
    setUploadingLogo(true);
    try {
      const res = await publicUploadService.upload(file);
      setForm((p) => ({
        ...p,
        logoOrganismeUrl: res.url,
        logoOrganismeName: file.name,
      }));
      toast.success('Logo envoyé');
    } catch (e) {
      toast.error("Impossible d'envoyer le logo");
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleProgrammeFile = async (file) => {
    if (!file) return;
    setUploadingProgramme(true);
    try {
      const res = await publicUploadService.upload(file);
      setForm((p) => ({
        ...p,
        programmeUrl: res.url,
        programmeName: file.name,
      }));
      toast.success('Programme/Affiche envoyé');
    } catch (e) {
      toast.error("Impossible d'envoyer le fichier Programme/Affiche");
    } finally {
      setUploadingProgramme(false);
    }
  };

  const handleCalendarSelect = ({ start, end }) => {
    setForm((p) => ({
      ...p,
      dateDebut: start?.slice(0, 16) ?? p.dateDebut,
      dateFin: end?.slice(0, 16) ?? p.dateFin,
    }));
    setActivePreset(null);
    setDisponible(null);
    toast.success('Créneau sélectionné');
  };

  const checkAvailability = async () => {
    if (!form.dateDebut || !form.dateFin) {
      toast.error('Définissez la période de réservation');
      return false;
    }
    if (new Date(form.dateFin) <= new Date(form.dateDebut)) {
      toast.error('La fin doit être après le début');
      return false;
    }
    const startHour = new Date(form.dateDebut).getHours();
    const endHour = new Date(form.dateFin).getHours();
    const endMin = new Date(form.dateFin).getMinutes();
    if (startHour < 9 || (endHour > 19 || (endHour === 19 && endMin > 0))) {
      toast.error('⏰ Les réservations sont autorisées uniquement entre 9h00 et 19h00');
      return false;
    }
    try {
      const ok = await localService.checkDisponibilite(
        localId,
        toLocalDateTime(form.dateDebut),
        toLocalDateTime(form.dateFin),
      );
      const available = ok === true || ok?.disponible === true;
      setDisponible(available);
      if (!available) {
        toast.error('🚫 Ce créneau est déjà réservé');
        return false;
      }
      return true;
    } catch {
      toast.error('Impossible de vérifier la disponibilité');
      return false;
    }
  };

  const next = async () => {
    if (step === 0) {
      if (!form.nom.trim() || !form.prenom.trim() || !form.email.trim()) {
        toast.error('Nom, prénom et email sont obligatoires');
        return;
      }
      if (!form.telephone.trim()) {
        toast.error('Numéro de téléphone obligatoire');
        return;
      }
      if (!form.organisme.trim()) {
        toast.error('Organisme obligatoire');
        return;
      }
      if (!form.etablissement.trim()) {
        toast.error('Établissement obligatoire');
        return;
      }
      if (form.etablissement === 'AUTRE' && !form.etablissementAutre.trim()) {
        toast.error("Précisez le nom de l'établissement");
        return;
      }
      if (!isValidEmail(form.email)) {
        toast.error('Adresse email invalide (ex: nom@domaine.com)');
        return;
      }
      if (!isValidPhoneMA(form.telephone)) {
        toast.error('Numéro invalide (ex: 06XXXXXXXX ou +2126XXXXXXXX)');
        return;
      }
      if (!form.villeEtablissement.trim()) {
        toast.error("Ville de l'établissement obligatoire");
        return;
      }
    }

    if (step === 1) {
      if (!form.nombreParticipants) {
        toast.error('Nombre de participants obligatoire');
        return;
      }
      if (!form.motif?.trim()) {
        toast.error('Motif obligatoire');
        return;
      }
      if (form.eventType === 'AUTRE' && !form.eventTypeAutre?.trim()) {
        toast.error("Précisez le type d'événement (Autre)");
        return;
      }
      if (!form.descriptionLogistique?.trim()) {
        toast.error('Description logistique obligatoire');
        return;
      }
      if (!form.programmeUrl && !form.programmeLink?.trim()) {
        toast.error('Programme/Affiche obligatoire (fichier ou lien)');
        return;
      }
    }

    if (step === 2) {
      const ok = await checkAvailability();
      if (!ok) return;
    }

    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const submit = async () => {
    if (!form.ackReservation || !form.ackEmail) {
      toast.error('Veuillez cocher les 2 confirmations');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        localId: Number(localId),
        dateDebut: toLocalDateTime(form.dateDebut),
        dateFin: toLocalDateTime(form.dateFin),
        nombreParticipants: Number(form.nombreParticipants),
        motif: buildMotifFinal(),
        nom: form.nom,
        prenom: form.prenom,
        email: form.email,
        telephone: form.telephone,
        type: form.type,
        matricule: null,
        organisme: form.organisme,
      };

      const created = await reservationService.createPublic(payload);
      setCreatedReservation(created);
      toast.success(`✅ Demande envoyée${created?.id ? ` (#${created.id})` : ''}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de la réservation');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loading label="Chargement…" />;
  if (!local) {
    return (
      <div className="py-12 text-center">
        <p className="text-stone-600">Local introuvable.</p>
        <Link to="/locaux">
          <Button variant="outline" className="mt-4">
            Retour
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <motion.div
      className="reservation-wizard mx-auto max-w-5xl space-y-6 pb-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <Link
        to={backTo}
        className="inline-flex items-center gap-1.5 rounded-full bg-white border border-stone-200 px-4 py-2 text-sm font-semibold text-stone-700 hover:border-[#E07A5F] hover:text-[#C96A50] hover:shadow-md hover:shadow-[#E07A5F]/15 transition-all"
      >
        <ArrowLeft className="h-4 w-4" />
        {local.nom}
      </Link>

      {/* HEADER */}
      <div className="overflow-hidden rounded-3xl border border-stone-200/70 bg-white">
        <div className="h-1.5 bg-gradient-to-r from-[#E07A5F] via-[#F2CC8F] to-[#5BBFA0]" />
        <div className="p-6 sm:p-7">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#E07A5F] to-[#F2CC8F] shadow-md shadow-[#E07A5F]/30">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
                Formulaire de réservation
              </h1>
              <p className="mt-2 text-stone-600 flex items-start gap-2 text-sm">
                <BadgeInfo className="h-4 w-4 text-[#E07A5F] mt-0.5 shrink-0" />
                <span>
                  Attention : toute demande doit être faite{' '}
                  <b className="text-stone-800">au moins {MIN_DAYS_BEFORE} jours</b> avant
                  l&apos;événement. Horaires : <b>9h00 – 19h00</b>. La réservation est effective après validation.
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* STEPPER */}
      <div className="relative">
        <div className="absolute top-5 left-[10%] right-[10%] h-[3px] bg-stone-200 rounded-full" />
        <div
          className="absolute top-5 left-[10%] h-[3px] rounded-full transition-all duration-500"
          style={{
            width: `${(step / (STEPS.length - 1)) * 80}%`,
            background: 'linear-gradient(90deg, #E07A5F, #5BBFA0)',
          }}
        />
        <ol className="relative flex justify-between gap-2">
          {STEPS.map(({ label, icon: Icon }, i) => (
            <li
              key={label}
              className={cn(
                'flex flex-1 flex-col items-center text-xs font-semibold transition-colors',
                i === step ? 'text-[#C96A50]' : i < step ? 'text-[#4AA88D]' : 'text-stone-400',
              )}
            >
              <span
                className={cn(
                  'mb-2 flex h-10 w-10 items-center justify-center rounded-full border-2 bg-white transition-all',
                  i < step &&
                    'border-[#5BBFA0] bg-gradient-to-br from-[#5BBFA0] to-[#7DD4B8] text-white shadow-md shadow-[#5BBFA0]/30',
                  i === step &&
                    'border-[#E07A5F] bg-gradient-to-br from-[#E07A5F] to-[#E8956F] text-white shadow-md shadow-[#E07A5F]/30',
                  i > step && 'border-stone-300 text-stone-400',
                )}
              >
                {i < step ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
              </span>
              <span className="hidden sm:inline">{label}</span>
            </li>
          ))}
        </ol>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* PREVIEW LOCAL */}
        <motion.div className="lg:col-span-2" layout>
          <div className="overflow-hidden rounded-3xl border border-stone-200/70 bg-white">
            <div className="h-1.5 bg-gradient-to-r from-[#9B8EC4] via-[#B8AAD4] to-[#FFCFD8]" />
            <div className="px-6 py-4 border-b border-stone-200">
              <h2 className="font-display text-base font-bold text-stone-900">
                Local sélectionné
              </h2>
            </div>
            <div className="p-6 space-y-3">
              <p className="text-sm text-stone-700">
                <b className="text-stone-900">{local.nom}</b>{' '}
                <span className="text-stone-400">({local.code})</span>
              </p>
              <MediaViewer local={local} />
            </div>
          </div>
        </motion.div>

        {/* FORMULAIRE */}
        <motion.div className="lg:col-span-3" layout>
          <div className="overflow-hidden rounded-3xl border border-stone-200/70 bg-white">
            <div className="h-1.5 bg-gradient-to-r from-[#E07A5F] via-[#F2CC8F] to-[#5BBFA0]" />
            <div className="px-6 py-4 border-b border-stone-200">
              <h2 className="font-display text-lg font-extrabold text-stone-900">
                {STEPS[step].label}
              </h2>
            </div>
            <div className="p-6">
              <AnimatePresence mode="wait">
                {/* STEP 0 : Demandeur */}
                {step === 0 && (
                  <motion.div
                    key="step0"
                    className="space-y-4"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Input
                        label="Nom *"
                        value={form.nom}
                        onChange={(e) => setForm((p) => ({ ...p, nom: e.target.value }))}
                        required
                      />
                      <Input
                        label="Prénom *"
                        value={form.prenom}
                        onChange={(e) => setForm((p) => ({ ...p, prenom: e.target.value }))}
                        required
                      />
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <Input
                          label="Adresse email *"
                          type="email"
                          value={form.email}
                          onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                          required
                        />
                        {emailInvalid && (
                          <p className="mt-1 text-xs text-red-600">
                            Adresse email invalide (ex: nom@domaine.com)
                          </p>
                        )}
                      </div>

                      <div>
                        <Input
                          label="Numéro de téléphone *"
                          value={form.telephone}
                          onChange={(e) =>
                            setForm((p) => ({ ...p, telephone: e.target.value }))
                          }
                          required
                        />
                        {phoneInvalid && (
                          <p className="mt-1 text-xs text-red-600">
                            Numéro invalide (ex: 06XXXXXXXX ou +2126XXXXXXXX)
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="mb-1.5 block text-sm font-semibold text-stone-700">
                          Type
                        </label>
                        <select
                          className="cim-field w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm text-stone-800 focus:border-[#E07A5F] focus:outline-none focus:ring-4 focus:ring-[#E07A5F]/15"
                          value={form.type}
                          onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}
                        >
                          <option value="INTERNE">INTERNE</option>
                          <option value="EXTERNE">EXTERNE</option>
                        </select>
                      </div>

                      <Input
                        label="Organisme *"
                        value={form.organisme}
                        onChange={(e) => setForm((p) => ({ ...p, organisme: e.target.value }))}
                        required
                      />
                    </div>

                    {/* ===== SELECT ÉTABLISSEMENT UCA ===== */}
                    <div>
                      <label className="mb-1.5 text-sm font-semibold text-stone-700 flex items-center gap-1.5">
                        <School className="h-4 w-4 text-[#E07A5F]" />
                        Établissement <span className="text-red-500">*</span>
                      </label>
                      <select
                        className="cim-field w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm text-stone-800 focus:border-[#E07A5F] focus:outline-none focus:ring-4 focus:ring-[#E07A5F]/15"
                        value={form.etablissement}
                        onChange={(e) => handleEtablissementChange(e.target.value)}
                        required
                      >
                        <option value="">— Sélectionnez un établissement —</option>
                        <optgroup label="🎓 Université Cadi Ayyad (UCA)">
                          {ETABLISSEMENTS_UCA.filter((e) => e.value !== 'AUTRE').map((e) => (
                            <option key={e.value} value={e.value}>
                              {e.label}
                            </option>
                          ))}
                        </optgroup>
                        <optgroup label="🏢 Autre">
                          <option value="AUTRE">Autre établissement (à préciser)</option>
                        </optgroup>
                      </select>
                    </div>

                    {form.etablissement === 'AUTRE' && (
                      <Input
                        label="Précisez le nom de l'établissement *"
                        value={form.etablissementAutre}
                        onChange={(e) =>
                          setForm((p) => ({ ...p, etablissementAutre: e.target.value }))
                        }
                        required
                      />
                    )}

                    <Input
                      label="Ville de l'établissement *"
                      value={form.villeEtablissement}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, villeEtablissement: e.target.value }))
                      }
                      required
                    />

                    <div className="rounded-2xl border border-stone-200 bg-gradient-to-br from-[#FEF4F1]/40 to-white p-4">
                      <p className="mb-3 text-sm font-semibold text-stone-800 flex items-center gap-2">
                        <ImageIcon className="h-4 w-4 text-[#E07A5F]" />
                        Logo de l&apos;organisme (optionnel)
                      </p>

                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleLogoFile(e.target.files?.[0])}
                        className="block w-full text-sm text-stone-700 file:mr-4 file:rounded-full file:border-0 file:bg-gradient-to-r file:from-[#E07A5F] file:to-[#E8956F] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white file:shadow-md file:shadow-[#E07A5F]/30 hover:file:shadow-lg hover:file:shadow-[#E07A5F]/45 file:transition-all file:cursor-pointer"
                      />

                      <div className="mt-2 text-xs text-stone-600">
                        {uploadingLogo
                          ? 'Envoi en cours...'
                          : form.logoOrganismeUrl
                            ? `Envoyé : ${prettyFileName(form.logoOrganismeName)}`
                            : 'Aucun fichier envoyé.'}
                      </div>

                      {form.logoOrganismeUrl && (
                        <a
                          href={form.logoOrganismeUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-[#E07A5F] hover:text-[#C96A50] hover:underline"
                        >
                          <LinkIcon className="h-4 w-4" />
                          Voir le logo
                        </a>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* STEP 1 : Événement */}
                {step === 1 && (
                  <motion.div
                    key="step1"
                    className="space-y-5"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <div className="rounded-2xl border border-stone-200 bg-gradient-to-br from-[#FEF4F1]/30 to-white p-4">
                      <p className="mb-3 text-sm font-semibold text-stone-800">
                        Type d&apos;événement
                      </p>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {EVENT_TYPES.map((t) => {
                          const checked = form.eventType === t.value;
                          return (
                            <label
                              key={t.value}
                              className={cn(
                                'flex items-center gap-2 rounded-xl border-2 p-3 cursor-pointer transition-all',
                                checked
                                  ? 'border-[#E07A5F] bg-[#FEF4F1]/60 shadow-sm shadow-[#E07A5F]/20'
                                  : 'border-stone-200 bg-white hover:border-stone-300',
                              )}
                            >
                              <input
                                type="radio"
                                name="eventType"
                                checked={checked}
                                onChange={() => setForm((p) => ({ ...p, eventType: t.value }))}
                                className="accent-[#E07A5F]"
                              />
                              <span
                                className={cn(
                                  'text-sm',
                                  checked ? 'font-semibold text-[#C96A50]' : 'text-stone-700',
                                )}
                              >
                                {t.label}
                              </span>
                            </label>
                          );
                        })}
                      </div>

                      {form.eventType === 'AUTRE' && (
                        <Input
                          containerClassName="mt-3"
                          label="Précisez *"
                          value={form.eventTypeAutre}
                          onChange={(e) =>
                            setForm((p) => ({ ...p, eventTypeAutre: e.target.value }))
                          }
                          required
                        />
                      )}
                    </div>

                    <Input
                      label="Nombre de participants *"
                      type="number"
                      min={1}
                      max={local.capacite}
                      value={form.nombreParticipants}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, nombreParticipants: e.target.value }))
                      }
                      required
                    />

                    <div>
                      <label className="mb-1.5 block text-sm font-semibold text-stone-700">
                        Motif <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        className="cim-field w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm text-stone-800 placeholder:text-stone-400 focus:border-[#E07A5F] focus:outline-none focus:ring-4 focus:ring-[#E07A5F]/15"
                        rows={4}
                        value={form.motif}
                        onChange={(e) => setForm((p) => ({ ...p, motif: e.target.value }))}
                        placeholder="Décrivez l'activité prévue…"
                        required
                      />
                    </div>

                    <div className="rounded-2xl border border-stone-200 bg-gradient-to-br from-[#F0FAF5]/40 to-white p-4">
                      <p className="mb-3 text-sm font-semibold text-stone-800">Public reçu</p>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {AUDIENCE.map((a) => {
                          const checked = form.publicRecu === a.value;
                          return (
                            <label
                              key={a.value}
                              className={cn(
                                'flex items-center gap-2 rounded-xl border-2 p-3 cursor-pointer transition-all',
                                checked
                                  ? 'border-[#5BBFA0] bg-[#F0FAF5]/60 shadow-sm shadow-[#5BBFA0]/20'
                                  : 'border-stone-200 bg-white hover:border-stone-300',
                              )}
                            >
                              <input
                                type="radio"
                                name="publicRecu"
                                checked={checked}
                                onChange={() => setForm((p) => ({ ...p, publicRecu: a.value }))}
                                className="accent-[#5BBFA0]"
                              />
                              <span
                                className={cn(
                                  'text-sm',
                                  checked ? 'font-semibold text-[#4AA88D]' : 'text-stone-700',
                                )}
                              >
                                {a.label}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-stone-200 bg-gradient-to-br from-[#FAF5FF]/40 to-white p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Wrench className="h-4 w-4 text-[#9B8EC4]" />
                        <p className="text-sm font-semibold text-stone-800">
                          Équipements demandés
                        </p>
                      </div>

                      <div className="grid gap-2 sm:grid-cols-2">
                        {EQUIP_OPTIONS.map((eq) => {
                          const checked = form.equipements.includes(eq);
                          return (
                            <label
                              key={eq}
                              className={cn(
                                'flex items-center gap-2 rounded-xl border-2 p-3 cursor-pointer transition-all',
                                checked
                                  ? 'border-[#9B8EC4] bg-[#FAF5FF]/60 shadow-sm shadow-[#9B8EC4]/20'
                                  : 'border-stone-200 bg-white hover:border-stone-300',
                              )}
                            >
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() =>
                                  setForm((p) => ({
                                    ...p,
                                    equipements: checked
                                      ? p.equipements.filter((x) => x !== eq)
                                      : [...p.equipements, eq],
                                  }))
                                }
                                className="accent-[#9B8EC4]"
                              />
                              <span
                                className={cn(
                                  'text-sm',
                                  checked ? 'font-semibold text-[#806FB0]' : 'text-stone-700',
                                )}
                              >
                                {eq}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-semibold text-stone-700">
                        Description logistique (disposition matériels){' '}
                        <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        className="cim-field w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm text-stone-800 placeholder:text-stone-400 focus:border-[#E07A5F] focus:outline-none focus:ring-4 focus:ring-[#E07A5F]/15"
                        rows={4}
                        value={form.descriptionLogistique}
                        onChange={(e) =>
                          setForm((p) => ({ ...p, descriptionLogistique: e.target.value }))
                        }
                        placeholder="Ex: disposition en U, 20 chaises, 2 tables, canapés à déplacer, etc."
                        required
                      />
                    </div>

                    <div className="rounded-2xl border border-stone-200 bg-gradient-to-br from-[#FEF4F1]/40 to-white p-4 space-y-3">
                      <p className="text-sm font-semibold text-stone-800 flex items-center gap-2">
                        <Upload className="h-4 w-4 text-[#E07A5F]" />
                        Programme / Affiche (obligatoire) — fichier OU lien
                      </p>

                      <input
                        type="file"
                        accept="application/pdf,image/*"
                        onChange={(e) => handleProgrammeFile(e.target.files?.[0])}
                        className="block w-full text-sm text-stone-700 file:mr-4 file:rounded-full file:border-0 file:bg-gradient-to-r file:from-[#E07A5F] file:to-[#E8956F] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white file:shadow-md file:shadow-[#E07A5F]/30 hover:file:shadow-lg file:transition-all file:cursor-pointer"
                      />

                      <div className="text-xs text-stone-600">
                        {uploadingProgramme
                          ? 'Envoi en cours...'
                          : form.programmeUrl
                            ? `Envoyé : ${prettyFileName(form.programmeName)}`
                            : 'Aucun fichier envoyé.'}
                      </div>

                      {form.programmeUrl && (
                        <a
                          href={form.programmeUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 text-sm font-semibold text-[#E07A5F] hover:text-[#C96A50] hover:underline"
                        >
                          <LinkIcon className="h-4 w-4" />
                          Voir le fichier
                        </a>
                      )}

                      <Input
                        label="Lien programme/affiche (optionnel si fichier envoyé)"
                        icon={LinkIcon}
                        placeholder="Lien Google Drive / PDF / image…"
                        value={form.programmeLink}
                        onChange={(e) =>
                          setForm((p) => ({ ...p, programmeLink: e.target.value }))
                        }
                      />
                    </div>
                  </motion.div>
                )}

                {/* STEP 2 : Créneau */}
                {step === 2 && (
                  <motion.div
                    key="step2"
                    className="space-y-6"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <DurationSelector
                      dateDebut={form.dateDebut}
                      dateFin={form.dateFin}
                      activePreset={activePreset}
                      onPresetChange={setActivePreset}
                      onChange={({ dateDebut, dateFin }) =>
                        setForm((p) => ({
                          ...p,
                          ...(dateDebut != null && { dateDebut }),
                          ...(dateFin != null && { dateFin }),
                        }))
                      }
                    />

                    <AvailabilityCalendar
                      localId={localId}
                      onSelectSlot={handleCalendarSelect}
                      selectedStart={form.dateDebut}
                      selectedEnd={form.dateFin}
                    />

                    {disponible === true && (
                      <div className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#F0FAF5] to-[#E8F5EF] border border-[#5BBFA0]/30 p-3">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#5BBFA0]">
                          <Check className="h-4 w-4 text-white" />
                        </div>
                        <p className="text-sm font-semibold text-[#3D8B74]">
                          Créneau disponible
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* STEP 3 : Confirmation */}
                {step === 3 && (
                  <motion.div
                    key="step3"
                    className="space-y-4"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    {!createdReservation ? (
                      <>
                        {/* RÉCAPITULATIF AVEC BOUTONS MODIFIER */}
                        <div className="rounded-2xl bg-gradient-to-br from-[#F0FAF5] to-[#E8F5EF] border border-[#5BBFA0]/30 p-5 text-sm text-stone-700 space-y-3">
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-bold text-[#3D8B74] text-base">📋 Récapitulatif</p>
                            <span className="text-xs text-stone-500 italic">
                              Vérifiez bien avant d&apos;envoyer
                            </span>
                          </div>

                          {/* Section Demandeur */}
                          <div className="rounded-xl bg-white/70 border border-[#5BBFA0]/20 p-3">
                            <div className="flex items-center justify-between mb-2">
                              <p className="font-bold text-stone-800 text-sm flex items-center gap-1.5">
                                <UserIcon className="h-3.5 w-3.5 text-[#E07A5F]" />
                                Demandeur
                              </p>
                              <button
                                type="button"
                                onClick={() => setStep(0)}
                                className="inline-flex items-center gap-1 rounded-full bg-[#E07A5F]/10 text-[#C96A50] hover:bg-[#E07A5F]/20 px-2.5 py-1 text-[10px] font-bold transition-all"
                              >
                                <Edit3 className="h-3 w-3" />
                                Modifier
                              </button>
                            </div>
                            <div className="space-y-1 text-xs text-stone-600">
                              <p><b>Nom :</b> {form.prenom} {form.nom}</p>
                              <p><b>Email :</b> {form.email}</p>
                              <p><b>Téléphone :</b> {form.telephone}</p>
                              <p><b>Organisme :</b> {form.organisme}</p>
                              <p><b>Établissement :</b> {etablissementLabel} — {form.villeEtablissement}</p>
                            </div>
                          </div>

                          {/* Section Événement */}
                          <div className="rounded-xl bg-white/70 border border-[#5BBFA0]/20 p-3">
                            <div className="flex items-center justify-between mb-2">
                              <p className="font-bold text-stone-800 text-sm flex items-center gap-1.5">
                                <FileText className="h-3.5 w-3.5 text-[#E07A5F]" />
                                Événement
                              </p>
                              <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="inline-flex items-center gap-1 rounded-full bg-[#E07A5F]/10 text-[#C96A50] hover:bg-[#E07A5F]/20 px-2.5 py-1 text-[10px] font-bold transition-all"
                              >
                                <Edit3 className="h-3 w-3" />
                                Modifier
                              </button>
                            </div>
                            <div className="space-y-1 text-xs text-stone-600">
                              <p><b>Type :</b> {eventTypeLabel}</p>
                              <p><b>Participants :</b> {form.nombreParticipants}</p>
                              <p><b>Public :</b> {AUDIENCE.find(a => a.value === form.publicRecu)?.label}</p>
                              {form.equipements.length > 0 && (
                                <p><b>Équipements :</b> {form.equipements.join(', ')}</p>
                              )}
                              <p><b>Logistique :</b> {form.descriptionLogistique}</p>
                            </div>
                          </div>

                          {/* Section Créneau */}
                          <div className="rounded-xl bg-white/70 border border-[#5BBFA0]/20 p-3">
                            <div className="flex items-center justify-between mb-2">
                              <p className="font-bold text-stone-800 text-sm flex items-center gap-1.5">
                                <Calendar className="h-3.5 w-3.5 text-[#E07A5F]" />
                                Créneau
                              </p>
                              <button
                                type="button"
                                onClick={() => setStep(2)}
                                className="inline-flex items-center gap-1 rounded-full bg-[#E07A5F]/10 text-[#C96A50] hover:bg-[#E07A5F]/20 px-2.5 py-1 text-[10px] font-bold transition-all"
                              >
                                <Edit3 className="h-3 w-3" />
                                Modifier
                              </button>
                            </div>
                            <div className="space-y-1 text-xs text-stone-600">
                              <p><b>Local :</b> {local.nom} ({local.code})</p>
                              <p><b>Début :</b> {formatDateTime(form.dateDebut)}</p>
                              <p><b>Fin :</b> {formatDateTime(form.dateFin)}</p>
                            </div>
                          </div>
                        </div>

                        <div className="rounded-2xl border border-stone-200 bg-gradient-to-br from-[#FEF4F1]/40 to-white p-5 space-y-4">
                          <label className="flex items-start gap-3 text-sm text-stone-700 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={form.ackReservation}
                              onChange={(e) =>
                                setForm((p) => ({ ...p, ackReservation: e.target.checked }))
                              }
                              className="mt-1 accent-[#E07A5F]"
                            />
                            <span className="leading-relaxed">
                              Veuillez noter que la réservation n&apos;est effective qu&apos;après une
                              confirmation de la Cité de l&apos;Innovation.
                              <b className="text-red-600"> *</b>
                            </span>
                          </label>

                          <label className="flex items-start gap-3 text-sm text-stone-700 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={form.ackEmail}
                              onChange={(e) =>
                                setForm((p) => ({ ...p, ackEmail: e.target.checked }))
                              }
                              className="mt-1 accent-[#E07A5F]"
                            />
                            <span className="leading-relaxed">
                              La confirmation de réservation vous sera communiquée par Email.
                              <b className="text-red-600"> *</b>
                            </span>
                          </label>
                        </div>
                      </>
                    ) : (
                      // ===== ÉCRAN DE SUCCÈS + BOUTON PDF =====
                      <div className="space-y-5">
                        <div className="rounded-2xl bg-gradient-to-br from-[#F0FAF5] to-[#D1FAE5] border-2 border-[#5BBFA0] p-6 text-center">
                          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#5BBFA0] to-[#10B981] shadow-lg">
                            <Check className="h-8 w-8 text-white" />
                          </div>
                          <h3 className="font-display text-2xl font-extrabold text-[#3D8B74] mb-2">
                            ✅ Demande envoyée !
                          </h3>
                          <p className="text-sm text-stone-700 mb-1">
                            Votre demande de réservation <b>#{createdReservation.id}</b> a bien été enregistrée.
                          </p>
                          <p className="text-xs text-stone-600">
                            Vous recevrez un email dès qu&apos;elle sera validée par l&apos;administration.
                          </p>
                        </div>

                        <div className="rounded-2xl border-2 border-dashed border-[#E07A5F]/50 bg-gradient-to-br from-[#FEF4F1] to-white p-6 text-center">
                          <FileText className="mx-auto h-10 w-10 text-[#E07A5F] mb-3" />
                          <p className="font-display text-lg font-bold text-stone-900 mb-2">
                            📄 Téléchargez votre récépissé
                          </p>
                          <p className="text-xs text-stone-600 mb-4">
                            Conservez ce PDF comme preuve de votre demande de réservation.
                          </p>
                          <button
                            type="button"
                            onClick={() => generatePDF(createdReservation)}
                            disabled={generatingPdf}
                            className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#E07A5F] to-[#E8956F] px-7 py-3 text-sm font-bold text-white shadow-lg shadow-[#E07A5F]/40 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                          >
                            <Download className="h-4 w-4 transition-transform group-hover:translate-y-0.5" />
                            {generatingPdf ? 'Génération…' : 'Télécharger le récépissé PDF'}
                          </button>
                        </div>

                        <div className="text-center">
                          <button
                            type="button"
                            onClick={() => navigate('/locaux')}
                            className="inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white px-5 py-2.5 text-sm font-semibold text-stone-700 hover:border-stone-400 hover:shadow-md transition-all"
                          >
                            Retour aux locaux
                          </button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* BOUTONS NAVIGATION */}
              {!createdReservation && (
                <div className="mt-8 flex justify-between gap-2">
                  {step > 0 && (
                    <button
                      type="button"
                      onClick={() => setStep((s) => s - 1)}
                      className="inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white px-5 py-2.5 text-sm font-semibold text-stone-700 hover:border-stone-400 hover:shadow-md transition-all"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Précédent
                    </button>
                  )}

                  <div className="ml-auto">
                    {step < STEPS.length - 1 ? (
                      <button
                        type="button"
                        onClick={next}
                        className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#E07A5F] to-[#E8956F] px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-[#E07A5F]/30 hover:shadow-lg hover:shadow-[#E07A5F]/45 hover:-translate-y-0.5 transition-all"
                      >
                        Suivant
                        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                      </button>
                    ) : (
                      <Button
                        onClick={submit}
                        loading={submitting}
                        className="bg-gradient-to-r from-[#5BBFA0] to-[#7DD4B8] hover:from-[#4AA88D] hover:to-[#5BBFA0] text-white border-transparent shadow-md shadow-[#5BBFA0]/30 rounded-full px-6"
                      >
                        Envoyer la demande
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}