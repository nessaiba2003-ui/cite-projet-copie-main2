import { Link } from 'react-router-dom';
import { Mail, MapPin, ExternalLink, ArrowRight } from 'lucide-react';
import { APP_NAME } from '../../utils/constants';

// ===== PALETTE STRICTE : 4 COULEURS UNIQUEMENT =====
const POLE_COLORS = {
  green: '#16A34A',  // Vert foncé
  blue:  '#60A5FA',  // Bleu clair
  pink:  '#DB2777',  // Rose foncé
  gold:  '#D4AF37',  // Doré
};

// Style aurora multicolore pour le titre
const auroraTextStyle = {
  backgroundImage: `linear-gradient(110deg, ${POLE_COLORS.green} 0%, ${POLE_COLORS.blue} 33%, ${POLE_COLORS.pink} 66%, ${POLE_COLORS.gold} 100%)`,
  backgroundSize: '200% auto',
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  color: 'transparent',
  filter: `drop-shadow(0 2px 10px rgba(219, 39, 119, 0.25)) drop-shadow(0 0 20px rgba(96, 165, 250, 0.20))`,
  animation: 'auroraShift 8s ease-in-out infinite',
};

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-auto w-full bg-gradient-to-b from-white to-[#FAF6F2] border-t border-stone-200">
      <style>{`
        @keyframes auroraShift {
          0%, 100% { background-position: 0% center; }
          50% { background-position: 100% center; }
        }
      `}</style>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid gap-10 md:grid-cols-3">
          {/* Colonne 1 : À propos */}
          <div>
            <h3 className="font-display text-lg font-extrabold mb-3" style={auroraTextStyle}>
              {APP_NAME}
            </h3>
            <p className="text-sm text-stone-600 leading-relaxed">
              Plateforme de réservation de locaux et d&apos;inscription aux événements de la
              Cité d&apos;Innovation — Université Cadi Ayyad.
            </p>
          </div>

          {/* Colonne 2 : Navigation */}
          <div>
            <h3
              className="font-display text-lg font-extrabold mb-3"
              style={{ color: POLE_COLORS.pink }}
            >
              Navigation
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/annonces" className="text-stone-600 hover:text-[#DB2777] transition-colors">
                  Annonces
                </Link>
              </li>
              <li>
                <Link to="/evenements" className="text-stone-600 hover:text-[#16A34A] transition-colors">
                  Événements
                </Link>
              </li>
              <li>
                <Link to="/locaux" className="text-stone-600 hover:text-[#60A5FA] transition-colors">
                  Locaux disponibles
                </Link>
              </li>
              <li>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-stone-600 hover:text-[#D4AF37] transition-colors font-semibold"
                >
                  Connexion <ArrowRight className="h-3 w-3" />
                </Link>
              </li>
              <li>
                <a
                  href="https://www.uca.ma/fr"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-stone-600 hover:text-[#60A5FA] transition-colors font-semibold"
                >
                  Université Cadi Ayyad <ExternalLink className="h-3 w-3" />
                </a>
              </li>
            </ul>
          </div>

          {/* Colonne 3 : Contact */}
          <div>
            <h3
              className="font-display text-lg font-extrabold mb-3"
              style={{ color: POLE_COLORS.gold }}
            >
              Contact
            </h3>
            <ul className="space-y-2 text-sm text-stone-600">
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4" style={{ color: POLE_COLORS.pink }} />
                Marrakech, Maroc
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4" style={{ color: POLE_COLORS.blue }} />
                <a
                  href="mailto:contact@cite-innovation.ma"
                  className="hover:text-[#60A5FA] transition-colors"
                >
                  contact@cite-innovation.ma
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Barre dégradée */}
        <div
          className="my-8 h-px"
          style={{
            background: `linear-gradient(90deg, transparent, ${POLE_COLORS.green}, ${POLE_COLORS.blue}, ${POLE_COLORS.pink}, ${POLE_COLORS.gold}, transparent)`,
          }}
        />

        <div className="text-center text-sm text-stone-500">
          © {year} {APP_NAME}. Tous droits réservés.
        </div>
      </div>
    </footer>
  );
}