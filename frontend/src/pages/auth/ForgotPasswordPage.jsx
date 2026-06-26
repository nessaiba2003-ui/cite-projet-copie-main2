import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, Send, CheckCircle2, KeyRound } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Veuillez saisir votre email');
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setSent(true);
    setLoading(false);
    toast.success('Si un compte existe, un email a été envoyé.');
  };

  return (
    <div className="relative w-full min-h-screen bg-[#F5F7FA] overflow-hidden px-4 py-8">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute top-16 -left-24 h-72 w-72 rounded-full bg-[#E07A5F]/12 blur-3xl animate-aurora-slow" />
        <div className="absolute bottom-16 -right-24 h-72 w-72 rounded-full bg-[#9B8EC4]/12 blur-3xl animate-aurora" />
        <div
          className="absolute top-1/2 left-1/3 h-56 w-56 rounded-full bg-[#5BBFA0]/10 blur-3xl animate-aurora-slow"
          style={{ animationDelay: '-10s' }}
        />
      </div>

      <div className="relative mx-auto w-full max-w-sm mt-8">
        <Link
          to="/login"
          className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-white border border-stone-200 px-3.5 py-1.5 text-xs font-semibold text-stone-700 hover:border-[#E07A5F] hover:text-[#C96A50] hover:shadow-md hover:shadow-[#E07A5F]/15 transition-all"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Retour à la connexion
        </Link>

        <motion.div
          className="overflow-hidden rounded-2xl border border-stone-200/70 bg-white transition-all duration-300"
          style={{ boxShadow: '0 16px 40px -15px rgba(224, 122, 95, 0.25)' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="h-1 bg-gradient-to-r from-[#E07A5F] via-[#F2CC8F] to-[#5BBFA0]" />

          <div className="p-6">
            <div className="text-center">
              <motion.div
                className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#E07A5F] to-[#F2CC8F] shadow-lg shadow-[#E07A5F]/30"
                initial={{ scale: 0.8, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              >
                <KeyRound className="h-6 w-6 text-white drop-shadow" />
              </motion.div>
              <h1 className="mt-3 font-display text-lg font-extrabold text-stone-900 tracking-tight">
                Mot de passe oublié
              </h1>
              <p className="mt-1 text-xs text-stone-600">
                {sent ? 'Vérifiez votre boîte mail' : 'Recevez un lien de réinitialisation'}
              </p>
            </div>

            <div className="mt-5">
              {sent ? (
                <motion.div
                  className="space-y-3"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="flex items-start gap-2.5 rounded-xl bg-gradient-to-br from-[#F0FAF5] to-[#E8F5EF] border border-[#5BBFA0]/30 p-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#5BBFA0] to-[#7DD4B8] shadow-md shadow-[#5BBFA0]/30">
                      <CheckCircle2 className="h-4 w-4 text-white" />
                    </div>
                    <div className="text-xs text-stone-700">
                      <p className="font-semibold text-[#3D8B74]">Demande envoyée</p>
                      <p className="mt-0.5">
                        Si un compte existe à l&apos;adresse{' '}
                        <strong className="text-stone-900">{email}</strong>, vous recevrez un lien
                        de réinitialisation.
                      </p>
                    </div>
                  </div>

                  <div className="rounded-xl border border-stone-200 bg-gradient-to-br from-[#FEF4F1]/40 to-white p-3 text-xs text-stone-700">
                    <p className="font-semibold text-stone-800 mb-0.5">Pas reçu ?</p>
                    <p>Vérifiez vos spams ou réessayez dans quelques minutes.</p>
                  </div>

                  <Link to="/login" className="block">
                    <button
                      type="button"
                      className="group w-full inline-flex items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-[#E07A5F] to-[#E8956F] px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-[#E07A5F]/30 transition-all duration-300 hover:shadow-xl hover:shadow-[#E07A5F]/45 hover:-translate-y-0.5"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" />
                      Retour à la connexion
                    </button>
                  </Link>
                </motion.div>
              ) : (
                <motion.form
                  onSubmit={handleSubmit}
                  className="space-y-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <p className="text-xs text-stone-600 leading-relaxed">
                    Saisissez votre email administrateur. Nous vous enverrons un lien sécurisé pour
                    définir un nouveau mot de passe.
                  </p>

                  <div>
                    <label
                      htmlFor="forgot-email"
                      className="mb-1 block text-xs font-semibold text-stone-700"
                    >
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#E07A5F]" />
                      <input
                        id="forgot-email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="cim-field w-full rounded-xl border border-stone-200 bg-white pl-9 pr-3 py-2 text-xs text-stone-800 placeholder:text-stone-400 focus:border-[#E07A5F] focus:outline-none focus:ring-4 focus:ring-[#E07A5F]/15"
                        placeholder="admin@cite-innovation.ma"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="group w-full inline-flex items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-[#E07A5F] to-[#E8956F] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#E07A5F]/35 transition-all duration-300 hover:shadow-xl hover:shadow-[#E07A5F]/50 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                  >
                    {loading ? (
                      <span className="flex items-center gap-1.5">
                        <span className="h-3.5 w-3.5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                        Envoi…
                      </span>
                    ) : (
                      <>
                        <Send className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
                        Envoyer le lien
                      </>
                    )}
                  </button>

                  <Link
                    to="/login"
                    className="block text-center text-xs font-semibold text-[#E07A5F] hover:text-[#C96A50] hover:underline transition-colors"
                  >
                    Retour à la connexion
                  </Link>
                </motion.form>
              )}
            </div>
          </div>
        </motion.div>

        <motion.p
          className="mt-4 text-center text-[10px] text-stone-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Accès réservé aux administrateurs autorisés.
        </motion.p>
      </div>
    </div>
  );
}