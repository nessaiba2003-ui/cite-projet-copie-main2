import { Link } from 'react-router-dom';
import { ShieldX } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function AccessDeniedPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center bg-[#FBF9F7]">
      <div className="mb-4 rounded-2xl bg-red-500/10 p-4 shadow-[0_12px_30px_rgba(239,68,68,0.12)] border border-red-200">
        <ShieldX className="h-12 w-12 text-red-600" />
      </div>

      <h1 className="font-display text-2xl font-bold text-stone-800">Accès refusé</h1>
      <p className="mt-2 max-w-md text-stone-600">
        Vous n&apos;avez pas les permissions nécessaires pour accéder à cette page.
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link to="/">
          <Button className="bg-[#E07A5F] hover:bg-[#C96A50] text-white border-transparent">
            Retour à l&apos;accueil
          </Button>
        </Link>
        <Link to="/login">
          <Button variant="outline" className="border-stone-300 text-stone-700 hover:bg-stone-50">
            Connexion
          </Button>
        </Link>
      </div>
    </div>
  );
}