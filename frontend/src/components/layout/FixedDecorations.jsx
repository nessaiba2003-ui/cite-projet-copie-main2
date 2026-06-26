export default function FixedDecorations({ items = [] }) {
  return (
    <div className="pointer-events-none select-none" aria-hidden="true">
      {items.map((it, idx) => (
        <div
          key={it.key ?? idx}
          className={it.className}
          style={{
            backgroundImage: `url('${it.src}')`,
            backgroundRepeat: 'no-repeat',
            backgroundSize: it.backgroundSize ?? 'contain',
            backgroundPosition: it.backgroundPosition ?? 'center',
            opacity: it.opacity ?? 0.16,
            transform: it.rotate ? `rotate(${it.rotate}deg)` : undefined,
            filter: it.blur ? `blur(${it.blur}px)` : undefined,

            // fondu élégant vers l'intérieur (optionnel)
            WebkitMaskImage: it.maskImage,
            maskImage: it.maskImage,

            ...it.style,
          }}
        />
      ))}
    </div>
  );
}