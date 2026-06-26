import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Button from '@/components/ui/Button';
import Loading from '@/components/ui/Loading';
import userService from '@/services/userService';
import { ROLES } from '@/utils/constants';

export default function GestionUsersPage() {
  const [users, setUsers] = useState([]);
  const [actifMap, setActifMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(null);

  const load = () => {
    setLoading(true);
    userService
      .getAll()
      .then((list) => {
        const demandeurs = list.filter((u) => u.role === ROLES.DEMANDEUR);
        setUsers(demandeurs);
        const map = {};
        demandeurs.forEach((u) => {
          map[u.id] = u.actif !== false;
        });
        setActifMap(map);
      })
      .catch(() => toast.error('Erreur de chargement'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const toggleActif = async (id) => {
    const next = !actifMap[id];
    setToggling(id);
    try {
      await userService.setActif(id, next);
      setActifMap((p) => ({ ...p, [id]: next }));
      toast.success(next ? 'Compte activé' : 'Compte désactivé');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur');
    } finally {
      setToggling(null);
    }
  };

  if (loading) return <Loading label="Chargement…" />;

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
        <h1 className="font-display text-lg font-bold text-stone-800">Gestion des demandeurs</h1>
        <p className="text-xs text-stone-600">Activer ou désactiver les comptes</p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white shadow-sm">
        <table className="min-w-full text-xs">
          <thead className="bg-stone-50">
            <tr>
              <th className="px-3 py-2.5 text-left font-semibold text-stone-700">Nom</th>
              <th className="px-3 py-2.5 text-left font-semibold text-stone-700">Email</th>
              <th className="px-3 py-2.5 text-left font-semibold text-stone-700">Type</th>
              <th className="px-3 py-2.5 text-left font-semibold text-stone-700">Statut</th>
              <th className="px-3 py-2.5 text-right font-semibold text-stone-700">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-stone-100">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-[#FEF0EB]/40 transition-colors">
                <td className="px-3 py-2.5 text-stone-800">
                  {u.prenom} {u.nom}
                </td>
                <td className="px-3 py-2.5 text-stone-700">{u.email}</td>
                <td className="px-3 py-2.5 text-stone-700">{u.type || '—'}</td>
                <td className="px-3 py-2.5">
                  <span className={actifMap[u.id] ? 'text-emerald-700 font-medium' : 'text-red-600 font-medium'}>
                    {actifMap[u.id] ? 'Actif' : 'Inactif'}
                  </span>
                </td>
                <td className="px-3 py-2.5 text-right">
                  <Button
                    size="sm"
                    variant={actifMap[u.id] ? 'danger' : 'primary'}
                    loading={toggling === u.id}
                    onClick={() => toggleActif(u.id)}
                    className={
                      actifMap[u.id]
                        ? undefined
                        : 'bg-[#5BBFA0] hover:bg-[#4AA88D] text-white border-transparent'
                    }
                  >
                    {actifMap[u.id] ? 'Désactiver' : 'Activer'}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {users.length === 0 && (
          <p className="py-8 text-center text-xs text-stone-600">Aucun demandeur.</p>
        )}
      </div>
    </div>
  );
}