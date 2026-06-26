import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw } from 'lucide-react';

export default function PanoramaViewer({ url, className = '' }) {
  const [offset, setOffset] = useState(0);
  const dragging = useRef(false);
  const startX = useRef(0);

  if (!url) {
    return (
      <motion.div
        className={`flex h-64 items-center justify-center rounded-2xl bg-stone-100 text-stone-500 dark:bg-[#1C1815] dark:text-stone-300 ${className}`}
      >
        Panorama 360° non disponible
      </motion.div>
    );
  }

  const onPointerDown = (e) => {
    dragging.current = true;
    startX.current = e.clientX;
  };
  const onPointerMove = (e) => {
    if (!dragging.current) return;
    setOffset((o) => o + (e.clientX - startX.current) * 0.4);
    startX.current = e.clientX;
  };
  const onPointerUp = () => {
    dragging.current = false;
  };

  return (
    <motion.div
      className={`relative h-80 overflow-hidden rounded-2xl ${className}`}
      initial={{ opacity: 0, scale: 0.985 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <motion.div
        className="absolute inset-0 cursor-grab active:cursor-grabbing"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      >
        <img
          src={url}
          alt="Vue panoramique 360°"
          className="h-full min-w-[240%] max-w-none select-none object-cover"
          style={{ transform: `translateX(${offset % 800}px)` }}
          draggable={false}
        />
      </motion.div>

      <motion.div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-black/15" aria-hidden />

      <p className="pointer-events-none absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-black/55 px-3 py-1.5 text-xs text-white/90 backdrop-blur-sm">
        <RotateCcw className="h-3.5 w-3.5" />
        Glissez pour explorer en 360°
      </p>
    </motion.div>
  );
}