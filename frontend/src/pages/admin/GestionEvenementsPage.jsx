import { useEffect, useState } from 'react';
import { Plus, Pencil, Upload, Archive, X, RotateCcw, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import Loading from '@/components/ui/Loading';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import ImageDropzone from '@/components/locaux/ImageDropzone';
import evenementService from '@/services/evenementService';
import uploadService from '@/services/uploadService';
import { getPageContent } from '@/utils/helpers';
import { resolveMediaUrl } from '@/utils/media';
import { PUBLICATION_STATUS } from '@/utils/constants';

const emptyForm = {
  titre: '',
  description: '',
  contenu: '',
  lieu: '',
  typeEvenement: 'REUNION',
  dateDebut: '',
  dateFin: '',
  nombrePlacesLimitee: false,
  nombrePlacesMax: '',
  statut: PUBLICATION_STATUS.BROUILLON,
  imagePrincipale: '',
  galerieImages: [],
  dateExpiration: '',
};

const TYPE_OPTIONS = [
  { key: 'REUNION', label: 'Réunion' },
  { key: 'FORMATION', label: 'Formation' },
  { key: 'CONFERENCE', label: 'Conférence' },
  { key: 'AUTRE', label: 'Autre' },
];

export default function GestionEvenementsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showArchived, setShowArchived] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const [saving, setSaving] = useState(false);
  const [uploadingMain, setUploadingMain] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const load = () => {
    setLoading(true);
    evenementService
      .getAllAdmin()
      .then((page) => {
        const content = getPageContent(page);
        if (!showArchived) setEvents(content.filter(e => e.statut !== PUBLICATION_STATUS.ARCHIVEE));
        else setEvents(content);
      })
      .catch((err) => {
        console.error('Erreur chargement:', err);
        toast.error('Erreur de chargement');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [showArchived]);

  const runAction = async (key, fn, successMsg) => {
    setActionLoading(key);
    try {
      await fn();
      toast.success(successMsg);
      load();
      return true;
    } catch (err) {
      console.error('Erreur action:', err);
      toast.error(err.response?.data?.message || 'Erreur');
      return false;
    } finally {
      setActionLoading(null);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (evt) => {
    setEditing(evt);
    setForm({
      titre: evt.titre ?? '',
      description: evt.description ?? '',
      contenu: evt.contenu ?? '',
      lieu: evt.lieu ?? '',
      typeEvenement: evt.typeEvenement ?? 'AUTRE',
      dateDebut: evt.dateDebut?.slice(0, 16) ?? '',
      dateFin: evt.dateFin?.slice(0, 16) ?? '',
      nombrePlacesLimitee: evt.nombrePlacesLimitee ?? false,
      nombrePlacesMax: evt.nombrePlacesMax ?? '',
      statut: evt.statut ?? PUBLICATION_STATUS.BROUILLON,
      imagePrincipale: evt.imagePrincipale ?? '',
      galerieImages: Array.isArray(evt.galerieImages) ? evt.galerieImages : [],
      dateExpiration: evt.dateExpiration?.slice(0, 16) ?? '',
    });
    setModalOpen(true);
  };

  const buildPayload = () => ({
    ...form,
    nombrePlacesMax: form.nombrePlacesMax ? Number(form.nombrePlacesMax) : null,
    nombrePlacesLimitee: Boolean(form.nombrePlacesLimitee),
    galerieImages: Array.isArray(form.galerieImages) ? form.galerieImages : [],
  });

  const uploadMainImage = async (file) => {
    if (!file) return;
    setUploadingMain(true);
    try {
      const url = await uploadService.uploadEvenement(file);
      setForm((p) => ({ ...p, imagePrincipale: url }));
      toast.success('Image principale uploadée');
    } catch {
      toast.error("Échec de l'upload");
    } finally {
      setUploadingMain(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = buildPayload();
      if (editing) {
        await evenementService.update(editing.id, payload);
        toast.success('Événement mis à jour');
      } else {
        await evenementService.create(payload);
        toast.success('Événement créé');
      }
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur');
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async (id) => {
    await runAction(`pub-${id}`, () => evenementService.publier(id), 'Événement publié');
  };

  const handleArchive = (event) => {
    setConfirmAction({ type: 'archive', event });
  };

  const handleDelete = (event) => {
    setConfirmAction({ type: 'delete', event });
  };

  const handleRestore = async (event) => {
    await runAction(`rest-${event.id}`, () => evenementService.restaurer(event.id), 'Événement restauré');
  };

  if (loading) return <Loading label="Chargement…" />;

  const confirmOpen = confirmAction !== null;
  const selectedEvent = confirmAction?.event;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-lg font-bold">Gestion des événements</h1>
          <p className="mt-0.5 text-xs text-stone-600">Création, publication, médias (image + galerie)</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={showArchived ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowArchived(!showArchived)}
            className="border-stone-300 text-stone-700 text-xs"
          >
            {showArchived ? 'Masquer les archivés' : 'Voir les archivés'}
          </Button>
          <Button icon={Plus} size="sm" onClick={openCreate}>
            Nouvel événement
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white shadow-sm">
        <table className="min-w-full text-xs">
          <thead className="bg-stone-50">
            <tr>
              <th className="px-3 py-2.5 text-left font-semibold">Titre</th>
              <th className="px-3 py-2.5 text-left font-semibold">Image</th>
              <th className="px-3 py-2.5 text-left font-semibold">Lieu</th>
              <th className="px-3 py-2.5 text-left font-semibold">Statut</th>
              <th className="px-3 py-2.5 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {events.map((evt) => (
              <tr key={evt.id} className="hover:bg-[#FEF0EB]/40 transition-colors">
                <td className="px-3 py-2.5 font-medium">
                  <div className="text-stone-900">{evt.titre}</div>
                  <div className="mt-0.5 text-[10px] text-stone-500">
                    Type : <span className="font-semibold text-stone-700">{evt.typeEvenement ?? 'AUTRE'}</span>
                  </div>
                </td>
                <td className="px-3 py-2.5">
                  {evt.imagePrincipale ? (
                    <img
                      src={resolveMediaUrl(evt.imagePrincipale)}
                      alt={evt.titre}
                      className="h-10 w-14 rounded-md object-cover border border-stone-200"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  ) : (
                    <span className="text-[10px] text-stone-400">—</span>
                  )}
                </td>
                <td className="px-3 py-2.5">{evt.lieu}</td>
                <td className="px-3 py-2.5">
                  <Badge status={evt.statut} size="sm" />
                </td>
                <td className="px-3 py-2.5 text-right flex flex-wrap justify-end gap-1">
                  {evt.statut === PUBLICATION_STATUS.ARCHIVEE ? (
                    <Button
                      size="sm"
                      variant="outline"
                      icon={RotateCcw}
                      className="border-[#5BBFA0] text-[#5BBFA0] hover:bg-[#5BBFA0]/10"
                      loading={actionLoading === `rest-${evt.id}`}
                      onClick={() => handleRestore(evt)}
                    >
                      Restaurer
                    </Button>
                  ) : (
                    <>
                      <Button size="sm" variant="ghost" icon={Pencil} onClick={() => openEdit(evt)}>
                        Modifier
                      </Button>

                      {evt.statut !== PUBLICATION_STATUS.PUBLIE && (
                        <Button
                          size="sm"
                          variant="secondary"
                          icon={Upload}
                          loading={actionLoading === `pub-${evt.id}`}
                          onClick={() => handlePublish(evt.id)}
                        >
                          Publier
                        </Button>
                      )}

                      {evt.statut === PUBLICATION_STATUS.PUBLIE && (
                        <Button
                          size="sm"
                          variant="outline"
                          icon={Archive}
                          loading={actionLoading === `arch-${evt.id}`}
                          onClick={() => handleArchive(evt)}
                        >
                          Archiver
                        </Button>
                      )}

                      <Button
                        size="sm"
                        variant="danger"
                        icon={Trash2}
                        loading={actionLoading === `del-${evt.id}`}
                        onClick={() => handleDelete(evt)}
                      >
                        Suppr.
                      </Button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {events.length === 0 && (
          <p className="py-8 text-center text-xs text-stone-600">
            {showArchived ? 'Aucun événement (y compris archivés).' : 'Aucun événement actif.'}
          </p>
        )}
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title={confirmAction?.type === 'archive' ? "Archiver l'événement" : "Supprimer l'événement"}
        description={
          selectedEvent
            ? confirmAction?.type === 'archive'
              ? `Archiver l'événement "${selectedEvent.titre}" ? Il sera masqué mais pourra être restauré.`
              : `Supprimer l'événement "${selectedEvent.titre}" ? Il sera archivé et pourra être restauré.`
            : 'Êtes-vous sûr ?'
        }
        confirmText={confirmAction?.type === 'archive' ? 'Oui, archiver' : 'Oui, supprimer'}
        cancelText="Annuler"
        variant={confirmAction?.type === 'delete' ? 'danger' : 'default'}
        loading={
          selectedEvent
            ? actionLoading === `${confirmAction?.type === 'archive' ? 'arch' : 'del'}-${selectedEvent.id}`
            : false
        }
        onClose={() => setConfirmAction(null)}
        onConfirm={async () => {
          if (!selectedEvent) return;
          if (confirmAction?.type === 'archive') {
            const ok = await runAction(
              `arch-${selectedEvent.id}`,
              () => evenementService.archiver(selectedEvent.id),
              'Événement archivé'
            );
            if (ok) setConfirmAction(null);
          } else {
            const ok = await runAction(
              `del-${selectedEvent.id}`,
              () => evenementService.supprimer(selectedEvent.id),
              'Événement supprimé (archivé)'
            );
            if (ok) setConfirmAction(null);
          }
        }}
      />

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Modifier' : 'Nouvel événement'}
        size="xl"
      >
        <form onSubmit={handleSave} className="max-h-[70vh] space-y-4 overflow-y-auto pr-1">
          <div className="space-y-1.5">
            <label className="block text-xs font-medium">Image principale</label>
            {form.imagePrincipale ? (
              <div className="flex items-center gap-2">
                <img
                  src={resolveMediaUrl(form.imagePrincipale)}
                  alt=""
                  className="h-14 w-20 rounded-lg object-cover border border-stone-200"
                />
                <Button
                  type="button"
                  variant="outline"
                  icon={X}
                  size="sm"
                  onClick={() => setForm((p) => ({ ...p, imagePrincipale: '' }))}
                >
                  Retirer
                </Button>
              </div>
            ) : (
              <label className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-medium">
                <Upload className="h-3.5 w-3.5" />
                {uploadingMain ? 'Upload…' : 'Uploader une image'}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={uploadingMain}
                  onChange={(e) => uploadMainImage(e.target.files?.[0])}
                />
              </label>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium">Galerie (plusieurs images)</label>
            <ImageDropzone
              images={form.galerieImages}
              onChange={(imgs) => setForm((p) => ({ ...p, galerieImages: imgs }))}
              uploadFn={uploadService.uploadEvenement}
            />
          </div>

          <section className="rounded-xl border border-stone-200 bg-stone-50 p-3">
            <h3 className="mb-2 text-xs font-semibold text-stone-800">Type d&apos;événement</h3>
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
                      <p className="text-[10px] text-stone-500">Catégorisation pour statistiques</p>
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
          </section>

          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              label="Titre"
              value={form.titre}
              onChange={(e) => setForm((p) => ({ ...p, titre: e.target.value }))}
              required
              containerClassName="sm:col-span-2"
            />
            <Input label="Lieu" value={form.lieu} onChange={(e) => setForm((p) => ({ ...p, lieu: e.target.value }))} />
            <Input
              label="Places max"
              type="number"
              value={form.nombrePlacesMax}
              onChange={(e) => setForm((p) => ({ ...p, nombrePlacesMax: e.target.value }))}
            />
            <Input
              label="Début"
              type="datetime-local"
              value={form.dateDebut}
              onChange={(e) => setForm((p) => ({ ...p, dateDebut: e.target.value }))}
              required
            />
            <Input
              label="Fin"
              type="datetime-local"
              value={form.dateFin}
              onChange={(e) => setForm((p) => ({ ...p, dateFin: e.target.value }))}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium">Description</label>
            <textarea
              className="w-full rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 text-xs"
              rows={3}
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium">Contenu (optionnel)</label>
            <textarea
              className="w-full rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 text-xs"
              rows={3}
              value={form.contenu}
              onChange={(e) => setForm((p) => ({ ...p, contenu: e.target.value }))}
            />
          </div>

          <label className="flex items-center gap-2 text-xs">
            <input
              type="checkbox"
              checked={form.nombrePlacesLimitee}
              onChange={(e) => setForm((p) => ({ ...p, nombrePlacesLimitee: e.target.checked }))}
            />
            Places limitées
          </label>

          <div className="flex justify-end gap-2 border-t border-stone-200 pt-3">
            <Button type="button" variant="outline" size="sm" onClick={() => setModalOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" size="sm" loading={saving || uploadingMain}>
              Enregistrer
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}