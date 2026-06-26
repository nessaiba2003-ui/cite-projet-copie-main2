 import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import ImageDropzone from './ImageDropzone';
import uploadService from '@/services/uploadService';
import { resolveMediaUrl } from '@/utils/media';
import {
  DISPOSITION_OPTIONS,
  EQUIPEMENT_SUGGESTIONS,
  TYPE_LOCAL_OPTIONS,
  FLOOR_OPTIONS,
} from '@/utils/poles';
import { LOCAL_STATUS } from '@/utils/constants';
import { cn } from '@/utils/helpers';

const emptyForm = {
  code: '',
  nom: '',
  capacite: '',
  etage: 0,
  description: '',
  statut: LOCAL_STATUS.DISPONIBLE,
  raisonIndisponibilite: '',
  typeLocal: '',
  disposition: '',
  equipements: [],
  images: [],
  videoUrl: '',
  panoramaUrl: '',
};

export default function LocalFormModal({
  isOpen,
  onClose,
  editing,
  poles,
  transversesPole,
  onSave,
  saving,
}) {
  const [form, setForm] = useState(emptyForm);
  const [equipInput, setEquipInput] = useState('');
  const [uploadingVideo, setUploadingVideo] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (editing) {
      setForm({
        code: editing.code ?? '',
        nom: editing.nom ?? '',
        capacite: editing.capacite ?? '',
        etage: editing.etage ?? 0,
        description: editing.description ?? '',
        statut: editing.statut ?? LOCAL_STATUS.DISPONIBLE,
        raisonIndisponibilite: editing.raisonIndisponibilite ?? '',
        typeLocal: editing.typeLocal ?? '',
        disposition: editing.disposition ?? '',
        equipements: Array.isArray(editing.equipements) ? [...editing.equipements] : [],
        images: editing.images ?? [],
        videoUrl: editing.videoUrl ?? '',
        panoramaUrl: editing.panoramaUrl ?? '',
      });
    } else {
      setForm(emptyForm);
    }
  }, [isOpen, editing]);

  const set = (key, value) => setForm((p) => ({ ...p, [key]: value }));

  const toggleEquip = (name) => {
    if (!name?.trim()) return;
    const clean = name.trim();
    setForm((p) => {
      const exists = p.equipements.includes(clean);
      return {
        ...p,
        equipements: exists
          ? p.equipements.filter((e) => e !== clean)
          : [...p.equipements, clean],
      };
    });
  };

  const addCustomEquip = () => {
    const clean = equipInput.trim();
    if (!clean) return;
    if (!form.equipements.includes(clean)) {
      set('equipements', [...form.equipements, clean]);
    }
    setEquipInput('');
  };

  const removeEquip = (name) => {
    set('equipements', form.equipements.filter((e) => e !== name));
  };

  const handleEtageChange = (newEtage) => {
    set('etage', Number(newEtage));
  };

  const handleCapaciteChange = (e) => {
    const v = e.target.value;
    if (v === '' || (Number(v) >= 0 && /^\d*$/.test(v))) {
      set('capacite', v);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.nom?.trim()) {
      toast.error('Le nom est obligatoire');
      return;
    }
    const cap = Number(form.capacite);
    if (!cap || cap < 1) {
      toast.error('La capacité doit être supérieure à 0');
      return;
    }
    if (form.etage < 0 || form.etage > 5) {
      toast.error("L'étage doit être entre 0 et 5");
      return;
    }

    // ✅ Tous les locaux sont automatiquement rattachés au pôle Services Transverses
    onSave({
      ...form,
      ...(editing ? { code: form.code } : {}),
      capacite: cap,
      etage: Number(form.etage),
      poleId: transversesPole?.id ?? null,
      poleCode: 'TRANSVERSE',
    });
  };

  const selectClass =
    'w-full rounded-xl border px-3 py-2.5 text-sm transition-colors shadow-sm ' +
    'bg-white border-stone-200 text-stone-800 ' +
    'focus:border-[#E07A5F] focus:outline-none focus:ring-4 focus:ring-[#E07A5F]/15';

  const inputClass =
    '!bg-white !border-stone-200 !text-stone-800 placeholder:!text-stone-400 ' +
    'focus:!border-[#E07A5F] focus:!ring-4 focus:!ring-[#E07A5F]/15';

  const handleVideoUpload = async (file) => {
    if (!file) return;
    setUploadingVideo(true);
    try {
      const url = await uploadService.uploadLocalVideo(file);
      set('videoUrl', url);
      toast.success('Vidéo envoyée');
    } catch (err) {
      toast.error(err?.response?.data?.message || "Échec de l'upload vidéo");
    } finally {
      setUploadingVideo(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editing ? 'Modifier le local' : 'Nouveau local'}
      size="xl"
    >
      <form onSubmit={handleSubmit} className="max-h-[75vh] space-y-6 overflow-y-auto pr-1">
        {/* Photos */}
        <section className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
          <h3 className="mb-3 text-sm font-semibold text-stone-800">Photos du local</h3>
          <ImageDropzone images={form.images} onChange={(images) => set('images', images)} />
        </section>

        {/* Infos de base */}
        <div className="grid gap-4 sm:grid-cols-2">
          {editing && (
            <Input
              label="Code"
              value={form.code}
              disabled
              className={cn(inputClass, '!bg-stone-100 !text-stone-500')}
              containerClassName="sm:col-span-2"
            />
          )}

          <Input
            label="Nom *"
            value={form.nom}
            onChange={(e) => set('nom', e.target.value)}
            required
            className={inputClass}
            containerClassName="sm:col-span-2"
          />

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-stone-700">
              Capacité <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min={1}
              step={1}
              value={form.capacite}
              onChange={handleCapaciteChange}
              onKeyDown={(e) => {
                if (e.key === '-' || e.key === 'e' || e.key === '+') {
                  e.preventDefault();
                }
              }}
              required
              placeholder="Ex: 30"
              className={selectClass}
            />
            <p className="mt-1 text-xs text-stone-500">Nombre de personnes accueillies</p>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-stone-700">
              Étage <span className="text-red-500">*</span>
            </label>
            <select
              className={selectClass}
              value={form.etage}
              onChange={(e) => handleEtageChange(e.target.value)}
              required
            >
              {FLOOR_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-stone-500">Localisation physique du local</p>
          </div>
        </div>

        {/* ✅ PÔLE AUTOMATIQUE — Badge en lecture seule (jaune doré) */}
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-stone-700">
            Pôle{' '}
            <span className="text-stone-400 font-normal text-xs">
              (assigné automatiquement)
            </span>
          </label>
          <div
            className="flex items-center gap-2.5 rounded-xl border-2 px-4 py-3 text-sm font-bold shadow-sm"
            style={{
              background: 'linear-gradient(135deg, #FDE68A 0%, #D4AF37 100%)',
              borderColor: '#D4AF37',
              color: '#7C5E10',
            }}
          >
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-amber-800 shadow-sm" />
            Pôle Services Transverses
          </div>
          <p className="mt-1.5 text-xs text-stone-500">
            Tous les locaux de la Cité d&apos;Innovation sont rattachés au pôle Services Transverses.
          </p>
        </div>

        {/* Type + Disposition + Statut */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-stone-700">
              Type de local
            </label>
            <select
              className={selectClass}
              value={form.typeLocal}
              onChange={(e) => set('typeLocal', e.target.value)}
            >
              <option value="">— Type —</option>
              {TYPE_LOCAL_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-stone-700">
              Disposition
            </label>
            <select
              className={selectClass}
              value={form.disposition}
              onChange={(e) => set('disposition', e.target.value)}
            >
              <option value="">— Disposition —</option>
              {DISPOSITION_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-semibold text-stone-700">Statut</label>
            <div className="flex flex-wrap items-center gap-3">
              <select
                className={cn(selectClass, 'flex-1 min-w-[140px]')}
                value={form.statut}
                onChange={(e) => set('statut', e.target.value)}
              >
                {Object.values(LOCAL_STATUS).map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <Badge status={form.statut} size="md" />
            </div>
          </div>
        </div>

        {form.statut !== LOCAL_STATUS.DISPONIBLE && (
          <Input
            label="Raison d'indisponibilité"
            value={form.raisonIndisponibilite}
            onChange={(e) => set('raisonIndisponibilite', e.target.value)}
            className={inputClass}
          />
        )}

        {/* ÉQUIPEMENTS */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-stone-700">
            Équipements
            <span className="ml-2 text-xs font-normal text-stone-500">
              (cliquez pour sélectionner / désélectionner)
            </span>
          </label>

          <div className="mb-3 flex flex-wrap gap-2">
            {EQUIPEMENT_SUGGESTIONS.map((eq) => {
              const isSelected = form.equipements.includes(eq);
              return (
                <button
                  key={eq}
                  type="button"
                  onClick={() => toggleEquip(eq)}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full border-2 px-3 py-1.5 text-xs font-semibold transition-all duration-200',
                    isSelected
                      ? 'border-[#E07A5F] bg-gradient-to-r from-[#E07A5F] to-[#E8956F] text-white shadow-md shadow-[#E07A5F]/30'
                      : 'border-stone-200 bg-white text-stone-700 hover:border-[#E07A5F] hover:bg-[#FEF4F1] hover:text-[#C96A50]',
                  )}
                >
                  {eq}
                  {isSelected && <X className="h-3 w-3" />}
                </button>
              );
            })}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              className={selectClass}
              placeholder="Autre équipement personnalisé…"
              value={equipInput}
              onChange={(e) => setEquipInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addCustomEquip();
                }
              }}
            />
            <Button
              type="button"
              size="sm"
              onClick={addCustomEquip}
              disabled={!equipInput.trim()}
              className="bg-[#5BBFA0] hover:bg-[#4AA88D] text-white border-transparent shrink-0"
            >
              Ajouter
            </Button>
          </div>

          {form.equipements.filter((eq) => !EQUIPEMENT_SUGGESTIONS.includes(eq)).length > 0 && (
            <div className="mt-3 rounded-xl border border-stone-200 bg-stone-50 p-3">
              <p className="mb-2 text-xs font-semibold text-stone-600">
                Équipements personnalisés
              </p>
              <div className="flex flex-wrap gap-2">
                {form.equipements
                  .filter((eq) => !EQUIPEMENT_SUGGESTIONS.includes(eq))
                  .map((eq) => (
                    <span
                      key={eq}
                      className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#9B8EC4] to-[#B8AAD4] px-3 py-1 text-xs font-semibold text-white shadow-sm"
                    >
                      {eq}
                      <button
                        type="button"
                        onClick={() => removeEquip(eq)}
                        className="hover:opacity-70 transition-opacity"
                        aria-label={`Retirer ${eq}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
              </div>
            </div>
          )}

          {form.equipements.length > 0 && (
            <p className="mt-2 text-xs text-stone-500">
              <span className="font-semibold">{form.equipements.length}</span> équipement(s)
              sélectionné(s) : {form.equipements.join(' · ')}
            </p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="mb-1 block text-sm font-semibold text-stone-700">Description</label>
          <textarea
            className={selectClass}
            rows={3}
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            placeholder="Description détaillée du local…"
          />
        </div>

        {/* Vidéo */}
        <section className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
          <h3 className="mb-3 text-sm font-semibold text-stone-800">
            Vidéo du local (optionnel)
          </h3>

          <input
            type="file"
            accept="video/mp4,video/webm,video/ogg"
            onChange={(e) => handleVideoUpload(e.target.files?.[0])}
            className="block w-full text-sm text-stone-700 file:mr-4 file:rounded-xl file:border-0 file:bg-white file:px-4 file:py-2 file:text-sm file:font-semibold hover:file:bg-stone-100"
          />

          <p className="mt-2 text-xs text-stone-600">
            {uploadingVideo
              ? 'Envoi en cours…'
              : form.videoUrl
                ? 'Vidéo définie.'
                : 'Aucune vidéo.'}
          </p>

          {form.videoUrl && (
            <div className="mt-3 space-y-2">
              <a
                href={resolveMediaUrl(form.videoUrl)}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-[#E07A5F] hover:underline"
              >
                Ouvrir la vidéo
              </a>

              <video
                className="w-full rounded-xl border border-stone-200"
                controls
                src={resolveMediaUrl(form.videoUrl)}
              />

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => set('videoUrl', '')}
                className="border-stone-300 text-stone-700 hover:bg-stone-50"
              >
                Supprimer la vidéo
              </Button>
            </div>
          )}

          <Input
            label="URL vidéo (optionnel si upload)"
            value={form.videoUrl}
            onChange={(e) => set('videoUrl', e.target.value)}
            className={cn(inputClass, 'mt-3')}
          />
        </section>

        {/* Panorama */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="URL panorama 360°"
            value={form.panoramaUrl}
            onChange={(e) => set('panoramaUrl', e.target.value)}
            className={cn(inputClass, 'sm:col-span-2')}
          />
        </div>

        {/* Actions */}
        <div className="sticky bottom-0 flex justify-end gap-3 border-t border-stone-200 bg-white pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button
            type="submit"
            loading={saving}
            className="bg-gradient-to-r from-[#5BBFA0] to-[#7DD4B8] hover:from-[#4AA88D] hover:to-[#5BBFA0] text-white border-transparent"
          >
            Enregistrer
          </Button>
        </div>
      </form>
    </Modal>
  );
}