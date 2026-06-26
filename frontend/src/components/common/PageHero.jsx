import { motion } from 'framer-motion';

export default function PageHero({ title, subtitle, children }) {
  return (
    <section className="relative overflow-hidden px-4 py-16 sm:px-6 lg:px-20">
      {/* Base bg */}
      <div className="absolute inset-0 bg-[#FBF9F7] dark:bg-[#14110F]" aria-hidden />

      {/* Pastel glow */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(1200px 600px at 20% 25%, rgba(224,122,95,.26), transparent 60%),' +
            'radial-gradient(900px 520px at 80% 18%, rgba(242,204,143,.22), transparent 55%),' +
            'radial-gradient(900px 520px at 65% 85%, rgba(91,191,160,.18), transparent 55%)',
        }}
        aria-hidden
      />

      {/* Subtle pattern */}
      <div
        className="absolute inset-0 opacity-[0.06] dark:opacity-[0.10]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgba(41,37,36,.75) 1px, transparent 0)',
          backgroundSize: '38px 38px',
        }}
        aria-hidden
      />

      <motion.div
        className="relative z-10 mx-auto max-w-5xl text-center"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="font-display text-3xl font-bold sm:text-4xl lg:text-5xl text-stone-900 dark:text-stone-100">
          {title}
        </h1>

        {subtitle && (
          <p className="mx-auto mt-4 max-w-2xl text-lg text-stone-600 dark:text-stone-300">
            {subtitle}
          </p>
        )}

        {children}
      </motion.div>
    </section>
  );
}
