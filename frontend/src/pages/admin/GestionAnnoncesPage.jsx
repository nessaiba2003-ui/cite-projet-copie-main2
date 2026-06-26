import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Upload, X, Paperclip } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import Loading from '@/components/ui/Loading';
import annonceService from '@/services/annonceService';
import api from '@/services/api';
import uploadService from '@/services/uploadService';
import { getPageContent } from '@/utils/helpers';

const PRIORITIES = ['IMPORTANT', 'NORMAL', 'INFO'];

const emptyForm = {
  titre: '',
  contenu: '',
  priorite: 'NORMAL',
  dateExpiration: '',
  statut: 'PUBLIE',
  image: '',
  pieceJointe: '',
  poleId: null,
};

export default function GestionAnnoncesPage() {
  const [annonces, setAnnonces] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const load = () => {
    setLoading(true);
    annonceService
      .getAllAdmin()
      .then((page) => setAnnonces(getPageContent(page)))
      .catch(() => toast.error('Erreur de chargement'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (a) => {
    setEditing(a);
    setForm({
      titre: a.titre ?? '',
      contenu: a.contenu ?? '',
      priorite: a.priorite ?? 'NORMAL',
      dateExpiration: a.dateExpiration?.slice(0, 16) ?? '',
      statut: a.statut ?? 'PUBLIE',
      image: a.image ?? '',
      pieceJointe: a.pieceJointe ?? '',
      poleId: a.poleId ?? null,
    });
    setModalOpen(true);
  };

  const uploadToField = async (file, field) => {
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadService.uploadAnnonce(file);
      setForm((p) => ({ ...p, [field]: url }));
      toast.success(field === 'image' ? 'Image uploadée' : 'Pièce jointe uploadée');
    } catch {
      toast.error("Échec de l'upload");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        poleId: form.poleId ? Number(form.poleId) : null,
      };

      if (editing) {
        await annonceService.update(editing.id, payload);
        toast.success('Annonce mise à jour');
      } else {
        await annonceService.create(payload);
        toast.success('Annonce créée');
      }
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette annonce ?')) return;
    try {
      await api.delete(`/annonces/${id}`);
      toast.success('Annonce supprimée');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur');
    }
  };

  if (loading) return <Loading label="Chargement…" />;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-lg font-bold">Gestion des annonces</h1>
        <Button icon={Plus} onClick={openCreate} size="sm">
          Nouvelle annonce
        </Button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white shadow-sm">
        <table className="min-w-full text-xs">
          <thead className="bg-stone-50">
            <tr>
              <th className="px-3 py-2.5 text-left font-semibold">Titre</th>
              <th className="px-3 py-2.5 text-left font-semibold">Média</th>
              <th className="px-3 py-2.5 text-left font-semibold">Priorité</th>
              <th className="px-3 py-2.5 text-left font-semibold">Statut</th>
              <th className="px-3 py-2.5 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {annonces.map((a) => (
              <tr key={a.id}>
                <td className="px-3 py-2.5 font-medium">{a.titre}</td>
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-1.5">
                    {a.image ? (
                      <img
                        src={a.image}
                        alt=""
                        className="h-7 w-10 rounded-md object-cover border"
                      />
                    ) : (
                      <span className="text-[10px] text-stone-400">—</span>
                    )}
                    {a.pieceJointe ? <Paperclip className="h-3.5 w-3.5 text-stone-500" /> : null}
                  </div>
                </td>
                <td className="px-3 py-2.5">
                  <span className="rounded-full bg-stone-100 px-1.5 py-0.5 text-[10px] border border-stone-200">
                    {a.priorite}
                  </span>
                </td>
                <td className="px-3 py-2.5">
                  <Badge status={a.statut} size="sm" />
                </td>
                <td className="px-3 py-2.5 text-right flex justify-end gap-1">
                  <Button size="sm" variant="ghost" icon={Pencil} onClick={() => openEdit(a)} />
                  <Button size="sm" variant="danger" icon={Trash2} onClick={() => handleDelete(a.id)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Modifier annonce' : 'Nouvelle annonce'}
        size="lg"
      >
        <form onSubmit={handleSave} className="space-y-3">
          <Input
            label="Titre"
            value={form.titre}
            onChange={(e) => setForm((p) => ({ ...p, titre: e.target.value }))}
            required
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-medium">Image</label>
            {form.image ? (
              <div className="flex items-center gap-2">
                <img src={form.image} alt="" className="h-14 w-20 rounded-lg object-cover border" />
                <Button
                  type="button"
                  variant="outline"
                  icon={X}
                  size="sm"
                  onClick={() => setForm((p) => ({ ...p, image: '' }))}
                >
                  Retirer
                </Button>
              </div>
            ) : (
              <label className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-medium">
                <Upload className="h-3.5 w-3.5" />
                {uploading ? 'Upload…' : 'Uploader une image'}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={uploading}
                  onChange={(e) => uploadToField(e.target.files?.[0], 'image')}
                />
              </label>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium">Pièce jointe</label>
            {form.pieceJointe ? (
              <div className="flex items-center gap-2">
                <a
                  href={form.pieceJointe}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs underline"
                >
                  Ouvrir la pièce jointe
                </a>
                <Button
                  type="button"
                  variant="outline"
                  icon={X}
                  size="sm"
                  onClick={() => setForm((p) => ({ ...p, pieceJointe: '' }))}
                >
                  Retirer
                </Button>
              </div>
            ) : (
              <label className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-medium">
                <Upload className="h-3.5 w-3.5" />
                {uploading ? 'Upload…' : 'Uploader un fichier'}
                <input
                  type="file"
                  className="hidden"
                  disabled={uploading}
                  onChange={(e) => uploadToField(e.target.files?.[0], 'pieceJointe')}
                />
              </label>
            )}
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium">Priorité</label>
            <select
              className="w-full rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 text-xs"
              value={form.priorite}
              onChange={(e) => setForm((p) => ({ ...p, priorite: e.target.value }))}
            >
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium">Contenu</label>
            <textarea
              className="w-full rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 text-xs"
              rows={4}
              value={form.contenu}
              onChange={(e) => setForm((p) => ({ ...p, contenu: e.target.value }))}
              required
            />
          </div>

          <Input
            label="Expiration"
            type="datetime-local"
            value={form.dateExpiration}
            onChange={(e) => setForm((p) => ({ ...p, dateExpiration: e.target.value }))}
          />

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setModalOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" size="sm" loading={saving || uploading}>
              Enregistrer
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}