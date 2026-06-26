import { Link, useLocation } from 'react-router-dom';
import Button from '@/components/ui/Button';

export default function ImmersionQuickLinkBar() {
  const { pathname } = useLocation();
  const active = pathname.startsWith('/immersion');

  return (
    <div className="border-b border-stone-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-2">
        <p className="text-xs text-stone-600">
          Découvrez la Cité en mode interactif (ascenseur, étages, locaux, médias, 360°).
        </p>

        <Link to="/immersion">
          <Button
            size="sm"
            className={`border-transparent ${
              active
                ? 'bg-[#E07A5F] text-white hover:bg-[#C96A50]'
                : 'bg-stone-900 text-white hover:bg-stone-800'
            }`}
          >
            Visite immersive
          </Button>
        </Link>
      </div>
    </div>
  );
}