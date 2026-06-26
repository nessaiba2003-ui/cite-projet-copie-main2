import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Users, Video, View } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { LOCAL_STATUS } from '@/utils/constants';
import { getPoleColor, labelTypeLocal } from '@/utils/poles';

export default function LocalImmersiveCard({ local, index = 0 }) {
  const imageUrl = local.images?.[0];
  const poleColor = getPoleColor(local);

  return (
    <motion.article
      className="group overflow-hidden rounded-2xl border bg-white shadow-sm dark:bg-[#14110F] dark:border-stone-800"
      style={{ borderColor: `${poleColor}55` }}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.45 }}
      whileHover={{ y: -6, transition: { duration: 0.18 } }}
    >
      <motion.div className="relative h-36 overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt=""
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="h-full bg-gradient-to-br from-[#FEF0EB] to-[#FFF6E8] dark:from-[#1C1815] dark:to-[#14110F]" />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" aria-hidden />

        <Badge status={local.statut ?? LOCAL_STATUS.DISPONIBLE} size="sm" className="absolute right-3 top-3" />

        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="font-display text-lg font-bold text-white">{local.nom}</h3>
          <p className="text-xs text-white/85">
            {local.code}
            {local.typeLocal && ` · ${labelTypeLocal(local.typeLocal)}`}
          </p>
        </div>
      </motion.div>

      <div className="space-y-3 p-4">
        {local.description && (
          <p className="line-clamp-2 text-sm text-stone-600 dark:text-stone-300">{local.description}</p>
        )}

        <div className="flex flex-wrap gap-3 text-xs text-stone-600 dark:text-stone-300">
          {local.localisation && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-[var(--color-primary)]" />
              {local.localisation}
            </span>
          )}
          {local.capacite != null && (
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5 text-[var(--color-primary)]" />
              {local.capacite} pers.
            </span>
          )}
          {local.videoUrl && (
            <span className="flex items-center gap-1">
              <Video className="h-3.5 w-3.5 text-[var(--color-lavender)]" />
              Vidéo
            </span>
          )}
          {local.panoramaUrl && (
            <span className="flex items-center gap-1">
              <View className="h-3.5 w-3.5 text-[var(--color-lavender)]" />
              360°
            </span>
          )}
        </div>

        <div className="flex gap-2 pt-1">
          <Link to={`/demandeur/locaux/${local.id}`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full">
              Visiter
            </Button>
          </Link>
          <Link to={`/demandeur/reservation/${local.id}`} className="flex-1">
            <Button
              variant="secondary"
              size="sm"
              className="w-full bg-[var(--color-secondary)] hover:bg-[var(--color-secondary-dark)] text-white border-transparent"
            >
              Réserver
            </Button>
          </Link>
        </div>
      </div>
    </motion.article>
  );
}