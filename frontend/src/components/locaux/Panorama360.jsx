import { useEffect, useRef, useState } from 'react';
import { RotateCcw } from 'lucide-react';

export default function Panorama360({ imageUrl, height = '450px', label = 'Vue 360' }) {
  const viewerRef = useRef(null);
  const pannellumInstance = useRef(null);
  const dragging = useRef(false);
  const startX = useRef(0);
  const [offset, setOffset] = useState(0);
  const [useFallback, setUseFallback] = useState(false);

  useEffect(() => {
    setUseFallback(false);
    setOffset(0);
  }, [imageUrl]);

  useEffect(() => {
    if (!imageUrl || !viewerRef.current) return undefined;
    let cancelled = false;
    let loadingTimer;

    if (pannellumInstance.current) {
      pannellumInstance.current.destroy();
      pannellumInstance.current = null;
    }

    if (!window.pannellum?.viewer) {
      setUseFallback(true);
      return undefined;
    }

    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => {
      if (cancelled || !viewerRef.current) return;

      try {
        pannellumInstance.current = window.pannellum.viewer(viewerRef.current, {
          type: 'equirectangular',
          panorama: imageUrl,
          autoLoad: true,
          autoRotate: -2,
          compass: true,
          crossOrigin: 'anonymous',
        });

        loadingTimer = window.setTimeout(() => {
          const canvas = viewerRef.current?.querySelector('canvas');
          if (!cancelled && !canvas) setUseFallback(true);
        }, 5000);
      } catch (err) {
        console.error('Erreur chargement panorama:', err);
        setUseFallback(true);
      }
    };
    image.onerror = () => {
      if (!cancelled) setUseFallback(true);
    };
    image.src = imageUrl;

    return () => {
      cancelled = true;
      if (loadingTimer) window.clearTimeout(loadingTimer);
      if (pannellumInstance.current) {
        pannellumInstance.current.destroy();
        pannellumInstance.current = null;
      }
    };
  }, [imageUrl]);

  const onPointerDown = (e) => {
    dragging.current = true;
    startX.current = e.clientX;
  };

  const onPointerMove = (e) => {
    if (!dragging.current) return;
    setOffset((value) => value + (e.clientX - startX.current) * 0.45);
    startX.current = e.clientX;
  };

  const stopDragging = () => {
    dragging.current = false;
  };

  if (!imageUrl) {
    return (
      <div className="flex items-center justify-center rounded-2xl border-2 border-dashed border-stone-300 bg-stone-50 py-20">
        <div className="text-center text-stone-500">
          <p className="text-lg font-medium">Aucune vue disponible</p>
          <p className="mt-1 text-sm">Ajoutez une photo ou un panorama pour ce local.</p>
        </div>
      </div>
    );
  }

  if (useFallback) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-stone-200 bg-stone-100 shadow-lg">
        <div
          className="relative cursor-grab overflow-hidden active:cursor-grabbing"
          style={{ height }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={stopDragging}
          onPointerLeave={stopDragging}
        >
          <img
            src={imageUrl}
            alt={label}
            className="h-full min-w-[190%] max-w-none select-none object-cover"
            style={{ transform: `translateX(${offset % 650}px)` }}
            draggable={false}
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-black/10" />
        </div>
        <div className="pointer-events-none absolute left-4 top-4 rounded-full bg-black/70 px-3 py-1.5 text-xs font-medium text-white">
          Vue photo 360 - glissez pour explorer
        </div>
        <p className="pointer-events-none absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-black/55 px-3 py-1.5 text-xs text-white/90 backdrop-blur-sm">
          <RotateCcw className="h-3.5 w-3.5" />
          Glissez l'image
        </p>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-stone-200 shadow-lg">
      <div ref={viewerRef} style={{ height }} className="w-full bg-stone-100" />
      <div className="absolute left-4 top-4 rounded-full bg-black/70 px-3 py-1.5 text-xs font-medium text-white">
        Vue 360 - glissez pour explorer
      </div>
    </div>
  );
}
