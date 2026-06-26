import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Loading from '@/components/ui/Loading';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import LocalFormModal from '@/components/locaux/LocalFormModal';
import localService from '@/services/localService';
import poleService from '@/services/poleService';
import { labelTypeLocal } from '@/utils/poles';
import { getFloorLabel, inferEtage } from '@/utils/floorHelpers';

export default function GestionLocauxPage() {
  const [locaux, setLocaux] = useState([]);
  const [poles, setPoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([localService.getAll(), poleService.getAll()])
      .then(([l, p]) => {
        setLocaux(l);
        setPoles(p);
      })
      .catch(() => toast.error('Erreur de chargement'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleSave = async (payload) => {
    setSaving(true);
    try {
      if (editing) {
        await localService.update(editing.id, payload);
        toast.success('Local mis à jour');
      } else {
        await localService.create(payload);
        toast.success('Local créé');
      }
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (local) => {
    setDeleteTarget(local);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await localService.delete(deleteTarget.id);
      toast.success('Local supprimé');
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Impossible de supprimer');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <Loading label="Chargement…" />;

  return (
    <div className="admin-page space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-lg font-bold text-stone-800">Gestion des locaux</h1>
          <p className="mt-0.5 text-xs text-stone-600">Création, modification et suivi des espaces</p>
        </div>

        <Button
          icon={Plus}
          size="sm"
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
          className="bg-[#E07A5F] hover:bg-[#C96A50] text-white border-transparent"
        >
          Nouveau local
        </Button>
      </div>

      <div className="admin-table-card overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="admin-table min-w-full text-xs">
            <thead>
              <tr className="border-b border-stone-200 bg-stone-50">
                <th className="px-3 py-2.5 text-left font-semibold text-stone-700">Code</th>
                <th className="px-3 py-2.5 text-left font-semibold text-stone-700">Nom</th>
                <th className="px-3 py-2.5 text-left font-semibold text-stone-700">Étage</th>
                <th className="px-3 py-2.5 text-left font-semibold text-stone-700">Type</th>
                <th className="px-3 py-2.5 text-left font-semibold text-stone-700">Capacité</th>
                <th className="px-3 py-2.5 text-left font-semibold text-stone-700">Statut</th>
                <th className="px-3 py-2.5 text-right font-semibold text-stone-700">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-stone-100">
              {locaux.map((l) => (
                <tr key={l.id} className="bg-transparent transition-colors hover:bg-[#FEF0EB]/40">
                  <td className="px-3 py-2.5 font-medium text-stone-800">{l.code || '—'}</td>

                  <td className="px-3 py-2.5 text-stone-800">
                    <div className="flex items-center gap-2">
                      {l.images?.[0] ? (
                        <img
                          src={l.images[0]}
                          alt=""
                          className="h-8 w-12 shrink-0 rounded-md border border-stone-200 object-cover"
                        />
                      ) : (
                        <span className="flex h-8 w-12 shrink-0 items-center justify-center rounded-md bg-stone-100 text-[10px] text-stone-400">
                          —
                        </span>
                      )}
                      <span>{l.nom || '—'}</span>
                    </div>
                  </td>

                  <td className="px-3 py-2.5">
                    <span className="rounded-md bg-stone-100 px-1.5 py-0.5 text-[10px] font-medium text-stone-700 border border-stone-200">
                      {getFloorLabel(inferEtage(l))}
                    </span>
                  </td>

                  <td className="px-3 py-2.5 text-stone-600">
                    {l.typeLocal ? labelTypeLocal(l.typeLocal) : '—'}
                  </td>

                  <td className="px-3 py-2.5 text-stone-800">{l.capacite ?? '—'}</td>

                  <td className="px-3 py-2.5">
                    <Badge status={l.statut} size="sm" />
                  </td>

                  <td className="px-3 py-2.5 text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={Pencil}
                        className="!text-[#E07A5F] hover:!bg-[#E07A5F]/10"
                        onClick={() => {
                          setEditing(l);
                          setModalOpen(true);
                        }}
                      >
                        Modifier
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        icon={Trash2}
                        className="!text-red-600 hover:!bg-red-50"
                        onClick={() => handleDelete(l)}
                      >
                        Suppr.
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {locaux.length === 0 && (
          <p className="py-8 text-center text-xs text-stone-600">Aucun local enregistré.</p>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Supprimer le local"
        description={
          deleteTarget
            ? `Supprimer "${deleteTarget.nom}" (${deleteTarget.code}) ? Cette action est irréversible.`
            : 'Supprimer ce local ?'
        }
        confirmText="Supprimer"
        cancelText="Annuler"
        variant="danger"
        loading={deleting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />

      <LocalFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        editing={editing}
        poles={poles}
        onSave={handleSave}
        saving={saving}
      />
    </div>
  );
}